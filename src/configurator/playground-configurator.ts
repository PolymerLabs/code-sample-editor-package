/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
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
import {nothing} from 'lit-html';

import '../playground-ide.js';
import {PlaygroundIde} from '../playground-ide.js';
import '../playground-code-editor.js';
import {
  Knob,
  KnobId,
  KnobValueType,
  KnobValues,
  KnobsOfType,
  knobIds,
  knobSectionNames,
  knobs,
  knobsById,
  knobsBySection,
} from './knobs.js';
import {themeStyles} from './themes.js';
import '@material/mwc-dialog';
import '@material/mwc-button';
import './playground-theme-detector.js';
import {tokens} from './highlight-tokens.js';

/**
 * A configurator for the playground-* elements.
 */
@customElement('playground-configurator')
export class PlaygroundConfigurator extends LitElement {
  static styles = [
    ...themeStyles,
    css`
      :host {
        display: flex;
        font-family: Roboto, Arial, Helvetica, sans-serif;
      }

      #lhs {
        overflow-y: auto;
        width: 300px;
        border-right: 1px solid #ccc;
        box-shadow: -2px 0 6px 0px rgb(0 0 0 / 50%);
        z-index: 1;
        color: #424242;
        font-size: 13px;
      }

      #rhs {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;
      }

      #container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        /* To position the GitHub cat corner. */
        position: relative;
      }

      playground-ide {
        flex: 1;
        margin: 50px;
        max-width: 900px;
      }

      #code {
        display: flex;
        flex-wrap: wrap;
        border-top: 1px solid #ccc;
        height: 30%;
        overflow-y: auto;
        padding: 10px;
        --playground-code-font-family: 'Roboto Mono', monospace;
        --playground-code-font-size: 12px;
        --playground-code-background: transparent;
        background-color: #f7f7f7;
      }

      #code > div {
        min-width: 50%;
      }

      h3 {
        color: #949494;
        font-weight: 400;
        text-transform: uppercase;
      }

      #code h3 {
        margin: 0;
      }

      #lhs section {
        padding: 15px;
        border-bottom: 1px solid #ccc;
      }

      .sectionLabel {
        margin-top: 5px;
      }

      .knobs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        row-gap: 15px;
        column-gap: 10px;
        align-items: center;
      }

      input[type='color'] {
        width: 30px;
      }

      .knobs label {
        text-align: right;
        cursor: pointer;
      }

      #container {
        flex: 1;
      }

      .knobs select {
        grid-column: 2 / -1;
      }

      .sliderAndValue {
        display: flex;
        align-items: center;
        grid-column: 2 / -1;
      }

      .sliderValue {
        margin-left: 5px;
      }

      #openDetectorButton {
        background: #0075ff;
        opacity: 0.8;
        color: white;
        padding: 5px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        font-size: 14px;
        grid-column-start: 2;
        grid-column-end: -1;
      }

      #openDetectorButton:hover {
        opacity: 1;
      }
    `,
  ];

  private values = new KnobValues();

  @internalProperty()
  private _themeDetectorOpen = false;

  @query('playground-ide')
  private _ide!: PlaygroundIde;

  connectedCallback() {
    super.connectedCallback();
    this.readUrlParams(new URL(document.location.href).searchParams);
  }

  private async setValue<T extends KnobId>(id: T, value: KnobValueType<T>) {
    await this.setValues(
      new Map<KnobId, unknown>([[id, value]])
    );
  }

  private async setValues(values: Map<KnobId, unknown>) {
    // Apply the theme first, because it sets new defaults, and we want any
    // other values to take precedence.
    const theme = values.get('theme');
    if (theme) {
      await this._applyTheme(theme as KnobValueType<'theme'>);
    }
    for (const [id, value] of values) {
      this.values.setValue(id, value as any);
    }
    this.setUrlParams();
    this.requestUpdate();
  }

