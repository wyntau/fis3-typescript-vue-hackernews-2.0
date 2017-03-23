var pkg = require('./package.json');

var staticsUrl = '';

var MOD_CACHE = process.env.CACHE;
var DEBUG = process.env.DEBUG;

// MOD_CACHE, whether enable mod.js localStorage cache
if(MOD_CACHE == 'false'){
  MOD_CACHE = false;
}else{
  MOD_CACHE = true;
}

// DEBUG, whether enable console & vConsole
if(DEBUG == 'true'){
  DEBUG = true;
}else{
  DEBUG = false;
}

var autoprefixerOption = {
  browsers: ['> 1%']
};

var typescriptCompilerOption = {
  baseUrl: 'src',
  noEmitHelpers: true,
  importHelpers: true,
  target: 1 // target: ES5
};

/// ======================== common settings ========================

if(process.platform === 'linux'){
  fis.set('project.watch.usePolling', true);
}
fis.set('project.files', ['src/**']);
fis.set('project.ignore', fis.get('project.ignore').concat([
  '**/*.md',
  '**/*.json'
]));
fis.set('project.md5Length', 8);
fis.set('project.fileType.text', 'vue');

fis.hook('commonjs', {
  baseUrl: 'src',
  extList: ['.ts', '.js', '.vue'],
  paths: {
    'vue': '/node_modules/vue/dist/vue.js'
  }
});

/// ======================== develop environment ========================

// 发布地址 => development
fis.match('/src/(**)', {
  release: '/dist/$1',
})

.match('/src/(**).vue', {
  id: '$1',
  isMod: true,
  isTsLike: true,
  parser: [
    fis.plugin('vue-component', {
      runtimeOnly: false,
      extractCSS: false,
      cssScopedFlag: null
    })
  ],
  rExt: '.js'
})

.match('/src/**.{css,vue:css,vue:stylus}', {
  postprocessor: fis.plugin('autoprefixer', autoprefixerOption)
})

.match('/src/**.vue:stylus', {
  parser: fis.plugin('stylus')
})

.match('/src/(**).{js,ts,vue:js}', {
  id: '$1',
  isMod: true,
  parser: fis.plugin('typescript', typescriptCompilerOption),
  rExt: '.js'
})

.match('/src/**.d.ts', {
  release: false
}, true)

// no not wrap plugin files
.match('/src/plugins/**.js', {
  isMod: false
})

.match('/(node_modules/**)', {
  release: '/dist/$1',
  url: '$1'
})

.match('/(node_modules/**.js)', {
  isMod: true,
  useSameNameRequire: false
})

// test configs
// do not wrap test related files
.match('/src/{karma.conf,requirejs.conf}.js', {
  isMod: false
})

/// === packTo 配置, 将一些文件打包合并在一起

// node_modules 库, 只 packTo 部分文件, 有的文件不是全局依赖还是按需加载
.match('/(node_modules/{' + require('./src/runtimes/packages.json').join(',') + '}/**.{js,ts})', {
  packTo: '/src/runtimes/packages.js'
})

// init 初始化文件
.match('/src/{boot,app}.{js,ts,vue}', {
  packTo: '/src/init.js'
})

// 全局 runtimes 文件
.match('/src/runtimes/**/*.{js,ts}', {
  packTo: '/src/runtimes/runtimes.js'
})

// 各个页面自用的文件, 打包成一个文件, 减少http请求
.match('/src/views/(*)/**.{js,ts,vue}', {
  packTo: '/src/views/$1/$1-pack.js'
})

.match('::package', {
  postpackager: fis.plugin('loader', {
    resourceType: 'mod',
    useInlineMap: true // 资源映射表内嵌
  })
});

/// ======================== production envionment ========================

fis
.media('prod')

/// do not release test related files
.match('/src/**.spec.{js,ts}', {
  release: false
})
.match('/src/{karma.conf,requirejs.conf}.js', {
  release: false
})

// 使用hash
.match('::text', {
  useHash: true
})
.match('::image', {
  useHash: true
})

/// optimize
.match('/src/**.{ts,js,vue}', {
  optimizer: fis.plugin('uglify-js', {
    compress: {
      warnings: false,
      drop_console: !DEBUG,
      dead_code: true,
      global_defs: {
        __MOD_CACHE: MOD_CACHE,
        __DEBUG: DEBUG
      }
    },
    output: {
      ascii_only: true
    },
    comments: false,
    mangle: true
  })
})
.match('/src/**.{css,vue:css}', {
  release: false,
  optimizer: fis.plugin('clean-css')
})
.match('/src/**.html', {
  release: false,
  optimizer: fis.plugin('dfy-html-minifier', {
    removeComments: true,
    collapseWhitespace: true
  })
})
.match('/src/index.html', {
  useHash: false,
  release: '/dist/index.html',
  optimizer: fis.plugin('dfy-html-minifier', {
    removeComments: false,
    collapseWhitespace: true
  })
}, true)

// all in one pack
.match('::package', {
  postpackager: fis.plugin('loader', {
    resourceType: 'mod',
    resourcemapWhitespace: 0,
    useInlineMap: true // 资源映射表内嵌
  })
})

// 过滤掉已经被打包的资源
.match('**', {
  deploy: [
    fis.plugin('skip-packed'),
    fis.plugin('local-deliver')
  ]
})

/// ======================== fis-hook-node_modules ========================

// 禁用components
fis.unhook('components');
fis.hook('node_modules');
