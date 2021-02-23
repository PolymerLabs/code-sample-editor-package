/**
 * @license
 * Copyright (c) 2021 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {
  LitElement,
  customElement,
  html,
  css,
  internalProperty,
  query,
} from 'lit-element';
import '../playground-code-editor.js';
import {PlaygroundCodeEditor} from '../playground-code-editor.js';
import '@material/mwc-tab-bar';
import {tokens} from './highlight-tokens.js';

@customElement('playground-theme-detector')
export class PlaygroundThemeDetector extends LitElement {
  static styles = css`
    ol {
      padding-left: 24px;
    }

    li {
      margin-bottom: 1em;
    }

    button,
    label {
      cursor: pointer;
    }

    #pasteArea {
      cursor: pointer;
    }

    iframe {
      width: 100%;
      pointer-events: none;
      margin-bottom: 1em;
    }

    playground-code-editor {
      position: absolute;
      visibility: hidden;
      width: 1px;
      height: 1px;
    }

    #palette {
      display: flex;
      margin-bottom: 2em;
    }

    .color {
      height: 25px;
      flex: 1;
    }

    #buttons {
      display: flex;
      justify-content: flex-end;
    }

    #buttons > button {
      margin-left: 1em;
      font-size: 18px;
    }
  `;

  @internalProperty()
  private _filetype: 'ts' | 'html' | 'css' = 'ts';

  @internalProperty()
  private _iframeSrcdoc: string = '';

  @internalProperty()
  private _codeText: string = '';

  @internalProperty()
  private _propertyValues = new Map<string, string | null>([
    ['--playground-code-background', null],
    ...tokens.map(({cssProperty}) => [cssProperty, null]),
  ] as any);

  @query('iframe')
  private _iframeWithUserHtml!: HTMLIFrameElement;

  @query('playground-code-editor')
  private _playgroundWithUserText!: PlaygroundCodeEditor;

  render() {
    return html`
      <h2>Theme detector</h2>

      <ol>
        <li>
          Pick a theme in VSCode<br />
          or any editor that copies as styled HTML
        </li>

        <li>
          Open a file with a variety of syntax<br />
          or click to copy a sample to paste:
          <br />
          <button @click=${() => this._copySample('ts')}>TypeScript</button>
          <button @click=${() => this._copySample('html')}>HTML</button>
          <button @click=${() => this._copySample('css')}>CSS</button>
        </li>

        <li>Select All and Copy</li>

        <li>
          Confirm the filetype:
          <br />
          <label
            ><input
              type="radio"
              name="type"
              value="ts"
              .checked=${this._filetype === 'ts'}
            />TypeScript</label
          >
          <label
            ><input
              type="radio"
              name="type"
              value="html"
              .checked=${this._filetype === 'html'}
            />HTML</label
          >
          <label
            ><input
              type="radio"
              name="type"
              value="css"
              .checked=${this._filetype === 'css'}
            />CSS</label
          >
        </li>
        <li>Click in the box below to paste and extract:</li>
      </ol>

      <div id="pasteArea" @click=${this._onClickPasteButton}>
        <iframe
          sandbox="allow-same-origin"
          srcdoc=${this._iframeSrcdoc}
          @load=${this._extractStyles}
        ></iframe>
      </div>

      <playground-code-editor
        .type=${this._filetype}
        .value=${this._codeText}
      ></playground-code-editor>

      <div id="palette">
        ${[...this._propertyValues].map(
          ([prop, color]) =>
            html`<span
              class="color"
              title=${prop}
              style="background:${color ?? 'transparent'}"
            ></span>`
        )}
      </div>

      <div id="buttons">
        <button
          @click=${this._onClickApply}
          .disabled=${![...this._propertyValues.values()].some(
            (val) => val !== null
          )}
        >
          Apply
        </button>
        <button @click=${this._onClickCancel}>Cancel</button>
      </div>
    `;
  }

  async firstUpdated() {
    // CodeMirror only renders visible lines plus some margin. Force it to
    // render everything so we can query it.
    await this._playgroundWithUserText.updateComplete;
    (this._playgroundWithUserText as any)._codemirror.setOption(
      'viewportMargin',
      Infinity
    );
  }

  async _copySample(filetype: 'ts' | 'html' | 'css') {
    this._filetype = filetype;
    await navigator.clipboard.writeText(sampleFiles[this._filetype]);
  }

  async _onClickPasteButton() {
    const {html, text} = await this._readClipboard();
    if (!html || !text) {
      return;
    }
    // Load the HTML format of the paste into a sandboxed iframe.
    this._iframeSrcdoc = `<style>body{margin:0}</style>` + html;
    // Load the text format of the paste into our own highlighter.
    this._codeText = text;
  }

  private async _readClipboard(): Promise<{html: string; text: string}> {
    let html = '';
    let text = '';
    const items = await (navigator.clipboard as any).read();
    for (const item of items) {
      for (const type of item.types) {
        if (type === 'text/html') {
          const blob = await item.getType(type);
          html = await blob.text();
        } else if (type === 'text/plain') {
          const blob = await item.getType(type);
          text = await blob.text();
        }
      }
    }
    return {html, text};
  }

  private _extractStyles() {
    if (!this._iframeSrcdoc) {
      // We get an iframe load event even if there is no srcdoc.
      return;
    }

    // Create a map from example text fragments to the CSS property for that
    // token, extracted from *our* version of the highlighted text. E.g.:
    //
    //   import => --playground-code-keyword-color
    //   "foo"  => --playground-code-string-color
    //   42     => --playground-code-number-color
    const fragmentToProperty = new Map<string, string[]>();
    const ourWalker = document.createTreeWalker(
      this._playgroundWithUserText.shadowRoot!,
      NodeFilter.SHOW_TEXT
    );
    while (ourWalker.nextNode()) {
      const textNode = ourWalker.currentNode;
      const parent = textNode.parentElement!;

      let property;
      const cmClasses = [
        ...((parent.classList as unknown) as Iterable<string>),
      ].filter((c) => c.startsWith('cm-'));
      if (cmClasses.length > 0) {
        // The last CodeMirror class tends to be more specific (e.g. `callee` is
        // more specific than `variable`).
        const lastClass = cmClasses[cmClasses.length - 1];
        const cmToken = lastClass.slice('cm-'.length);
        property = `--playground-code-${cmToken}-color`;
      } else if (parent.getAttribute('role') === 'presentation') {
        // Code with no special token classes.
        property = `--playground-code-default-color`;
      } else {
        continue;
      }
      // Some highlighters put HTML angle brackets in their own <span>, but our
      // CodeMirror highlighter doesn't. Trim off the brackets so we're more
      // likely to match.
      const text = textNode.textContent!.replace(/^<\/?/, '').replace(/>$/, '');
      // The same token can appear multiple times but with different meaning. We
      // can assume they'll appear in the same order in the iframe HTML as they
      // do here, which is captured by the order of items in this array.
      let arr = fragmentToProperty.get(text);
      if (!arr) {
        arr = [];
        fragmentToProperty.set(text, arr);
      }
      arr.push(property);
    }

    // Now walk over the HTML pasted by the user. Look for the example fragments
    // we found above and query for their color.
    const doc = this._iframeWithUserHtml.contentDocument!;
    const theirWalker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    );
    let foundBackground = false;
    while (theirWalker.nextNode()) {
      const node = theirWalker.currentNode;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent!.replace(/^<\/?/, '').replace(/>$/, '');
        const property = fragmentToProperty.get(text)?.shift();
        if (property && this._propertyValues.get(property) === null) {
          const color = window.getComputedStyle(node.parentElement!).color;
          this._propertyValues.set(property, color);
        }
      } else if (!foundBackground && node.nodeType === Node.ELEMENT_NODE) {
        // Use the first non-transparent background (depth first).
        const background = window.getComputedStyle(node as Element)
          .backgroundColor;
        if (background !== 'rgba(0, 0, 0, 0)') {
          foundBackground = true;
          this._propertyValues.set('--playground-code-background', background);
        }
      }
    }

    // We updated the properties map in-place.
    this.requestUpdate();
  }

  _onClickApply() {
    this.dispatchEvent(
      new CustomEvent<{properties: Map<string, string | null>}>('apply', {
        detail: {
          properties: this._propertyValues,
        },
      })
    );
  }

  _onClickCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }
}

const sampleFiles = {
  ts: `
// Playground Sample TypeScript file
/* Another kind of comment */
let variable = 1 + 1 === 2 === true;
const fn = (param: number) => param;
fn(3);
'string1';
\`string2\`;
\`string3 \${variable}\`
export class Class {
  property: string;
}
html\`
  <!-- HTML comment -->
  <!DOCTYPE html>
  <button attr="val">text</button>
\`;
css\`
  /* CSS comment */
  p, #id, .class, a, :hover {
    color: red;
    content: 'c';
  }
\`;
`.trim(),

  html: `
<!-- Playground sample HTML file -->
<!DOCTYPE html>
<button attr="val">text</button>
`.trim(),

  css: `
/* Playground sample CSS file */
p, #id, .class, a, :hover {
  color: red;
  content: 'c';
}
`.trim(),
} as const;
