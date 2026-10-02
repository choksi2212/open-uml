import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { RenderDiagramResponse } from '../../preload';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  error: RenderDiagramResponse['error'] | null;
  theme: 'dark' | 'light';
  wordWrap?: 'on' | 'off';
  minimap?: boolean;
  fontSize?: number;
  onCursorPosition?: (line: number, column: number) => void;
}

const CodeEditor: React.FC<EditorProps> = ({
  value,
  onChange,
  error,
  theme,
  wordWrap = 'off',
  minimap = true,
  fontSize = 14,
  onCursorPosition,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const markers = error
        ? [{
            severity: monacoRef.current.MarkerSeverity.Error,
            startLineNumber: error.line || 1,
            startColumn: 1,
            endLineNumber: error.line || 1,
            endColumn: 1000,
            message: error.shortMessage,
          }]
        : [];

      monacoRef.current.editor.setModelMarkers(
        editorRef.current.getModel()!,
        'plantuml',
        markers
      );
    }
  }, [error]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register PlantUML language
    monaco.languages.register({ id: 'plantuml' });

    // Configure PlantUML syntax highlighting
    monaco.languages.setMonarchTokensProvider('plantuml', {
      tokenizer: {
        root: [
          [/\\bstartuml\\b|\\benduml\\b/i, 'keyword'],
          [/\\bstart\\w*\\b|\\bend\\w*\\b/i, 'keyword'],
          [/->|<-|--|==|::/, 'operator'],
          [/\\[.*?\\]/, 'string'],
          [/".*?"/, 'string'],
          [/' .*?'/, 'string'],
          [/note\\s+(left|right|top|bottom)/i, 'keyword'],
          [/title|header|footer|legend|skinparam/i, 'keyword'],
          [/class|interface|abstract|enum|package/i, 'type'],
          [/actor|participant|usecase|component/i, 'type'],
          [/if|else|endif|while|endwhile|fork|endfork/i, 'keyword'],
        ],
      },
    });

    // Report cursor position for the status bar.
    editor.onDidChangeCursorPosition(() => {
      const pos = editor.getPosition();
      if (pos && onCursorPosition) {
        onCursorPosition(pos.lineNumber, pos.column);
      }
    });
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden rounded-3xl border backdrop-blur-xl h-full ${
      theme === 'dark'
        ? 'bg-[#051321]/95 border-emerald-100/10 shadow-[0_25px_70px_rgba(3,10,20,0.85)]'
        : 'bg-white border-slate-200 shadow-xl'
    }`}>
      <div className={`
        px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.35em] border-b flex items-center justify-between
        ${theme === 'dark' ? 'bg-[#03101e]/80 border-emerald-100/5 text-emerald-100/80' : 'bg-slate-50 border-slate-200 text-slate-600'}
      `}>
        <span>Editor</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language="plantuml"
          value={value}
          onChange={(val) => onChange(val || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: minimap },
            fontSize,
            lineNumbers: 'on',
            wordWrap,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
