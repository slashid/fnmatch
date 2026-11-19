# fnmatch
Updated clone of kballards golang fnmatch gist (https://gist.github.com/kballard/272720)

## JavaScript interopability

This module has javascript<>go interop via wasm

### Usage
```
npm i @slashid/fnmatch
// or
yarn add @slashid/fnmatch
// or
pnpm add @slashid/fnmatch
```

You must load tinygo wasm runtime before this library.

You have two options for getting the runtime:
1. Get it from your `tinygo` install:
    - `cp $(tinygo env TINYGOROOT)/targets/wasm_exec.js .`
2. We ship a compatible `wasm_exec.js` with this library for your convenience:
    - `@slashid/fnmatch/wasm_exec.js`

```html
<script src="wasm_exec.js"></script>
<script src="your_code.js">></script>
```

```ts
import { fnmatch } from '@slashid/fnmatch'

fnmatch.Match("*yes.com", "hello@yes.com", fnmatch.FNM_CASEFOLD) // true
fnmatch.Match("*yes.com", "hello@no.com", fnmatch.FNM_CASEFOLD) // false
```

The wasm module is loaded lazily, on the first call to `fnmatch.Match()` (or the first read of an `FNM_*`
flag), so importing this package has no side effects and needs no top-level `await` support from your bundler.
The first call instantiates the module synchronously (about 4 ms), so `wasm_exec.js` only has to be loaded
before that first call. If it is not, the call throws, and a later call retries.

### Contributing

#### Build
This library is built using [tinygo](https://tinygo.org/), [Rollup](https://rollupjs.org/) and [@rollup/plugin-wasm](https://www.npmjs.com/package/@rollup/plugin-wasm).
```
npm run build
```

#### Publish dry-run
For you convenience there is a `yalc` publishing helper.
```
npm run publish:yalc
```


