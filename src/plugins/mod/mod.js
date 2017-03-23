/**
 * @file: mod.js
 * @author fis
 * ver: 1.0.13
 * update: 2016/01/27
 * https://github.com/fex-team/mod
 */
var require;

/* eslint-disable no-unused-vars */
var define;

(function (global) {

    // 避免重复加载而导致已定义模块丢失
    if (require) {
        return;
    }

    var head = document.getElementsByTagName('head')[0];
    var loadingMap = {};
    var factoryMap = {};
    var modulesMap = {};
    var scriptsMap = {};
    var resMap = {};
    var pkgMap = {};

    if(typeof __MOD_CACHE !== 'undefined' && __MOD_CACHE){
        var cacheMap = {};
        var cacheTime = 1000 * 60 * 60 * 24 * 10;
        var supportCacheModule = !!(typeof(JSON) != "undefined" && window.localStorage);
        var getModuleKey = function(id){
            return '_m_' + id;
        };
        var getModuleUrl = function(id){
            //
            // resource map query
            //
            var res = resMap[id] || resMap[id + '.js'] || {};
            var pkg = res.pkg;
            var url;

            if (pkg) {
                url = pkgMap[pkg].url || pkgMap[pkg].uri;
            }else {
                url = res.url || res.uri || id;
            }
            return url;
        };
        var hasCacheModule = function(id){
            if(cacheMap[id] && cacheMap[id].url == getModuleUrl(id)){
                return true;
            }else{
                return false;
            }
        };
        var hasValueModule = function(id){
            return resMap[id] || resMap[id + '.js'] || false;
        };
        var useCacheModules = function(queues){
            if(!supportCacheModule){
                return queues;
            }

            var needLoad = [];
            var docFrag = document.createDocumentFragment();

            for(var i = 0; i < queues.length; i++){
                var queue = queues[i];
                var id = queue.id;
                if(!hasCacheModule(id)){
                    needLoad.push(queue);
                    deleteCacheModule(id);
                    continue;
                }
                var scriptNode = document.createElement('script');
                scriptNode.setAttribute('type', 'text/javascript');
                scriptNode.setAttribute('data-module', id);
                try{
                    scriptNode.appendChild(document.createTextNode("define('" + id + "', " + cacheMap[id].factory + ");"));
                }catch(e){
                    scriptNode.text = "define('" + id + "', " + cacheMap[id].factory + ");";
                }
                docFrag.appendChild(scriptNode);
            }

            head.appendChild(docFrag);

            return needLoad;
        };
        var _writeCacheModule = function(key, module){
            window.localStorage.removeItem(key);
            window.localStorage.setItem(key, JSON.stringify(module));
        };
        var writeCacheModule = function(id, module){
            if(!supportCacheModule){
                return false;
            }
            var key = getModuleKey(id);
            module.expires = (+new Date()) + cacheTime;
            try{
                _writeCacheModule(key, module);
            }catch(e){}
        };
        var _deleteCacheModule = function(key){
            window.localStorage.removeItem(key);
        }
        var deleteCacheModule = function(id){
            if(!supportCacheModule){
                return false;
            }
            var key = getModuleKey(id);
            try{
                _deleteCacheModule(key);
            }catch(e){}
        };
        var cleanCacheModules = function(){
            for(var id in cacheMap){
                if(hasValueModule(id)){
                    continue;
                }
                deleteCacheModule(id);
            }
        };
        (function loadCacheModules(){
            if(!supportCacheModule){
                return false;
            }
            for(var key in window.localStorage){
                if(!/^_m_/.test(key)){
                    continue;
                }
                var module = JSON.parse(window.localStorage.getItem(key));
                var id = key.substr(3);

                // cache expire
                if(module.expires < (+new Date())){
                    window.localStorage.removeItem(key);
                    continue;
                }

                cacheMap[id] = module;

                // update cacheTime, and write back to localStorage
                writeCacheModule(id, module);
            }
        })();
    }

    var createScripts = function(queues, onerror){

        var docFrag = document.createDocumentFragment();

        for(var i = 0, len = queues.length; i < len; i++){
            var id = queues[i].id;
            var url = queues[i].url;

            if (url in scriptsMap) {
                continue;
            }

            scriptsMap[url] = true;

            var script = document.createElement('script');
            if (onerror) {
                (function(script, id){
                    var tid = setTimeout(function(){
                        onerror(id);
                    }, require.timeout);

                    script.onerror = function () {
                        clearTimeout(tid);
                        onerror(id);
                    };

                    var onload = function () {
                        clearTimeout(tid);
                    };

                    if ('onload' in script) {
                        script.onload = onload;
                    }
                    else {
                        script.onreadystatechange = function () {
                            if (this.readyState === 'loaded' || this.readyState === 'complete') {
                                onload();
                            }
                        };
                    }
                })(script, id);
            }
            script.type = 'text/javascript';
            script.src = url;

            docFrag.appendChild(script);
        }

        head.appendChild(docFrag);
    };

    var loadScripts = function(ids, callback, onerror){
        var queues = [];
        for(var i = 0, len = ids.length; i < len; i++){
            var id = ids[i];
            var queue = loadingMap[id] || (loadingMap[id] = []);
            queue.push(callback);

            //
            // resource map query
            //
            var res = resMap[id] || resMap[id + '.js'] || {};
            var pkg = res.pkg;
            var url;

            if (pkg) {
                url = pkgMap[pkg].url || pkgMap[pkg].uri;
            }
            else {
                url = res.url || res.uri || id;
            }

            queues.push({
                id: id,
                url: url
            });
        }

        if(typeof __MOD_CACHE !== 'undefined' && __MOD_CACHE){
            queues = useCacheModules(queues);
            if(!queues || !queues.length){
                return;
            }
        }

        createScripts(queues, onerror);
    };

    define = function (id, factory) {
        id = id.replace(/\.js$/i, '');
        factoryMap[id] = factory;

        var queue = loadingMap[id];
        if (queue) {
            for (var i = 0, n = queue.length; i < n; i++) {
                queue[i]();
            }
            delete loadingMap[id];
        }

        if(typeof __MOD_CACHE !== 'undefined' && __MOD_CACHE){
            // 缓存已经有了, 不需要再次覆盖写入
            if(hasCacheModule(id)){
                return;
            }

            // 写入缓存
            writeCacheModule(id, {
                url: getModuleUrl(id),
                factory: factory.toString()
            });
        }
    };

    require = function (id) {

        // compatible with require([dep, dep2...]) syntax.
        if (id && id.splice) {
            return require.async.apply(this, arguments);
        }

        id = require.alias(id);

        var mod = modulesMap[id];
        if (mod) {
            return mod.exports;
        }

        //
        // init module
        //
        var factory = factoryMap[id];
        if (!factory) {
            throw '[ModJS] Cannot find module `' + id + '`';
        }

        mod = modulesMap[id] = {
            exports: {}
        };

        //
        // factory: function OR value
        //
        var ret = (typeof factory === 'function') ? factory.apply(mod, [require, mod.exports, mod]) : factory;

        if (ret) {
            mod.exports = ret;
        }

        return mod.exports;
    };

    require.async = function (names, onload, onerror) {
        if (typeof names === 'string') {
            names = [names];
        }

        var needMap = {};
        var needNum = 0;
        var needLoad = [];

        function findNeed(depArr) {
            var child;

            for (var i = 0, n = depArr.length; i < n; i++) {
                //
                // skip loading or loaded
                //
                var dep = require.alias(depArr[i]);

                if (dep in needMap) {
                    continue;
                }

                needMap[dep] = true;

                if (dep in factoryMap) {
                    // check whether loaded resource's deps is loaded or not
                    child = resMap[dep] || resMap[dep + '.js'];
                    if (child && 'deps' in child) {
                        findNeed(child.deps);
                    }
                    continue;
                }

                needLoad.push(dep);
                needNum++;

                child = resMap[dep] || resMap[dep + '.js'];
                if (child && 'deps' in child) {
                    findNeed(child.deps);
                }
            }
        }

        function updateNeed() {
            if (0 === needNum--) {
                var args = [];
                for (var i = 0, n = names.length; i < n; i++) {
                    args[i] = require(names[i]);
                }

                onload && onload.apply(global, args);
            }
        }

        findNeed(names);
        loadScripts(needLoad, updateNeed, onerror);
        updateNeed();
    };

    require.resourceMap = function (obj) {
        var k;
        var col;

        // merge `res` & `pkg` fields
        col = obj.res;
        for (k in col) {
            if (col.hasOwnProperty(k)) {
                resMap[k] = col[k];
            }
        }

        col = obj.pkg;
        for (k in col) {
            if (col.hasOwnProperty(k)) {
                pkgMap[k] = col[k];
            }
        }

        if(typeof __MOD_CACHE !== 'undefined' && __MOD_CACHE){
            cleanCacheModules();
        }
    };

    require.loadJs = function (url) {
        if (url in scriptsMap) {
            return;
        }

        scriptsMap[url] = true;

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);
    };

    require.loadCss = function (cfg) {
        if (cfg.content) {
            var sty = document.createElement('style');
            sty.type = 'text/css';

            if (sty.styleSheet) { // IE
                sty.styleSheet.cssText = cfg.content;
            }
            else {
                sty.innerHTML = cfg.content;
            }
            head.appendChild(sty);
        }
        else if (cfg.url) {
            var link = document.createElement('link');
            link.href = cfg.url;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        }
    };


    require.alias = function (id) {
        return id.replace(/\.js$/i, '');
    };

    require.timeout = 5000;

})(this);