  private async _applyTheme(theme: KnobValueType<'theme'>) {
    this.values.setValue('theme', theme);

    if (theme === 'default') {
      // The default theme isn't a stylesheet we can load and probe. We just
      // have to know the original colors.
      for (const token of tokens) {
        const knob = knobsById[token.id];
        if (knob.originalDefault) {
          knob.default = knob.originalDefault;
        }
        this.values.setValue(knob.id, knob.default);
      }
      this.setUrlParams();
      this.requestUpdate();
      return;
    }

    // Reset each syntax highlighting knob to its default.
    for (const token of tokens) {
      const knob = knobsById[token.id];
      this.values.setValue(knob.id, knob.default);
    }

    // Update to apply the theme stylesheet.
    this.requestUpdate();
    await this.updateComplete;

    // Extract the new custom property values from the theme stylesheet for each
    // syntax token.
    const style = window.getComputedStyle(this._ide);
    for (const token of tokens) {
      const knob = knobsById[token.id];
      if (!knob.cssProperty) {
        continue;
      }

      const rgb = style.getPropertyValue(knob.cssProperty);
      const hex = toHex(rgb);

      // Change the value and the default. Change the default because the theme
      // already applies this value.
      this.values.setValue(knob.id, hex);
      knob.default = hex;
    }
  }

  private readUrlParams(params: URLSearchParams) {
    const values = new Map<KnobId, unknown>();
    for (const id of knobIds) {
      let urlValue = params.get(id);
      if (urlValue === null) {
        continue;
      }
      const knob = knobsById[id];
      switch (knob.type) {
        case 'checkbox':
          values.set(knob.id, urlValue === 'y');
          break;
        case 'color':
          values.set(knob.id, '#' + urlValue);
          break;
        case 'slider':
          values.set(knob.id, Number(urlValue));
          break;
        case 'select':
          values.set(knob.id, urlValue);
          break;
        default:
          throwUnreachable(knob, `Unexpected knob type ${(knob as Knob).type}`);
      }
    }
    this.setValues(values);
  }

  private setUrlParams() {
    const params = new URLSearchParams();
    for (const knob of knobs) {
      let value = this.values.getValue(knob.id);
      if (value === knob.default) {
        continue;
      }
      switch (knob.type) {
        case 'checkbox':
          params.set(knob.id, (value as boolean) ? 'y' : 'n');
          break;
        case 'color':
          params.set(knob.id, (value as string).substring(1));
          break;
        case 'slider':
          params.set(knob.id, String(value as number));
          break;
        case 'select':
          params.set(knob.id, value as string);
          break;
        default:
          throwUnreachable(knob, `Unexpected knob type ${(knob as Knob).type}`);
      }
    }
    history.replaceState(null, '', '?' + params.toString());
  }

  render() {
    return html`
      <style>
        ${this.cssText}
      </style>

      <mwc-dialog
        hideActions
        id="detectorDialog"
        .open=${this._themeDetectorOpen}
        @closed=${this._closeThemeDetector}
      >
        ${this._themeDetectorOpen
          ? html`<playground-theme-detector
              @apply=${this._onThemeDetectorApply}
              @cancel=${this._closeThemeDetector}
            ></playground-theme-detector>`
          : nothing}
      </mwc-dialog>

      <div id="lhs">${this.knobs}</div>

      <div id="rhs">
        <div
          id="container"
          style="background-color:${this.values.getValue('pageBackground')}"
        >
          <playground-ide
            id="playground"
            class="playground-theme-${this.values.getValue('theme')}"
            .lineNumbers=${this.values.getValue('lineNumbers')}
            .resizable=${this.values.getValue('resizable')}
            .editableFileSystem=${this.values.getValue('editableFileSystem')}
            project-src="./project/project.json"
          >
          </playground-ide>

          ${githubCorner}
        </div>

        <div id="code">
          <div>
            <h3>CSS</h3>
            <playground-code-editor .value=${this.cssText} type="css" readonly>
            </playground-code-editor>
          </div>

          <div>
            <h3>HTML</h3>
            <playground-code-editor
              .value=${this.htmlText}
              type="html"
              readonly
            >
            </playground-code-editor>
          </div>
        </div>
      </div>
    `;
  }

