import { Editor } from "@monaco-editor/react";
import React from "react";

const CodeEditor: React.FC<{
    code: string;
    onChange: (code: string) => void;
    onBlur: () => void;
  }> = ({ code, onChange, onBlur }) => {
    return (
      <Editor
        height="150px"
        defaultLanguage="python"
        defaultValue={code}
        onChange={(value) => onChange(value || '')}
        onMount={(editor) => {
          editor.onDidBlurEditorWidget(() => onBlur());
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 10,
          lineNumbers: 'off',
          scrollBeyondLastLine: false,
          folding: true,
          theme: 'vs-dark',
        }}
      />
    );
  };

  export default CodeEditor;