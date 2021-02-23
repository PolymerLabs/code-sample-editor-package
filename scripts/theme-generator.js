/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// This script generates the following files:
//
//   1) themes/*.css : A CSS file for each of the standard CodeMirror themes, which
//      expresses that theme in terms of CSS custom properties.
//
//   2) src/themes/*.css.ts : A JavaScript module for each file in #2 that exports
//      the style as a lit CSSResult.
//
//   3) src/configurator/themes.ts : An aggregation of all theme names and theme
//      CSSResults, for use by the configurator.
//
// We convert each standard CodeMirror theme to a set of CSS custom properties by
// loading ./theme-generator.html in a playwright-controlled Chromium browser,
// loading each of the original themes stylesheets, and extracting colors from
// probe nodes that mimic the structure of /actual CodeMirror DOM.

import * as fs from 'fs';
import * as pathlib from 'path';
import * as url from 'url';

import * as webDevServer from '@web/dev-server';
import * as playwright from 'playwright';
import CleanCSS from 'clean-css';

const rootDir = pathlib.resolve(
  pathlib.dirname(url.fileURLToPath(import.meta.url)),
  '..'
);

const mkdirAndWriteUtf8 = async (path, data) => {
  await fs.promises.mkdir(pathlib.dirname(path), {recursive: true});
  await fs.promises.writeFile(path, data, 'utf8');
};

// The main reason we use a CSS minifier here is to remove redundant rules from
// the default stylesheet, because we replace its fixed color values with var()s
// simply by appending rules to the end of the stylesheet. For example, we want
// to remove the first rule from:
//
//   .cm-string { color: blue; }
//   .cm-string { color: var(--playground-code-string-color); }
const minifier = new CleanCSS({level: {2: {all: true}}, format: 'beautify'});
const minifyCss = (cssText) => {
  const result = minifier.minify(cssText);
  if (result.errors.length !== 0) {
    throw new Error(`CleanCSS errors: ${result.errors.join(';')}`);
  }
  let minified = result.styles;
  return minified;
};

const postMinifyCss = (css) => {
  // The string value of `window.getComputedStyle(...).background` includes all
  // values, but in practice only color and url are set, so we can strip off
  // most of it.
  css = css.replace(
    / none repeat scroll 0% 0%\s*\/\s*auto padding-box border-box/g,
    ''
  );
  // The computed value of a `border` property includes all values even when
  // width is 0. We can strip off the rest when width is 0.
  css = css.replace(/0px none rgb.*;/g, '0px;');
  return css;
};

const fromMap = {
  color: 'color',
  background: 'background',
  borderRight: 'border-right',
  borderLeftColor: 'border-left-color',
  boxShadow: 'box-shadow',
};

const makeThemeCss = (themeName, results, defaultResults) => {
  const excludeDefaults = Object.values(results).filter(
    (r) => defaultResults[r.to].value !== r.value
  );
  return postMinifyCss(
    minifyCss(`.playground-theme-${themeName} {
${excludeDefaults.map(({to, value}) => `  ${to}: ${value};`).join('\n')}
}`)
  );
};

const makeCssModule = (css) => {
  return `import {css} from 'lit-element';
const style = css\`
${css}
\`;
export default style;
`;
};

const main = async () => {
  const serverPromise = webDevServer.startDevServer({
    config: {
      rootDir,
    },
  });

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--auto-open-devtools-for-tabs'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const server = await serverPromise;

  const url = `http://localhost:${server.config.port}/scripts/theme-generator.html`;
  await page.goto(url);

  const writes = [];

  // Default style
  const defaultResults = await page.evaluate(() => window.probe('default'));

  // Themes
  const excludeThemes = new Set([
    // This file just removes box-shadow for some reason, not a real theme.
    'ambiance-mobile.css',
  ]);
  const themeFilenames = fs
    .readdirSync(
      pathlib.resolve(rootDir, 'node_modules', 'codemirror', 'theme')
    )
    .filter((name) => !excludeThemes.has(name));
  const themeNames = [];
  for (const filename of themeFilenames) {
    const themeName = filename.replace(/\.css$/, '');
    themeNames.push(themeName);
    const styleUrl = `/node_modules/codemirror/theme/${filename}`;
    const results = await page.evaluate(
      ([themeName, styleUrl]) => window.probe(themeName, styleUrl),
      [themeName, styleUrl]
    );
    const css = makeThemeCss(themeName, results, defaultResults);
    writes.push(
      mkdirAndWriteUtf8(pathlib.join(rootDir, 'themes', filename), css)
    );
    writes.push(
      mkdirAndWriteUtf8(
        pathlib.join(rootDir, 'src', 'themes', `${filename}.ts`),
        makeCssModule(css)
      )
    );
  }

  // All themes for configurator
  const allThemesTs = `
export const themeNames = [
${themeNames.map((themeName) => `  '${themeName}',`).join('\n')}
] as const;

${themeNames
  .map(
    (themeName) =>
      `import t${themeName.replace(
        /-/g,
        '_'
      )} from '../themes/${themeName}.css.js';`
  )
  .join('\n')}

  export const themeStyles = [
    ${themeNames
      .map((themeName) => `  t${themeName.replace(/-/g, '_')},`)
      .join('\n')}
    ] as const;
`;

  writes.push(
    mkdirAndWriteUtf8(
      pathlib.join(rootDir, 'src', 'configurator', 'themes.ts'),
      allThemesTs
    )
  );

  await Promise.all([browser.close(), server.stop(), ...writes]);
};

main();
