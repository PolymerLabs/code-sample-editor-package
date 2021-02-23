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

/**
 * This kinda turned into something like storybook.js and similar. Maybe we
 * should just use another library.
 */

import {themeNames} from './themes.js';
import {tokens} from './highlight-tokens.js';

interface BaseKnob<Id extends string, T> {
  id: Id;
  label: string;
  section: string;
  default: T;
  cssProperty?: string;
  formatCss?: (value: T) => string;
  htmlAttribute?: string;
}

interface CheckboxKnob<Id extends string> extends BaseKnob<Id, boolean> {
  type: 'checkbox';
}

interface SliderKnob<Id extends string> extends BaseKnob<Id, number> {
  type: 'slider';
  min: number;
  max: number;
}

interface ColorKnob<Id extends string> extends BaseKnob<Id, string> {
  type: 'color';
  unsetLabel?: string;
  // Gross hack. When we load a new theme, we change color knob defaults. But if
  // we switch back to the default theme, this is how we know what the original
  // default was.
  originalDefault?: string;
}

interface SelectKnob<Id extends string, T extends string>
  extends BaseKnob<Id, T> {
  type: 'select';
  options: ReadonlyArray<T>;
}

function checkbox<Id extends string>(
  def: Omit<CheckboxKnob<Id>, 'type'>
): CheckboxKnob<Id> {
  return {type: 'checkbox', ...def};
}

function slider<Id extends string>(
  def: Omit<SliderKnob<Id>, 'type'>
): SliderKnob<Id> {
  return {type: 'slider', ...def};
}

function color<Id extends string>(
  def: Omit<ColorKnob<Id>, 'type'>
): ColorKnob<Id> {
  return {type: 'color', ...def};
}

function select<Id extends string, T extends string>(
  def: Omit<SelectKnob<Id, T>, 'type'>
): SelectKnob<Id, T> {
  return {type: 'select', ...def};
}

const pixels = (value: number) => value + 'px';

export const knobs = [
  // code style
  select({
    id: 'theme',
    label: 'Theme',
    section: 'code',
    options: ['default', ...themeNames],
    default: 'default',
  }),
  slider({
    id: 'fontSize',
    label: 'Font size',
    section: 'code',
    cssProperty: '--playground-code-font-size',
    formatCss: pixels,
    min: 1,
    max: 30,
    default: 14,
  }),
  select({
    id: 'fontFamily',
    label: 'Font',
    section: 'code',
    cssProperty: '--playground-code-font-family',
    options: ['monospace', 'Roboto Mono', 'Source Code Pro', 'Ubuntu Mono'],
    formatCss: (value: string | number | boolean) => {
      if (value !== 'monospace') {
        return `${value}, monospace`;
      }
      return value;
    },
    default: 'monospace',
  }),

  ...tokens.map((token) => {
    const {id, label, cssProperty, defaultValue} = token;
    return color({
      id,
      label,
      cssProperty,
      default: defaultValue,
      originalDefault: defaultValue,
      section: 'code',
    });
  }),

  // features
  checkbox({
    id: 'resizable',
    label: 'Resizable',
    section: 'features',
    default: false,
    htmlAttribute: 'resizable',
  }),
  checkbox({
    id: 'editableFileSystem',
    label: 'Editable filesystem',
    section: 'features',
    default: false,
    htmlAttribute: 'editable-file-system',
  }),
  checkbox({
    id: 'lineNumbers',
    label: 'Line numbers',
    section: 'features',
    default: false,
    htmlAttribute: 'line-numbers',
  }),

  // general appearance
  color({
    id: 'highlight',
    label: 'Highlight',
    cssProperty: '--playground-highlight-color',
    default: '#6200ee',
    section: 'general appearance',
  }),
  color({
    id: 'pageBackground',
    label: 'Page background',
    default: '#cccccc',
    originalDefault: '#cccccc',
    section: 'general appearance',
  }),
  slider({
    id: 'radius',
    label: 'Radius',
    cssProperty: 'border-radius',
    formatCss: pixels,
    min: 0,
    max: 30,
    default: 0,
    section: 'general appearance',
  }),
  checkbox({
    id: 'borders',
    label: 'Borders',
    cssProperty: '--playground-border',
    formatCss: (value: string | number | boolean) =>
      value ? '1px solid #ddd' : 'none',
    default: true,
    section: 'general appearance',
  }),

  // tab bar
  color({
    id: 'tabBarBackground',
    label: 'Background',
    cssProperty: '--playground-tab-bar-background',
    default: '#eaeaea',
    section: 'tab bar',
  }),
  color({
    id: 'tabBarForeground',
    label: 'Foreground',
    cssProperty: '--playground-tab-bar-foreground-color',
    default: '#000000',
    section: 'tab bar',
  }),
  slider({
    id: 'barHeight',
    label: 'Bar height',
    cssProperty: '--playground-bar-height',
    formatCss: pixels,
    min: 10,
    max: 100,
    default: 40,
    section: 'tab bar',
  }),

  // preview
  color({
    id: 'previewToolbarBackground',
    label: 'Background',
    cssProperty: '--playground-preview-toolbar-background',
    default: '#ffffff',
    section: 'preview',
  }),
  color({
    id: 'previewToolbarForeground',
    label: 'Foreground',
    cssProperty: '--playground-preview-toolbar-foreground-color',
    default: '#444444',
    section: 'preview',
  }),
  slider({
    id: 'previewWidth',
    label: 'Preview width',
    cssProperty: '--playground-preview-width',
    formatCss: (val) => `${val}%`,
    min: 0,
    max: 100,
    default: 30,
    section: 'preview',
  }),
] as const;

export type Knob = typeof knobs[number];
export type KnobId = Knob['id'];

type KnobsById = {[K in Knob as K['id']]: K};
export const knobsById = {} as KnobsById;
export const knobsBySection = {} as {[section: string]: Knob[]};
for (const knob of knobs) {
  // Cast to an arbitrary specific Knob type here because TypeScript isn't quite
  // clever enough to know that the id will match the type.
  knobsById[(knob as typeof knobs[0]).id] = knob as typeof knobs[0];
  let catArr = knobsBySection[knob.section];
  if (catArr === undefined) {
    catArr = knobsBySection[knob.section] = [];
  }
  catArr.push(knob);
}
export const knobIds = Object.keys(knobsById) as KnobId[];
export const knobSectionNames = Object.keys(knobsBySection);

export type KnobsOfType<T extends Knob['type']> = Exclude<
  {
    [K in Knob as K['id']]: K extends {type: T} ? K : never;
  }[KnobId],
  never
>;

export type KnobValueType<T extends KnobId> = KnobsById[T]['default'];

export class KnobValues {
  private values = new Map<KnobId, Knob['default']>();

  getValue<T extends KnobId>(id: T): KnobValueType<T> {
    if (this.values.has(id)) {
      return this.values.get(id) as any;
    }
    return knobsById[id].default as any;
  }

  setValue<T extends KnobId>(id: T, value: KnobValueType<T>) {
    this.values.set(id, value);
  }
}
