<h1 align="center">playground-elements</h1>

<p align="center">
  <br>
  Serverless code experiences with web components.
  <br>
  <br>
  <img src="./images/preview.png" width="650">
 <br><br>
  <a href="https://www.npmjs.com/package/playground-elements">
    <img height="20" src="https://img.shields.io/npm/v/playground-elements.svg"></img></a>
  <a href="https://github.com/PolymerLabs/playground-elements/actions?query=workflow%3Atests+branch%3Amaster+event%3Apush">
    <img height="20" src="https://github.com/PolymerLabs/code-sample-editor/workflows/Tests/badge.svg"></img></a>
  <a href="https://www.npmtrends.com/playground-elements">
    <img height="20" src="https://img.shields.io/npm/dw/playground-elements"></a>
  <br><br>
    <a href="#overview">Overview</a>
    • <a href="#getting-started">Getting Started</a>
    • <a href="#project-files">Project files</a>
    • <a href="#module-resolution">Module resolution</a>
    • <a href="#typescript">TypeScript</a>
    • <a href="#custom-layouts">Custom layouts</a>
    • <a href="#components">Components</a>
    • <a href="#styling">Styling</a>
    • <a href="#syntax-highlighting">Syntax highlighting</a>
    • <a href="#faq">FAQ</a>
</p>

## Overview

Playground Elements are a set of components for creating interactive editable
code experiences on the web, with live updating previews. You can use Playground
to:

- Embed editable code examples in your documentation.
- Build interactive tutorials and example galleries.
- Build full-featured coding sandboxes (think Glitch or JSBin).

#### 🤯 No backend required

Unlike other coding environments, Playground never sends code to a backend
server. Instead, Playground uses a [Service
Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) to
create a virtual URL-space that runs 100% within the browser. If you can host
static files, you can host a Playground.

#### <img src="images/typescript.png" width="18" height="18"> TypeScript support

Playground automatically compiles `.ts` files using TypeScript. Compilation
happens in a Web Worker on a separate thread, so your page stays responsive.

#### 🧩 Web Components

Playground uses Web Components, so it doesn't require a framework. But it will
play nicely with any framework you're already using, like React, Vue, and
Angular.

#### 🍱 Mix-and-match for flexible layout

Playground is broken up into small components like an editor, file picker, and
preview. Mix-and-match components to create any layout you want, or just use
`<playground-ide>` for an easy out-of-the-box experience.

#### 🎨 Themable

Playground is fully themeable with CSS Custom Properties, down to the color of
each kind of syntax-highlighted token. It comes with lots of preset themes, and
you can even import a VSCode theme using our configurator.

---

<h3 align="center">
  <a href="https://polymerlabs.github.io/playground-elements/">
    Try the demo and configurator!
  </a>
</h3>

---

## Getting Started

### Install

For a quick start, Playground can be imported from Skypack:

```html
<script
  type="module"
  src="https://cdn.skypack.com/playground-elements"
></script>
```

Or to install from NPM:

```sh
npm i playground-elements
```

```html
<script
  type="module"
  src="/node_modules/playground-elements/playground-ide.js"
></script>
```

### Hello World

Create a `<playground-ide>` element in your HTML, and specify your project files
inline:

```html
<playground-ide editable-filesystem line-numbers resizable>
  <script type="sample/html" filename="index.html">
    <!doctype html>
    <body>
      Hello
      <script type="module" src="./index.js">&lt;/script>
    </body>
  </script>

  <script type="sample/ts" filename="index.ts">
    document.body.appendChild(document.createTextNode("World!"))
  </script>
</playground-ide>
```

### Serve

If you imported from Skypack, serve with any HTTP server.

If you installed from NPM, you'll just need to make sure bare module imports are
resolved. You can use a server like
[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) to handle
this automatically:

```sh
npm -i -D @web/dev-server
npx web-dev-server --node-resolve --watch
```

