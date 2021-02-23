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

export const tokens = [
  {
    id: 'codeBackground',
    label: 'Background',
    cssProperty: '--playground-code-background',
    defaultValue: '#ffffff',
  },
  {
    id: 'synDefault',
    label: 'Default',
    cssProperty: '--playground-code-default-color',
    cmClass: '.CodeMirror-line [role="presentation"]',
    defaultValue: '#000000',
  },
  {
    id: 'synKeyword',
    label: 'Keyword',
    cssProperty: '--playground-code-keyword-color',
    cmClass: 'cm-keyword',
    defaultValue: '#770088',
  },
  {
    id: 'synAtom',
    label: 'Atom',
    cssProperty: '--playground-code-atom-color',
    cmClass: 'cm-atom',
    defaultValue: '#221199',
  },
  {
    id: 'synNumber',
    label: 'Number',
    cssProperty: '--playground-code-number-color',
    cmClass: 'cm-number',
    defaultValue: '#116644',
  },
  {
    id: 'synDef',
    label: 'Def',
    cssProperty: '--playground-code-def-color',
    cmClass: 'cm-def',
    defaultValue: '#0000ff',
  },
  {
    id: 'synVariable',
    label: 'Variable',
    cssProperty: '--playground-code-variable-color',
    cmClass: 'cm-variable',
    defaultValue: '#000000',
  },
  {
    id: 'synProperty',
    label: 'Property',
    cssProperty: '--playground-code-property-color',
    cmClass: 'cm-property',
    defaultValue: '#000000',
  },
  {
    id: 'synOperator',
    label: 'Operator',
    cssProperty: '--playground-code-operator-color',
    cmClass: 'cm-operator',
    defaultValue: '#000000',
  },
  {
    id: 'synVariable2',
    label: 'Variable 2',
    cssProperty: '--playground-code-variable-2-color',
    cmClass: 'cm-variable-2',
    defaultValue: '#0055aa',
  },
  {
    id: 'synVariable3',
    label: 'Variable 3',
    cssProperty: '--playground-code-variable-3-color',
    cmClass: 'cm-variable-3',
    defaultValue: '#008855',
  },
  {
    id: 'synType',
    label: 'Type',
    cssProperty: '--playground-code-type-color',
    cmClass: 'cm-type',
    defaultValue: '#008855',
  },
  {
    id: 'synComment',
    label: 'Comment',
    cssProperty: '--playground-code-comment-color',
    cmClass: 'cm-comment',
    defaultValue: '#aa5500',
  },
  {
    id: 'synString',
    label: 'String',
    cssProperty: '--playground-code-string-color',
    cmClass: 'cm-string',
    defaultValue: '#aa1111',
  },
  {
    id: 'synString2',
    label: 'String 2',
    cssProperty: '--playground-code-string-2-color',
    cmClass: 'cm-string-2',
    defaultValue: '#ff5500',
  },
  {
    id: 'synMeta',
    label: 'Meta',
    cssProperty: '--playground-code-meta-color',
    cmClass: 'cm-meta',
    defaultValue: '#555555',
  },
  {
    id: 'synQualifier',
    label: 'Qualifier',
    cssProperty: '--playground-code-qualifier-color',
    cmClass: 'cm-qualifier',
    defaultValue: '#555555',
  },
  {
    id: 'synBuiltin',
    label: 'Builtin',
    cssProperty: '--playground-code-builtin-color',
    cmClass: 'cm-builtin',
    defaultValue: '#3300aa',
  },
  {
    id: 'synTag',
    label: 'Tag',
    cssProperty: '--playground-code-tag-color',
    cmClass: 'cm-tag',
    defaultValue: '#117700',
  },
  {
    id: 'synAttribute',
    label: 'Attribute',
    cssProperty: '--playground-code-attribute-color',
    cmClass: 'cm-attribute',
    defaultValue: '#0000cc',
  },
  {
    id: 'synCallee',
    label: 'Callee',
    cssProperty: '--playground-code-callee-color',
    cmClass: 'cm-callee',
    defaultValue: '#000000',
  },
  // TODO(aomarks) local?
] as const;