  private get knobs() {
    return knobSectionNames.map(
      (section) =>
        html`<section>
          <h3 class="sectionLabel">${section}</h3>
          <div class="knobs">
            ${knobsBySection[section].map((knob) => this.knob(knob))}
          </div>
        </section>`
    );
  }

  private get htmlText() {
    return `${this.themeImport}
<playground-ide id="playground"${this.htmlTextAttributes}>
</playground-ide>
`;
  }

  private get themeImport() {
    const theme = this.values.getValue('theme');
    if (theme === 'default') {
      return '';
    }
    return `<import rel="stylesheet"
        src="/node_modules/playground-elements/themes/${theme}.css">\n`;
  }

  private get htmlTextAttributes() {
    const attributes = [];
    for (const id of knobIds) {
      const knob: Knob = knobsById[id];
      if (!knob.htmlAttribute) {
        continue;
      }
      const value = this.values.getValue(id);
      if (value === knob.default) {
        continue;
      }
      switch (knob.type) {
        case 'checkbox':
          if (value) {
            attributes.push(`\n  ${knob.htmlAttribute}`);
          }
          break;
        default:
          attributes.push(`\n  ${knob.htmlAttribute}="${value}"`);
          break;
      }
    }
    const theme = this.values.getValue('theme');
    if (theme !== 'default') {
      attributes.push(`\n  class="playground-theme-${theme}"`);
    }
    return attributes.join('');
  }

  private get cssText() {
    const props = [];
    for (const id of knobIds) {
      const knob: Knob = knobsById[id];
      if (!(knob as Knob).cssProperty) {
        continue;
      }
      const value = this.values.getValue(id);
      let line = `${knob.cssProperty}: ${
        knob.formatCss ? (knob as any).formatCss(value) : value
      };`;
      if (value === knob.default) {
        continue;
      } else {
        line = `  ${line}`;
      }
      props.push(line);
    }
    return `
#playground {
${props.join('\n')}
}
    `;
  }

  private knob(knob: Knob) {
    let widget;
    switch (knob.type) {
      case 'select':
        widget = this.selectKnob(knob);
        break;
      case 'slider':
        widget = this.sliderKnob(knob);
        break;
      case 'color':
        widget = this.colorKnob(knob);
        break;
      case 'checkbox':
        widget = this.checkboxKnob(knob);
    }
    if (!widget) {
      return nothing;
    }
    const label = html`<label for=${knob.id}>${knob.label}</label>`;
    if (knob.id === 'theme') {
      const themeButton = html`<button
        id="openDetectorButton"
        @click=${this._openThemeDetector}
      >
        Import Theme
      </button>`;
      return [label, widget, html`<span></span>`, themeButton];
    }
    return [label, widget];
  }

  private selectKnob(knob: KnobsOfType<'select'>) {
    const value = this.values.getValue(knob.id);
    return html`
      <select
        id=${knob.id}
        @input=${(event: Event & {target: HTMLSelectElement}) => {
          this.setValue(knob.id, event.target.value as any);
        }}
      >
        ${(knob.options as ReadonlyArray<string>).map(
          (option) =>
            html`<option value=${option} ?selected=${option === value}>
              ${option}
            </option>`
        )}
      </select>
    `;
  }

  private sliderKnob(knob: KnobsOfType<'slider'>) {
    const value = this.values.getValue(knob.id);
    return html`
      <span class="sliderAndValue">
        <input
          id=${knob.id}
          type="range"
          min=${knob.min}
          max=${knob.max}
          value=${value}
          @input=${(event: Event & {target: HTMLInputElement}) => {
            this.setValue(knob.id, Number(event.target.value));
          }}
        />
        <span class="sliderValue"
          >${knob.formatCss ? knob.formatCss(value) : value}</span
        >
      </span>
    `;
  }

