import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import summary from 'rollup-plugin-summary';

import * as fs from 'fs';

function simpleReplace(replacements) {
  return {
    name: 'simple-replace',
    renderChunk(code) {
      for (const [from, to] of replacements) {
        code = code.replace(from, to);
      }
      return {code};
    },
  };
}

/**
 * Rollup plugin which generates an HTML file with all input JavaScript
 * bundles inlined into script tags.
 */
function inlineHtml(htmlOutPath) {
  return {
    name: 'inline-html',
    generateBundle: async (_outputOptions, bundles, isWrite) => {
      if (!isWrite) {
        return;
      }
      const scripts = [];
      for (const [name, bundle] of Object.entries(bundles)) {
        scripts.push(`<script type="module">${bundle.code.trim()}</script>`);
        // Don't emit the input bundle as its own file.
        delete bundles[name];
      }
      const html = `<!doctype html>${scripts.join('')}`;
      await fs.promises.writeFile(htmlOutPath, html, 'utf8');
    },
  };
}

const terserOptions = {
  warnings: true,
  ecma: 2017,
  compress: {
    unsafe: true,
    passes: 2,
  },
  output: {
    // "some" preserves @license and @preserve comments
    comments: 'some',
    inline_script: false,
  },
  mangle: {
    properties: false,
  },
};

export default [
  // Generate playground-service-worker-proxy.html, the HTML file + inline
  // script that proxies between a project and a service worker on a possibly
  // different origin.
  {
    input: 'playground-service-worker-proxy.js',
    output: {
      file: 'playground-service-worker-proxy-temp-bundle.js',
      format: 'esm',
    },
    plugins: [
      terser(terserOptions),
      inlineHtml('playground-service-worker-proxy.html'),
    ],
  },
  {
    input: 'src/_codemirror/codemirror-bundle.js',
    output: {
      file: '_codemirror/codemirror-bundle.js',
      format: 'esm',
      // CodeMirror doesn't include any @license or @preserve annotations on the
      // copyright headers, so terser doesn't know which comments need to be
      // preserved. Add it back with the annotation.
      banner: `/* @license CodeMirror, copyright (c) by Marijn Haverbeke and others
Distributed under an MIT license: https://codemirror.net/LICENSE */
`,
    },
    // TODO(aomarks) If we created and exported some module-scoped object as our
    // context, then we should be able to make a properly isolated ES module
    // here which doesn't set `window.CodeMirror`. However, there seems to be
    // some code in the `google_modes` files use a hard-coded `CodeMirror`
    // global instead of using the "global" variable that is passed into the
    // factory, so some extra patching/search-replacing would be required.
    context: 'window',
    plugins: [
      resolve(),
      simpleReplace([
        // Every CodeMirror file includes UMD-style tests to check for CommonJS
        // or AMD. Re-write these expressions directly to `false` so that we
        // always run in global mode, and terser will dead-code remove the other
        // branches.
        [/typeof exports ?===? ?['"`]object['"`]/g, 'false'],
        [/typeof define ?===? ?['"`]function['"`]/g, 'false'],
      ]),
      terser(terserOptions),
      summary(),
    ],
  },
  {
    input: 'service-worker/playground-service-worker.js',
    output: {
      file: 'playground-service-worker.js',
      format: 'iife',
      exports: 'none',
    },
    plugins: [resolve(), terser(terserOptions)],
  },
  {
    input: 'typescript-worker/playground-typescript-worker.js',
    output: {
      file: 'playground-typescript-worker.js',
      format: 'iife',
      exports: 'none',
    },
    plugins: [
      commonjs({
        ignore: (id) => true,
      }),
      resolve(),
      terser(terserOptions),
    ],
  },
];