Or, use a tool like [Rollup](https://rollupjs.org/guide/en/) to resolve bare
module imports to paths at build time. If you need more help with building and
serving, check out the [Modern Web Guides](https://modern-web.dev/guides/).

### Compatibility

Playground is supported by all modern browsers. It requires support for custom
elements, JS modules, service workers, and web workers.

&nbsp;&nbsp;&nbsp; **Supported:** &nbsp;&nbsp;<img src="images/check-green.png" width="20px" height="20px" class="check" alt="Supported"> <img src="images/chrome.png" width="20px" height="20px"> Chrome
&nbsp;&nbsp;&nbsp;
<img src="images/check-green.png" width="20px" height="20px" class="check" alt="Supported"> <img src="images/firefox.png" width="20px" height="20px"> Firefox
&nbsp;&nbsp;&nbsp;
<img src="images/check-green.png" width="20px" height="20px" class="check" alt="Supported"> <img src="images/safari.png" width="20px" height="20px"> Safari
&nbsp;&nbsp;&nbsp;
<img src="images/check-green.png" width="20px" height="20px" class="check" alt="Supported"> <img src="images/edge.png" width="20px" height="20px"> Edge

**Unsupported:** &nbsp; <img src="images/red-cross.png" width="20px" height="20px" class="check" alt="Unsupported"> <img src="images/ie.png" width="20px" height="20px"> Internet Explorer

## Project files

Playground supports `html`, `css`, `js`, and `ts` files. There are 3 ways to specify the
files of a playground project.

### Option 1: Inline scripts

Add one or more `<script type="sample/..." filename="...">` tags as children of
your `<playground-ide>` or `<playground-project>`.

Be sure to escape closing `</script>` tags within your source as `<&lt;script>`.

Leading whitespace that is common to all lines is automatically removed unless
the `preserve-whitespace` attribute is present.

```html
<playground-project>
  <script type="sample/html" filename="index.html">
    <!doctype html>
    <head>
      <script type="module" src="javascript.js">&lt;/script>
      <script type="module" src="typescript.js">&lt;/script>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      <p>Hello World!</p>
    </body>
  </script>

  <script type="sample/js" filename="javascript.js">
    console.log('hello from javascript');
  </script>

  <script type="sample/ts" filename="typescript.ts">
    console.log('hello from typescript');
  </script>

  <script type="sample/css" filename="styles.css">
    body { color: blue; }
  </script>
</playground-project>
```

### Option 2: JSON manifest

Serve a JSON file containing a `files` object, with relative filenames.

```html
<playground-ide project-src="/path/to/my/project.json"> </playground-ide>
```

```json
{
  "files": {
    "index.html": {},
    "javascript.js": {},
    "typescript.ts": {},
    "styles.css": {}
  }
}
```

### Option 3: Files property

In JavaScript, directly set the `files` property to an array of files.

```js
const ide = document.querySelector('playground-ide');
ide.files = [
  {
    name: "index.html",
    content: "<p>Hello World!</p>",
  },
  ...
],
```

If both `project-src` and `files` are set, then the one set most recently has
precedence. When either are set, inline scripts are ignored.

## Module resolution

By default, bare module specifiers in JavaScript and TypeScript files are
transformed to `unpkg.com` URLs:

```js
// What you write
import {html} from 'lit-html';

// What playground serves
import {html} from 'https://unpkg.com/lit-html?module';
```

To customize module resolution you can configure an _import map_. You may want
to do this to pin a specific version, change CDNs, or point to a locally served
copy of a module:

```js
{
  "files": { ... },
  "importMap": {
    "imports": {
      "lit-html": "https://cdn.skypack.dev/lit-html@^1.3.0",
      "lit-html/": "https://cdn.skypack.dev/lit-html@^1.3.0/"
    }
  }
}
```

When using inline project files, you can specify your import map like so:

```html
<playground-ide>
  <script type="sample/importmap">
    {
      "imports": {
        "lit-html": "https://cdn.skypack.dev/lit-html@^1.3.0",
        "lit-html/": "https://cdn.skypack.dev/lit-html@^1.3.0/"
      }
    }
  </script>
  ...
</playground-ide>
```

If an import map is defined, but does not contain an entry for a bare module,
then playground defaults to the `unpkg.com` URL.

## TypeScript

Playground automatically compiles `.ts` files using
[TypeScript](https://www.typescriptlang.org/).

The following compiler settings are used:

| Name                                                                                       | Value    |
| ------------------------------------------------------------------------------------------ | -------- |
| [`target`](https://www.typescriptlang.org/tsconfig#target)                                 | `ES2017` |
| [`module`](https://www.typescriptlang.org/tsconfig#module)                                 | `ESNext` |
| [`moduleResolution`](https://www.typescriptlang.org/tsconfig#moduleResolution)             | `node`   |
| [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators) | `true`   |

Note that when you import another project module from a `.ts` file, your import
statement should use the `.js` extension (the same as you would do when running
`tsc` locally):

```ts
import './my-other-module.js';
```

TypeScript error reporting is coming soon, follow
[#67](https://github.com/PolymerLabs/playground-elements/issues/67) for
progress.

## Custom layouts

`<playground-ide>` provides a complete out-of-the-box experience that's a good
start for many use-cases, but you can mix-and-match the various Playground
sub-components to make your custom layouts.

For example, say we need a layout with an editor above, a preview below, and
only one particular file from the project visible — like this:

<img src="./images/custom-layout.png" width="450">

To do this, first import just the components you need. The main
`playground-elements` import loads all Playground elements, but when making a
custom layout it's a good idea to only load the sub-components you're actually
using. This will make your JavaScript bundle smaller.

```html
<script type="module">
  import 'playground-elements/playground-project.js';
  import 'playground-elements/playground-file-editor.js';
  import 'playground-elements/playground-preview.js';
</script>
```

Next create a `<playground-project>`, with some inline project files. We could also
write our project files separately, and specify them in a JSON manifest. This
project element manages the virtual file system, and coordinates with the
Playground workers. We give it a unique `id`, which we'll use to connect up the
editor and preview.

```html
<playground-project id="project1">
  <script type="sample/ts" filename="index.ts">
    window.addEventListener('DOMContentLoaded', () => {
      const world = document.createTextNode(' World!');
      document.body.appendChild(world);
    });
  </script>

  <script type="sample/html" filename="index.html">
    <!doctype html>
    <head>
      <script type="module" src="./index.js">&lt;/script>
    </head>
    <body>Hello</body>
  </script>
</playground-project>
```

Next create an editor and preview. Connect both to the project by setting the
`property` attribute to the project element's `id`. We could also directly set
the `project` _property_ to the project element, if we were using JavaScript.

By setting the `filename` attribute on the editor, we've pinned it to one
particular file. Since we didn't include a `<playground-tab-bar>`, there's no
way for the user to see or switch to other files in the project.

```html
<div class="example">
  <playground-file-editor
    project="project1"
    filename="index.ts"
  ></playground-file-editor>

  <playground-preview project="project1"> </playground-preview>
</div>
```

Finally, add a little style:

```html
<style>
  .example {
    width: 500px;
    border: 1px solid #ccc;
  }
  .example > playground-file-editor {
    height: 110px;
  }
  .example > playground-preview {
    height: 100px;
    border-top: 1px solid #ccc;
    --playground-preview-toolbar-background: #eaeaea;
  }
</style>
```

## Components

<!--
The following diagram shows how the Playground components coordinate in a
typical IDE layout:

<img src="./images/architecture.svg" width="500" height="457">

-->

[`<playground-ide>`](#playground-ide)
• [`<playground-project>`](#playground-project)
• [`<playground-file-editor>`](#playground-file-editor)
• [`<playground-code-editor>`](#playground-code-editor)
• [`<playground-preview>`](#playground-preview)
• [`<playground-tab-bar>`](#playground-tab-bar)
• [`<playground-file-system-controls>`](#playground-file-system-controls)

---

## `<playground-ide>`

All-in-one project, editor, file switcher, and preview with a horizontal side-by-side layout.

### Properties

| Name                 |  Type          | Default                   | Description                                                                 |
| -------------------- | -------------- | ------------------------- | --------------------------------------------------------------------------- |
| `projectSrc`         | `string`       | `undefined`               | URL of the [project manifest](#project-manifest) to load                    |
| `files`              | `SampleFile[]` | `undefined`               | Get or set the array of project files                                       |
| `lineNumbers`        | `boolean`      | `false`                   | Render a gutter with line numbers in the editor                             |
| `editableFileSystem` | `boolean`      | `false`                   | Allow adding, removing, and renaming files                                  |
| `resizable`          | `boolean`      | `false`                   | Allow dragging the line between editor and preview to change relative sizes |
| `sandboxBaseUrl`     | `string`       | _module parent directory_ | Base URL for script execution sandbox ([details](#sandbox)).                |

### Slots

| Name         |  Description                              |
| ------------ | ----------------------------------------- |
| `default`    | Inline files ([details](#inline-scripts)) |

---

## `<playground-project>`

Invisible element that coordinates the filesystem, build worker, and service
worker. Unless you're using `<playground-ide>`, all Playground layouts need a
project element.

### Properties

| Name             |  Type          | Default                   | Description                                                                  |
| ---------------- | -------------- | ------------------------- | ---------------------------------------------------------------------------- |
| `projectSrc`     | `string`       | `undefined`               | URL of a [project files manifest](#option-2-json-manifest) to load.          |
| `files`          | `SampleFile[]` | `undefined`               | Get or set the array of project files ([details](#option-3-files-property)). |
| `sandboxScope`   | `string`       | `"playground-elements"`   | The service worker scope to register on.                                     |
| `sandboxBaseUrl` | `string`       | _module parent directory_ | Base URL for script execution sandbox ([details](#sandbox)).                 |

### Methods

| Method                                         |   Description                                                |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `addFile(filename: string)`                    | Create a new file. Type is inferred from filename extension. |
| `deleteFile(filename: string)`                 | Delete a file.                                               |
| `renameFile(oldName: string, newName: string)` | Rename a file.                                               |

### Slots

| Name         |  Description                              |
| ------------ | ----------------------------------------- |
| `default`    | Inline files ([details](#inline-scripts)) |

### Events

| Event          |  Description                           |
| -------------- | -------------------------------------- |
| `filesChanged` | A file was added, removed, or renamed. |
| `urlChanged`   | The preview URL has changed            |
| `compileStart` | A build has started.                   |
| `compileEnd`   | A build has completed.                 |

---

## `<playground-tab-bar>`

### Properties

| Property             |  Type                            | Default     | Description                                                                                                       |
| -------------------- | -------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `project`            | `string \| PlaygroundProject`    | `undefined` | The project this bar is associated with. Either the `<playground-project>` itself, or its `id` in the host scope. |
| `editor`             | `string \| PlaygroundFileEditor` | `undefined` | The editor this bar controls. Either the `<playground-file-editor>` itself, or its `id` in the host scope.        |
| `editableFileSystem` | `boolean`                        | `false`     | Allow adding, removing, and renaming files                                                                        |

---

## `<playground-file-editor>`

### Properties

| Name          |  Type                             | Default     | Description                                                                                                                    |
| ------------- | --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `project`     | `string \| PlaygroundProject`     | `undefined` | The project that this editor is associated with. Either the `<playground-project>` node itself, or its `id` in the host scope. |
| `filename`    | `string`                          | `undefined` | The name of the project file that is currently being displayed. Set when changing tabs. Does not reflect to attribute.         |
| `type`        | `"js" \| "ts" \| "html" \| "css"` | `undefined` | File type.                                                                                                                     |
| `lineNumbers` | `boolean`                         | `false`     | Render a gutter with line numbers in the editor                                                                                |

---

## `<playground-code-editor>`

A pure text editor based on CodeMirror with syntax highlighting for HTML, CSS, JavaScript, and TypeScript.

### Properties

| Name          |  Type                             | Default       | Description                                     |
| ------------- | --------------------------------- | ------------- | ----------------------------------------------- |
| `value`       | `string`                          | `""`          | Code as string                                  |
| `type`        | `"js" \| "ts" \| "html" \| "css"` | `undefined`   | Language of the file to syntax highlight        |
| `readonly`    | `boolean`                         | `false`       | Do not allow edits                              |
| `lineNumbers` | `boolean`                         | `false`       | Render a gutter with line numbers in the editor |

### Events

| Event         |  Description                         |
| ------------- | ------------------------------------ |
| `changed`     | User made an edit to the active file |

---

## `<playground-preview>`

### Properties

| Name       |  Type                      | Default     | Description                                                                                                                    |
| ---------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `project`  | `string PlaygroundProject` | `undefined` | The project that this editor is associated with. Either the `<playground-project>` node itself, or its `id` in the host scope. |
| `location` | `string`                   | `""`        |                                                                                                                                |

---

## `<playground-file-system-controls`

Floating controls for adding, deleting, and renaming files.

### Properties

| Name            |  Type                                         | Default       | Description                                                                                                                                                                                                   |
| --------------- | --------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`         | `"closed" \| "menu" \| "rename" \| "newfile"` | `"closed"`    | The kind of control to display.<br><br>`closed`: Hidden.<br>`menu`: Menu with "Rename" and "Delete" items.<br>`rename`: Control for renaming an existing file.<br>`newfile`: Control for creating a new file. |
| `filename`      | `string`                                      | `undefined`   | When state is `menu` or `newfile`, the name of the relevant file.                                                                                                                                             |
| `anchorElement` | `HTMLElement`                                 | `undefined`   | Absolutely position these controls at the bottom-left corner of this element.                                                                                                                                 |

### Events

| Event         | Detail               |  Description                                               |
| ------------- | -------------------- | ---------------------------------------------------------- |
| `newFile`     | `{filename: string}` | The specified new file was created through these controls. |

# Styling

**TIP:** Use the [configurator](https://polymerlabs.github.io/playground-elements/)
to quickly experiment with themes and other customizations.

## Custom Properties

| Name                                               | Default                                                                                     | Description                                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `--playground-bar-height`                          | `40px`                                                                                      | `height` of the tab bar and the preview bar                                                                                        |
| `--playground-code-font-family`                    | `monospace`                                                                                 | `font-family` of code in the editor                                                                                                |
| `--playground-code-font-size`                      | `14px`                                                                                      | `font-size` of code in the editor                                                                                                  |
| `--playground-code-line-height`                    | `1.4em`                                                                                     | `line-height` of code in the editor                                                                                                |
| `--playground-code-padding-left`                   | `1em`                                                                                       | `padding-left` of code in the editor (does not affect position of line numbers)                                                    |
| `--playground-code-TOKEN-color`                    | *various*                                                                                   | Color of each kind of `TOKEN` in syntax highlighted-code. See the [syntax highlighting](#syntax-highlighting) section for details. |
| `--playground-highlight-color`                     | ![](images/colors/6200EE.png) `#6200EE`                                                     | Color of the active file-picker tab label and indicator, and the preview loading bar                                               |
| `--playground-code-background`                     | ![](images/colors/FFFFFF.png) `#FFFFFF`                                                     | `background` of the code editor                                                                                                    |
| `--playground-code-gutter-background`              | ![](images/colors/FFFFFF.png) `var(--playground-code-background, #FFFFFF)`                  | `background` of the line-numbers gutter                                                                                            |
| `--playground-code-gutter-box-shadow`              | `none`                                                                                      | `box-shadow` of the line-numbers gutter                                                                                            |
| `--playground-code-gutter-border-right`            | `none`                                                                                      | `border-right` of the line-numbers gutter                                                                                          |
| `--playground-code-linenumber-color`               | ![](images/colors/999999.png) `#999999`                                                     | `color` of line-numbers                                                                                                            |
| `--playground-code-cursor-color`                   | ![](images/colors/000000.png) `var(--playground-code-default-color, #000000)`               | `color` of the cursor                                                                                                              |
| `--playground-code-selection-background`           | ![](images/colors/D7D4F0.png) `#D7D4F0`                                                     | `background` of selected text                                                                                                      |
| `--playground-tab-bar-background`                  | ![](images/colors/EAEAEA.png) `#EAEAEA`                                                     | `background` of the file-picker tab bar                                                                                            |
| `--playground-tab-bar-active-background`           | ![](images/colors/EAEAEA.png) `transparent`                                                 | `background` of the active file-picker tab                                                                                         |
| `--playground-tab-bar-foreground-color`            | ![](images/colors/000000.png) `#000000`                                                     | Text `color` of inactive file-picker tabs                                                                                          |
| `--playground-tab-bar-active-color`                | ![](images/colors/6200EE.png) `var(--playground-highlight-color, #6200EE)`                  | Text `color` of active file-picker tab                                                                                             |
| `--playground-tab-bar-indicator-color`             | ![](images/colors/6200EE.png) `var(--playground-highlight-color, #6200EE)`                  | `color` of active file-picker tab indicator (use `transparent` to hide)                                                            |
| `--playground-tab-bar-font-size`                   | `0.85em`                                                                                    | `font-size` of tab titles in the file-picker tab bar                                                                               |
| `--playground-preview-toolbar-background`          | ![](images/colors/FFFFFF.png) `#FFFFFF`                                                     | `background` of the preview toolbar                                                                                                |
| `--playground-preview-toolbar-foreground-color`    | ![](images/colors/444444.png) `#444444`                                                     | Text `color` of the preview toolbar                                                                                                |
| `--playground-border`                              | ![](images/colors/DDDDDD.png)`1px solid #DDDDDD`                                            | Outer and inner border                                                                                                             |
| `--playground-floating-controls-highlight-color`   | ![](images/colors/6200EE.png) `var(--playground-highlight-color, #6200EE)`                  | Highlight color of popup controls buttons and inputs                                                                               |

## Shadow Parts

The following [CSS shadow
parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) are exported,
which you can style with additional rules not covered by the above CSS custom
properties.

| Part name                                   | Exported by      | Description                                  |
| ------------------------------------------- | ---------------- | -------------------------------------------- |
| `tab-bar`                                   | `ide`            | Tab bar file switcher                        |
| `editor`                                    | `ide`            | Editor                                       |
| `preview`                                   | `ide`            | Preview                                      |
| `preview-toolbar`                           | `ide`, `preview` | Preview top bar                              |
| `preview-location`                          | `ide`, `preview` | Preview top bar "Result" heading             |
| `preview-reload-button`                     | `ide`, `preview` | Preview top bar reload button                |
| `preview-loading-indicator`                 | `ide`, `preview` | Preview top bar horizontal loading indicator |

# Syntax highlighting

## Themes

**TIP:** Use the **_Import Theme_** button in the
[configurator](https://polymerlabs.github.io/playground-elements/) to generate a
Playground theme from any VSCode theme.

The `playground-elements` package includes a directory of pre-configured
syntax-highlighting themes. To load a theme, import its stylesheet, and apply the
corresponding class name to the playground element or one of its ancestors:

```html
<import
  rel="stylesheet"
  src="/node_modules/playground-elements/themes/ayu-mirage.css"
>
  <playground-ide class="playground-theme-ayu-mirage"></playground-ide
></import>
```

A `.js` file is also provided for each theme, which exports a Lit
[`CSSResult`](https://lit-element.polymer-project.org/api/classes/_lit_element_.cssresult.html).
You can include this directly in the `static styles` of your own Lit components,
or get a `CSSStyleSheet` or `string` representation for other use cases:

```js
import ayuMirageTheme from 'playground-elements/themes/ayu-mirage.css.js';

ayuMirageTheme; // Lit CSSResult
ayuMirageTheme.styleSheet; // CSSStyleSheet
ayuMirageTheme.cssText; // string
```

## Custom syntax highlighting

Each kind of language token is controlled by a CSS custom property with the name
`--playground-code-TOKEN-color`. For example, the `keyword` token is controlled
by `--playground-code-keyword-color`.

| Token        | Default                                 | JS/TS                                                                                    | HTML                                 | CSS                                        |
| ------------ | --------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------ |
| `default`    | ![](images/colors/000000.png) `#000000` | `{}[];`                                                                                  | <code>&lt;p><b>foo</b>&lt;/p></code> | `{}:;`                                     |
| `atom`       | ![](images/colors/221199.png) `#221199` | `true`                                                                                   | `&amp;`                              | `bold`                                     |
| `attribute`  | ![](images/colors/0000CC.png) `#0000CC` |                                                                                          | <code>&lt;foo <b>bar</b>></code>     | <code>@media <b>screen</b> { }</code>      |
| `builtin`    | ![](images/colors/3300AA.png) `#3300AA` |                                                                                          |                                      | <code><b>#id</b> { }</code>                |
| `callee`     | ![](images/colors/000000.png) `#000000` | <code><b>func</b>()</code>                                                               |                                      | <code><b>calc</b>()</code>                 |
| `comment`    | ![](images/colors/AA5500.png) `#AA5500` | `// foo`                                                                                 | `<!-- foo -->`                       | `/* foo */`                                |
| `def`        | ![](images/colors/0000FF.png) `#0000FF` | <code>let <b>foo</b> = bar</code> <br> <code>/\*\*@param {string} <b>foo</b>\*/</code>   |                                      | `@media`                                   |
| `keyword`    | ![](images/colors/770088.png) `#770088` | `class`                                                                                  |                                      | `blue`                                     |
| `meta`       | ![](images/colors/555555.png) `#555555` |                                                                                          | `<!doctype html>`                    |                                            |
| `number`     | ![](images/colors/116644.png) `#116644` | `4`                                                                                      |                                      | `4px`                                      |
| `operator`   | ![](images/colors/000000.png) `#000000` | `=`                                                                                      |                                      |                                            |
| `property`   | ![](images/colors/000000.png) `#000000` | <code>class foo { <b>bar</b>; } </code>                                                  |                                      | <code><b>color</b>:</code>                 |
| `qualifier`  | ![](images/colors/555555.png) `#555555` |                                                                                          |                                      | <code><b>.class</b> { }</code>             |
| `string`     | ![](images/colors/AA1111.png) `#AA1111` | `"foo"`                                                                                  | <code>&lt;a b=<b>"c"</b>></code>     | <code>content: <b>"foo"</b></code>         |
| `string-2`   | ![](images/colors/FF5500.png) `#FF5500` | `` `foo` `` <br> `/foo/`                                                                 |                                      | <code><b>zoom</b>: 50%</code> <sup>1</sup> |
| `tag`        | ![](images/colors/117700.png) `#117700` | <code>/\*\*<b>@param</b> {string} foo\*/</code>                                          | `<foo>`                              | <code><b>div</b> { }                       |
| `type`       | ![](images/colors/008855.png) `#008855` | <code>let foo: <b>string</b></code> <br> <code>/\*\*@param {<b>string</b>} foo\*/</code> |                                      |                                            |
| `variable`   | ![](images/colors/000000.png) `#000000` | <code>let foo = <b>bar</b></code>                                                        |                                      | <code>@keyframes <b>spin</b> { }</code>    |
| `variable-2` | ![](images/colors/0055AA.png) `#0055AA` | <code>(arg) => { <b>arg</b> }</code> <sup>2</sup>                                        |                                      |                                            |
| `variable-3` | ![](images/colors/008855.png) `#008855` |                                                                                          |                                      | <code>::<b>hover</b></code>                |
| `local`      | ![](images/colors/0000FF.png) `#0000FF` | <code>(<b>arg</b>) => { }</code>                                                         |                                      |                                            |

#### Notes

1. In CSS, `string-2` is used for "non-standard" properties, but the
   [list](https://github.com/codemirror/CodeMirror/blob/264022ee4af4abca1c158944dc299a8faf8696d6/mode/css/css.js#L566)
   is outdated.
2. In JS/TS, `variable-2` is used for function-local variables.

#### Parsers

Playground uses the `google_modes` CodeMirror syntax highlighting modes for
TS/JS/HTML, because they support highlighting of HTML and CSS within JavaScript
tagged template literals.

- JavaScript: https://github.com/codemirror/google-modes/blob/master/src/javascript.grammar
- TypeScript: https://github.com/codemirror/google-modes/blob/master/src/typescript.grammar
- JSDoc: https://github.com/codemirror/google-modes/blob/master/src/jsdoc.grammar
- HTML: https://github.com/codemirror/google-modes/blob/master/src/html.grammar
- CSS: https://github.com/codemirror/CodeMirror/blob/master/mode/css/css.js

## FAQ

### How do I save and share a project?

Use the `files` property of a `<playground-ide>` or `<playground-project>` to
get or set the current state of the project.

How you persist and retrieve serialized project state is up to you. Here are a
few ideas:

- JSON + base64 encode the files, and save it to the URL hash (see [#102](https://github.com/PolymerLabs/playground-elements/issues/102))
- Integrate with a third-party API like [GitHub
  gists](https://docs.github.com/en/rest/reference/gists).
- Write to your own datastore.

### How do I run custom build steps like JSX or SASS?

Support for build plugins like JSX, SASS, and CSS modules are on the roadmap,
but are not yet available. Follow and comment on
[#66](https://github.com/PolymerLabs/playground-elements/issues/66).

### Why isn't module resolution working?

There are currently some missing features in module resolution that you might be
hitting. Please comment on the issue if it affects you:

- Imports are only transformed in project source files, not in transitive
  imports
  ([#104](https://github.com/PolymerLabs/playground-elements/issues/104))
- Imports in HTML files are not transformed
  ([#93](https://github.com/PolymerLabs/playground-elements/issues/93))
- Dynamic imports are not transformed
  ([#27](https://github.com/PolymerLabs/playground-elements/issues/27))
- The import map `scopes` field is not supported
  ([#103](https://github.com/PolymerLabs/playground-elements/issues/103))