  private colorKnob(knob: KnobsOfType<'color'>) {
    let value = this.values.getValue(knob.id);
    return html`
      ${'unsetLabel' in knob
        ? html`
            <div style="margin-bottom: 5px">
              <input
                id=${knob.id + '-unset'}
                type="checkbox"
                ?checked=${value === ''}
                @input=${(event: Event & {target: HTMLInputElement}) => {
                  value = event.target.checked ? '' : '#ffffff';
                  this.setValue(knob.id, value);
                }}
              />
              <label for=${knob.id + '-unset'}> ${knob.unsetLabel}</label>
            </div>
            <span></span>
          `
        : ''}
      <input
        id=${knob.id}
        type="color"
        .value=${value === '' ? '#ffffff' : String(value)}
        @input=${(event: Event & {target: HTMLInputElement}) => {
          this.setValue(knob.id, event.target.value);
        }}
      />
    `;
  }

  private checkboxKnob(knob: KnobsOfType<'checkbox'>) {
    let value = this.values.getValue(knob.id);
    return html`
      <input
        id=${knob.id}
        type="checkbox"
        ?checked=${value}
        @change=${(event: Event & {target: HTMLInputElement}) => {
          this.setValue(knob.id, event.target.checked);
        }}
      />
    `;
  }

  private _openThemeDetector() {
    this._themeDetectorOpen = true;
  }

  private _closeThemeDetector() {
    this._themeDetectorOpen = false;
  }

  private async _onThemeDetectorApply(
    event: CustomEvent<{properties: Map<string, string | null>}>
  ) {
    const values = new Map<KnobId, any>();
    values.set('theme', 'default');

    const propertyToHex = new Map<string, string | undefined>();
    for (const [property, rgb] of event.detail.properties) {
      propertyToHex.set(property, rgb ? toHex(rgb) : undefined);
    }

    const defaultColorKnob = knobsById['synDefault'];
    const defaultColor =
      propertyToHex.get(defaultColorKnob.cssProperty!) ||
      defaultColorKnob.default;

    for (const knob of knobs) {
      if (knob.cssProperty) {
        if (propertyToHex.has(knob.cssProperty)) {
          const hex = propertyToHex.get(knob.cssProperty) || defaultColor;
          values.set(knob.id, hex);
        }
      }
    }

    this.setValues(values);

    this._closeThemeDetector();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'playground-configurator': PlaygroundConfigurator;
  }
}

function throwUnreachable(_x: never, msg: string) {
  throw new Error(msg);
}

/**
 * https://tholman.com/github-corners/
 */
const githubCorner = html`<a
    href="https://github.com/PolymerLabs/playground-elements"
    class="github-corner"
    aria-label="View source on GitHub"
    ><svg
      width="80"
      height="80"
      viewBox="0 0 250 250"
      style="fill:#00000033; color:#fff; position: absolute; top: 0; border: 0; right: 0;"
      aria-hidden="true"
    >
      <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
      <path
        d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
        fill="currentColor"
        style="transform-origin: 130px 106px;"
        class="octo-arm"
      ></path>
      <path
        d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
        fill="currentColor"
        class="octo-body"
      ></path></svg></a
  ><style>
    .github-corner:hover .octo-arm {
      animation: octocat-wave 560ms ease-in-out;
    }
    @keyframes octocat-wave {
      0%,
      100% {
        transform: rotate(0);
      }
      20%,
      60% {
        transform: rotate(-25deg);
      }
      40%,
      80% {
        transform: rotate(10deg);
      }
    }
    @media (max-width: 500px) {
      .github-corner:hover .octo-arm {
        animation: none;
      }
      .github-corner .octo-arm {
        animation: octocat-wave 560ms ease-in-out;
      }
    }
  </style>`;

/**
 * Convert "rgb(r, g, b)" to "#rrggbb".
 */
const toHex = (rgbStr: string): string => {
  const match = rgbStr.match(
    /^\s*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/
  );
  if (!match) {
    return '';
  }
  const [, r, g, b] = match;
  const toHex = (decStr: string) =>
    Number(decStr).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
