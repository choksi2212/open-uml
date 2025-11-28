import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { RenderDiagramResponse } from '../../preload';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  error: RenderDiagramResponse['error'] | null;
  theme: 'dark' | 'light';
}

const CodeEditor: React.FC<EditorProps> = ({ value, onChange, error, theme }) => {
  const editorRef = useRef<Monaco | null>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // New diagram handled by parent
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        // Render handled by parent
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Save handled by parent
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        // Theme toggle handled by parent
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (monacoRef.current && editorRef.current && error) {
      const markers = [{
        severity: monacoRef.current.MarkerSeverity.Error,
        startLineNumber: error.line || 1,
        startColumn: 1,
        endLineNumber: error.line || 1,
        endColumn: 1000,
        message: error.shortMessage,
      }];

      monacoRef.current.editor.setModelMarkers(
        editorRef.current.getModel()!,
        'plantuml',
        markers
      );
    } else if (monacoRef.current && editorRef.current) {
      monacoRef.current.editor.setModelMarkers(
        editorRef.current.getModel()!,
        'plantuml',
        []
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
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
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

