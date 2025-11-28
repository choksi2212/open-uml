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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className={`
        px-4 py-2 text-sm font-medium border-b
        ${theme === 'dark' ? 'bg-dark-surface border-dark-border text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'}
      `}>
        Editor
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

