/**
 * PlantUML Monaco language definition.
 *
 * Tokens: keyword (start/end blocks, control flow), type (class/interface/...),
 * operator (arrows), string (notes, labels), comment, number, identifier.
 *
 * Snippets cover ~90% of what users type. The completion provider is wired
 * to trigger on letter characters so a `c` typed at the start of a line
 * offers `class`, `component`, etc.
 */

import type { Monaco } from '@monaco-editor/react';

const KEYWORDS_BLOCK = [
  'startuml', 'enduml',
  'startmindmap', 'endmindmap',
  'startgantt', 'endgantt',
  'startsalt', 'endsalt',
  'startjson', 'endjson',
  'startyaml', 'endyaml',
  'startdot', 'enddot',
  'startmermaid', 'endmermaid',
  'startcreole', 'endcreole',
  'startmath', 'endmath',
  'startditaa', 'endditaa',
  'startebnf', 'endebnf',
  'startregex', 'endregex',
  'startflow', 'endflow',
  'startchronology', 'endchronology',
];

const KEYWORDS_CONTROL = [
  'if', 'else', 'endif', 'elseif',
  'while', 'endwhile',
  'fork', 'endfork', 'forkagain',
  'switch', 'case', 'endswitch',
  'repeat', 'backward', 'repeat',
  'group', 'endgroup',
  'note', 'across',
  'split', 'again', 'end',
  'detach', 'destroy', 'create',
];

const KEYWORDS_LAYOUT = [
  'title', 'header', 'footer', 'legend',
  'skinparam', 'skin', 'hide', 'show',
  'left', 'right', 'top', 'bottom', 'to', 'of',
  'direction', 'top', 'down',
  'together', 'allow_mixing',
];

const KEYWORDS_TYPES = [
  'class', 'interface', 'abstract', 'enum', 'annotation',
  'object', 'map', 'entity', 'exception',
  'actor', 'participant', 'usecase', 'component', 'node', 'frame',
  'database', 'queue', 'stack', 'cloud', 'rectangle',
  'state', 'package', 'namespace', 'folder',
  'person', 'boundary', 'control', 'collections',
];

const KEYWORDS_PREPROC = [
  'include', 'includeurl', 'import', 'definelong', 'enddefinelong',
  'define', 'undef', 'function', 'procedure',
  'return', 'while', 'if', 'else', 'endif',
  'pragma', 'assert', 'check', 'pause', 'kill',
];

const ARROWS = [
  '->', '<-', '-->', '<--', '->>', '<<-',
  '..>', '<..', '..>>', '<<..',
  '==>', '<==',
  '--', '..', '__',
  ':>', ':*', ':o',
];

