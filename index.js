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

const createFnmatch = async () => {
  const go = new Go();
  const instance = wasm(go.importObject)

  go.run(instance); 

  return {
    /** @type {(pattern: string, s: string, flags: number) => boolean} */
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
    /** @type {number} */
    FNM_NOESCAPE: instance.exports._FNM_NOESCAPE(),
    /** @type {number} */
    FNM_PATHNAME: instance.exports._FNM_PATHNAME(),
    /** @type {number} */
    FNM_PERIOD: instance.exports._FNM_PERIOD(),
    /** @type {number} */
    FNM_LEADING_DIR: instance.exports._FNM_LEADING_DIR(),
    /** @type {number} */
    FNM_CASEFOLD: instance.exports._FNM_CASEFOLD(),
    /** @type {number} */
    FNM_IGNORECASE: instance.exports._FNM_IGNORECASE(),
    /** @type {number} */
    FNM_FILE_NAME: instance.exports._FNM_FILE_NAME()
  }
};

export const fnmatch = await createFnmatch();
