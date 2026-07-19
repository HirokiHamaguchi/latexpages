# kuromoji vendor notes

This directory vendors the browser build of `kuromoji.js` for `latexpages`.

## Upstream source

- Repository: `https://github.com/takuyaa/kuromoji.js`
- Vendored file: `upstream/kuromoji.js`

The file under `upstream/` is intended to stay as close to upstream as possible.
Do not hand-edit it unless there is a very strong reason.

## Why this is vendored

`workbench.browser` runs with an AMD loader. Loading the stock UMD browser bundle as a
plain script can collide with that loader and prevent `window.kuromoji` from being set.

To keep maintenance manageable, `latexpages` does not patch the upstream file directly.
Instead, the app uses a thin wrapper loader in:

- `src/vendor/kuromoji/loadKuromoji.ts`

That loader fetches the vendored upstream file and evaluates it in a way that avoids the
AMD path, while leaving the upstream code itself untouched.

## Related files

- Dictionary assets: `public/dict/`
- App loader wrapper: `src/vendor/kuromoji/loadKuromoji.ts`
- Test setup compatibility import: `test/setup.ts`