export function registerPlantumlLanguage(monaco: Monaco): void {
  const langId = 'plantuml';

  if (monaco.languages.getLanguages().some((l: any) => l.id === langId)) {
    return; // already registered (HMR safety)
  }

  monaco.languages.register({
    id: langId,
    extensions: ['.puml', '.plantuml', '.iuml', '.wsd'],
    aliases: ['PlantUML', 'plantuml'],
    mimetypes: ['text/x-plantuml'],
  });

  monaco.languages.setLanguageConfiguration(langId, {
    comments: { lineComment: "'", blockComment: ["/'", "/'"] },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
      ['<<', '>>'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*(\{|\(|\[)$/,
      decreaseIndentPattern: /^\s*(\}|\)|\])$/,
    },
  });

  monaco.languages.setMonarchTokensProvider(langId, {
    defaultToken: '',
    tokenPostfix: '.puml',

    tokenizer: {
      root: [
        // block keywords (startuml/enduml, startmindmap/...)
        [new RegExp(`\\b(${KEYWORDS_BLOCK.join('|')})\\b`, 'i'), 'keyword.block'],

        // control flow
        [new RegExp(`\\b(${KEYWORDS_CONTROL.join('|')})\\b`, 'i'), 'keyword.control'],

        // layout/directive
        [new RegExp(`\\b(${KEYWORDS_LAYOUT.join('|')})\\b`, 'i'), 'keyword.layout'],

        // types / shapes
        [new RegExp(`\\b(${KEYWORDS_TYPES.join('|')})\\b`, 'i'), 'type'],

        // preprocessor (must come BEFORE single-line comments so that
        // '!include' isn't eaten by the comment rule)
        [new RegExp(`(@|!)\\s*(${KEYWORDS_PREPROC.join('|')})\\b`, 'i'), 'keyword.preproc'],

        // arrows
        [new RegExp(`(${ARROWS.map((a) => a.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|')})`), 'operator'],

        // block comment open /' - before strings so a /' inside a string
        // doesn't accidentally start a comment
        [/\/'/, 'comment', '@comment'],

        // strings - keep BEFORE any single-quote rule so quoted strings
        // aren't lost to the (legacy) line-comment regex
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],

        // numbers
        [/\b\d+(\.\d+)?\b/, 'number'],

        // identifiers
        [/[a-zA-Z_][\w-]*/, 'identifier'],

        // catch-all so the tokenizer always makes progress - a stray
        // '@' or unknown character would otherwise halt tokenization.
        [/./, 'text'],
      ],

      comment: [
        // Block comment closer must come first so it wins over the
        // single-char catch-all. Monarch matches rules top-down.
        [/\/'/, 'comment', '@pop'],
        [/./, 'comment'],
      ],
    },
  });

  // Completion provider - snippets triggered on letters.
  monaco.languages.registerCompletionItemProvider(langId, {
    triggerCharacters: ['@', '!', ':', '<', '-', '.', ' ', '\n'],
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      );

      const items: any[] = [
        blockSnippet(monaco, 'startuml', '@startuml', '@startuml\n$0\n@enduml', range),
        blockSnippet(monaco, 'startmindmap', '@startmindmap', '@startmindmap\n* $0\n@endmindmap', range),
        blockSnippet(monaco, 'startgantt', '@startgantt', '@startgantt\n$0\n@endgantt', range),
        blockSnippet(monaco, 'startsalt', '@startsalt', '@startsalt\n$0\n@endsalt', range),

        snippet(monaco, 'class', 'class ${1:Name} {\n  ${2:attributes}\n  ${3:methods}\n}', range, 'class block'),
        snippet(monaco, 'participant', 'participant ${1:Alias} as "${2:Display Name}"', range, 'sequence participant'),
        snippet(monaco, 'actor', 'actor ${1:Name}', range, 'sequence actor'),
        snippet(monaco, 'note', 'note ${1|left,right,top,bottom|} : ${2:text}', range, 'note'),
        snippet(monaco, 'if', 'if (${1:condition}) then (${2:label})\n  ${3:body}\nendif', range, 'if/endif'),
        snippet(monaco, 'while', 'while (${1:condition})\n  ${2:body}\nendwhile', range, 'while/endwhile'),
        snippet(monaco, 'for', 'repeat\n  ${1:body}\nrepeat while (${2:condition})', range, 'repeat loop'),

        snippet(monaco, 'arrow-sync', '${1:A} -> ${2:B}: ${3:message}', range, 'sync message'),
        snippet(monaco, 'arrow-return', '${1:A} --> ${2:B}: ${3:reply}', range, 'return message'),
        snippet(monaco, 'arrow-async', '${1:A} ->> ${2:B}: ${3:async}', range, 'async message'),

        snippet(monaco, 'skinparam', 'skinparam ${1:parameter} ${2:value}', range, 'skinparam'),

        // keyword completions as plain text
        keywordCompletions(monaco, range),
      ];
      return { suggestions: items };
    },
  });
}

function blockSnippet(monaco: Monaco, label: string, _insertText: string, body: string, range: any): any {
  return {
    label: { label, description: 'PlantUML block' },
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: body,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  };
}

function snippet(monaco: Monaco, label: string, body: string, range: any, description: string): any {
  return {
    label: { label, description },
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: body,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  };
}

function keywordCompletions(monaco: Monaco, range: any): any[] {
  const kws = [
    ...KEYWORDS_BLOCK,
    ...KEYWORDS_CONTROL,
    ...KEYWORDS_LAYOUT,
    ...KEYWORDS_TYPES,
    ...KEYWORDS_PREPROC,
  ];
  return kws.map((kw) => ({
    label: { label: kw, description: 'PlantUML keyword' },
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: kw,
    range,
  }));
}

// ---------------------------------------------------------------------------
// Custom themes. Use the same color tokens as the app shell so the editor
// feels native instead of "vscode-in-electron".
// ---------------------------------------------------------------------------

