// Run after `npm run build`: node --test test/
import assert from "node:assert/strict";
import { test } from "node:test";

// Importing must not need the Go runtime or instantiate the wasm.
const { fnmatch } = await import("../dist/index.js");

test("a call before wasm_exec.js is loaded throws a clear error and is retried later", async () => {
  assert.throws(() => fnmatch.Match("a", "a", 0), /wasm runtime is not loaded/);
  assert.throws(() => fnmatch.FNM_CASEFOLD, /wasm runtime is not loaded/);

  await import("../wasm_exec.js");

  assert.equal(fnmatch.Match("a", "a", 0), true);
});

test("Match honours the flags", () => {
  assert.equal(fnmatch.Match("*yes.com", "hello@yes.com", fnmatch.FNM_CASEFOLD), true);
  assert.equal(fnmatch.Match("*yes.com", "hello@no.com", fnmatch.FNM_CASEFOLD), false);
  assert.equal(fnmatch.Match("*YES.COM", "hello@yes.com", fnmatch.FNM_CASEFOLD), true);
  assert.equal(fnmatch.Match("*YES.COM", "hello@yes.com", 0), false);
  assert.equal(fnmatch.Match("*", "a/b", fnmatch.FNM_PATHNAME), false);
});

test("the FNM_* flags are numbers", () => {
  for (const k of ["FNM_NOESCAPE", "FNM_PATHNAME", "FNM_PERIOD", "FNM_LEADING_DIR", "FNM_CASEFOLD", "FNM_IGNORECASE", "FNM_FILE_NAME"]) {
    assert.equal(typeof fnmatch[k], "number", k);
  }
});
