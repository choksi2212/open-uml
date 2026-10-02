import { useRef, useEffect } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { DiagramError } from '../../preload';
import { registerPlantumlLanguage, PLANTUML_DARK_THEME, PLANTUML_LIGHT_THEME } from '../lib/monaco-plantuml';
import { EDITOR_FONT_SIZE_DEFAULT } from '../lib/constants';

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  error: DiagramError | null | undefined;
  theme: 'dark' | 'light';
  wordWrap?: 'on' | 'off';
  minimap?: boolean;
  fontSize?: number;
  onCursorPosition?: (line: number, column: number) => void;
}

export function CodeEditor({
  value,
  onChange,
  error,
  theme,
  wordWrap = 'off',
  minimap = true,
  fontSize = EDITOR_FONT_SIZE_DEFAULT,
  onCursorPosition,
}: EditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const languageRegisteredRef = useRef(false);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (!languageRegisteredRef.current) {
      registerPlantumlLanguage(monaco);
      monaco.editor.defineTheme('plantuml-dark', PLANTUML_DARK_THEME);
      monaco.editor.defineTheme('plantuml-light', PLANTUML_LIGHT_THEME);
      languageRegisteredRef.current = true;
    }
    monaco.editor.setTheme(theme === 'dark' ? 'plantuml-dark' : 'plantuml-light');

    editor.onDidChangeCursorPosition((e: any) => {
      onCursorPosition?.(e.position.lineNumber, e.position.column);
    });
  };

  // Sync theme without remounting the editor.
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'plantuml-dark' : 'plantuml-light');
    }
  }, [theme]);

  // Surface PlantUML errors in the gutter.
  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    if (error && error.line > 0) {
      monaco.editor.setModelMarkers(model, 'plantuml', [
        {
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: error.line,
          endLineNumber: error.line,
          startColumn: 1,
          endColumn: model.getLineMaxColumn(error.line) || 1000,
          message: error.shortMessage,
          source: 'plantuml',
        },
      ]);
    } else {
      monaco.editor.setModelMarkers(model, 'plantuml', []);
    }
  }, [error]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-panel">
      <Editor
        height="100%"
        language="plantuml"
        value={value}
        onChange={(val) => onChange(val ?? '')}
        theme={theme === 'dark' ? 'plantuml-dark' : 'plantuml-light'}
        onMount={handleMount}
        options={{
          minimap: { enabled: minimap },
          fontSize,
          fontFamily: "'IBM Plex Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          wordWrap,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          insertSpaces: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          bracketPairColorization: { enabled: true },
          guides: { indentation: true, bracketPairs: true },
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'line',
          renderWhitespace: 'selection',
          scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
          quickSuggestions: { other: true, comments: false, strings: false },
          suggestOnTriggerCharacters: true,
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: 'never',
            seedSearchStringFromSelection: 'selection',
          },
          'semanticHighlighting.enabled': true,
        }}
      />
    </div>
  );
}
