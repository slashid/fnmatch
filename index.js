import wasm from "./main.wasm"

const encodeString = (name, instance) => {
  const bytes = new TextEncoder("utf8").encode(name);
  const pointer = instance.exports.alloc(bytes.length);
  const mem = new Uint8Array(instance.exports.memory.buffer, pointer, bytes.length);
  mem.set(new Uint8Array(bytes));

  return {
    pointer: pointer,
    length: bytes.length,
  };
};

/**
 * @typedef {Object} Fnmatch
 * @property {(pattern: string, s: string, flags: number) => boolean} Match
 * @property {number} FNM_NOESCAPE
 * @property {number} FNM_PATHNAME
 * @property {number} FNM_PERIOD
 * @property {number} FNM_LEADING_DIR
 * @property {number} FNM_CASEFOLD
 * @property {number} FNM_IGNORECASE
 * @property {number} FNM_FILE_NAME
 */

/**
 * Instantiates the wasm module. The module is small enough to compile synchronously,
 * which lets the public API stay synchronous while still loading lazily.
 * @returns {Fnmatch}
 */
const createFnmatch = () => {
  if (typeof Go === "undefined") {
    throw new Error(
      "@slashid/fnmatch: the TinyGo wasm runtime is not loaded. Load wasm_exec.js (shipped as @slashid/fnmatch/wasm_exec.js) before the first call."
    );
  }
  const go = new Go();
  const instance = wasm(go.importObject);

  go.run(instance);

  return {
    Match: (pattern, s, flags) => {
      const _pattern = encodeString(pattern, instance);
      const _s = encodeString(s, instance);
      return Boolean(
        instance.exports.Match(
          _pattern.pointer,
          _pattern.length,
          _s.pointer,
          _s.length,
          flags
        )
      );
    },
    FNM_NOESCAPE: instance.exports._FNM_NOESCAPE(),
    FNM_PATHNAME: instance.exports._FNM_PATHNAME(),
    FNM_PERIOD: instance.exports._FNM_PERIOD(),
    FNM_LEADING_DIR: instance.exports._FNM_LEADING_DIR(),
    FNM_CASEFOLD: instance.exports._FNM_CASEFOLD(),
    FNM_IGNORECASE: instance.exports._FNM_IGNORECASE(),
    FNM_FILE_NAME: instance.exports._FNM_FILE_NAME(),
  };
};

/** @type {Fnmatch | undefined} */
let loaded;

/**
 * Loads the wasm module on first use. A failed load is not cached, so a later call retries.
 * @returns {Fnmatch}
 */
const load = () => (loaded ??= createFnmatch());

/**
 * Same shape as before, but nothing runs at import time: the wasm module is instantiated
 * on the first Match() call or the first read of an FNM_* flag.
 * @type {Fnmatch}
 */
export const fnmatch = {
  Match: (pattern, s, flags) => load().Match(pattern, s, flags),
  get FNM_NOESCAPE() {
    return load().FNM_NOESCAPE;
  },
  get FNM_PATHNAME() {
    return load().FNM_PATHNAME;
  },
  get FNM_PERIOD() {
    return load().FNM_PERIOD;
  },
  get FNM_LEADING_DIR() {
    return load().FNM_LEADING_DIR;
  },
  get FNM_CASEFOLD() {
    return load().FNM_CASEFOLD;
  },
  get FNM_IGNORECASE() {
    return load().FNM_IGNORECASE;
  },
  get FNM_FILE_NAME() {
    return load().FNM_FILE_NAME;
  },
};