export const PLANTUML_DARK_THEME: any = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword.block', foreground: '67e8f9', fontStyle: 'bold' },    // cyan-300 - block boundaries
    { token: 'keyword.control', foreground: 'fda4af', fontStyle: 'bold' },  // rose-300 - control flow
    { token: 'keyword.layout', foreground: 'fcd34d' },                      // amber-300 - directives
    { token: 'keyword.preproc', foreground: 'fcd34d' },
    { token: 'type', foreground: '5eead4' },                                // teal-300 - shapes
    { token: 'operator', foreground: 'f0fdfa', fontStyle: 'bold' },
    { token: 'string', foreground: 'fde68a' },                              // amber-200
    { token: 'comment', foreground: '475569', fontStyle: 'italic' },
    { token: 'number', foreground: 'c4b5fd' },                              // violet-300 (sparingly used)
    { token: 'identifier', foreground: 'e2e8f0' },
  ],
  colors: {
    'editor.background': '#0a1218',
    'editor.foreground': '#f0fdfa',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#94a3b8',
    'editor.lineHighlightBackground': '#131c26',
    'editor.lineHighlightBorder': '#1c2a37',
    'editor.selectionBackground': '#22d3ee55',
    'editor.inactiveSelectionBackground': '#22d3ee33',
    'editorCursor.foreground': '#22d3ee',
    'editorIndentGuide.background': '#1c2a37',
    'editorIndentGuide.activeBackground': '#2a3645',
    'editorWidget.background': '#0f1721',
    'editorWidget.border': '#1c2a37',
    'editorSuggestWidget.background': '#0f1721',
    'editorSuggestWidget.border': '#1c2a37',
    'editorSuggestWidget.selectedBackground': '#1a2632',
    'editorSuggestWidget.foreground': '#f0fdfa',
    'editorSuggestWidget.highlightForeground': '#22d3ee',
    'editorGutter.background': '#0a1218',
    'scrollbarSlider.background': '#1c2a37',
    'scrollbarSlider.hoverBackground': '#2a3645',
    'scrollbarSlider.activeBackground': '#475569',
    'editorMarkerNavigation.background': '#0f1721',
    'editorMarkerNavigationInfo.background': '#0f1721',
  },
};

export const PLANTUML_LIGHT_THEME: any = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword.block', foreground: '0f766e', fontStyle: 'bold' },   // teal-700
    { token: 'keyword.control', foreground: 'be123c', fontStyle: 'bold' }, // rose-700
    { token: 'keyword.layout', foreground: 'b45309' },                     // amber-700
    { token: 'keyword.preproc', foreground: 'b45309' },
    { token: 'type', foreground: '0e7490' },                               // cyan-700
    { token: 'operator', foreground: '#1a1a1a', fontStyle: 'bold' },
    { token: 'string', foreground: '92400e' },                             // amber-800
    { token: 'comment', foreground: '#a8a29e', fontStyle: 'italic' },
    { token: 'number', foreground: '#6d28d9' },                            // violet-700 (rare)
    { token: 'identifier', foreground: '#1a1a1a' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1a1a1a',
    'editorLineNumber.foreground': '#a8a29e',
    'editorLineNumber.activeForeground': '#57534e',
    'editor.lineHighlightBackground': '#f5f5f4',
    'editor.lineHighlightBorder': '#e7e5e4',
    'editor.selectionBackground': '#0f766e33',
    'editor.inactiveSelectionBackground': '#0f766e22',
    'editorCursor.foreground': '#0f766e',
    'editorIndentGuide.background': '#e7e5e4',
    'editorIndentGuide.activeBackground': '#d6d3d1',
    'editorWidget.background': '#ffffff',
    'editorWidget.border': '#e7e5e4',
    'editorSuggestWidget.background': '#ffffff',
    'editorSuggestWidget.border': '#e7e5e4',
    'editorSuggestWidget.selectedBackground': '#f4f4f3',
    'editorSuggestWidget.foreground': '#1a1a1a',
    'editorSuggestWidget.highlightForeground': '#0f766e',
    'editorGutter.background': '#ffffff',
    'scrollbarSlider.background': '#e7e5e4',
    'scrollbarSlider.hoverBackground': '#d6d3d1',
    'scrollbarSlider.activeBackground': '#a8a29e',
  },
};
