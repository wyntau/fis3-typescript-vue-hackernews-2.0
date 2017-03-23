// FIS3 internal functions
declare function __inline(fileName: string): string;
declare function __uri(fileName: string): string;

// Mod.js internal functions
declare function require(module: string): any;
declare namespace require{
  function async(modules: string[], callback?: Function);
  function async(module: string, callback?: Function);
}

// project internal const
declare let __DEBUG;
