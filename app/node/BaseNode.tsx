declare global {
  interface Window {
    updateGraphFlow?: (nodes: any[], edges: any[]) => void;
  }
}
import { FaEdit, FaSave, FaCircle, FaTimes } from 'react-icons/fa';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeProps, Node } from '@xyflow/react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export type BaseNode = Node<{
  label: string;
  isConnectable: boolean;
  function?: string;
  codeSnippet?: string;
  isExpanded?: boolean;
  onCodeSnippetChange?: (id: string, newCodeSnippet: string) => void;
}>;

// 定义一个好看的颜色数组
const nodeColors = [
  'bg-blue-700 border-blue-600 text-blue-100',
  'bg-cyan-700 border-cyan-600 text-cyan-100',
  'bg-sky-700 border-sky-600 text-sky-100',
  'bg-indigo-700 border-indigo-600 text-indigo-100',
  'bg-slate-700 border-slate-600 text-slate-100',
  'bg-violet-700 border-violet-600 text-violet-100',
];

const CodeEditor: React.FC<{
  code: string;
  onChange: (code: string) => void;
  onBlur: () => void;
}> = ({ code, onChange, onBlur }) => {
  const [localCode, setLocalCode] = useState(code);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalCode(e.target.value);
    onChange(e.target.value);
  };

  const sharedStyles = {
    fontSize: '12px',
    padding: '0.5rem',
    margin: 0,
    lineHeight: '1.5',
    fontFamily: 'monospace',
  };

  return (
    <div className="relative">
      <SyntaxHighlighter
        language="python"
        style={docco}
        customStyle={{
          ...sharedStyles,
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {localCode}
      </SyntaxHighlighter>
      <textarea
        value={localCode}
        onChange={handleChange}
        onBlur={onBlur}
        className="absolute inset-0 w-full h-full bg-transparent border-none resize-none focus:outline-none"
        style={{
          ...sharedStyles,
          color: 'transparent',
          caretColor: 'white',
          WebkitTextFillColor: 'transparent',
          zIndex: 2,
        }}
        autoFocus
      />
    </div>
  );
};


const BaseNodeWrapper: React.FC<{
  children: React.ReactNode;
  className: string;
  isHovered: boolean;
}> = ({ children, className, isHovered }) => (
  <div
    className={`p-2 rounded-md w-40 bg-opacity-20 text-sm text-center border transition-all duration-200 ${className} ${isHovered ? 'brightness-125' : ''
      }`}
  >
    {children}
  </div>
);

const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  return {
    isHovered,
    hoverProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  };
};

export const StartNode = (props: NodeProps<BaseNode>) => {
  const { label, isConnectable } = props.data;
  const { isHovered, hoverProps } = useHover();
  return (
    <div {...hoverProps}>
      <BaseNodeWrapper className="bg-purple-600 border-purple-400 text-purple-100" isHovered={isHovered}>
        <div>{label}</div>
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-purple-400"
        />
      </BaseNodeWrapper>
    </div>
  );
};

export const DefaultNode = (props: NodeProps<BaseNode> & {
  onExpand: (nodeId: string, isExpanded: boolean) => void
}) => {
  const { id, data, isConnectable } = props;
  const { label, function: nodeFunction, codeSnippet: initialCodeSnippet, isExpanded, onCodeSnippetChange } = data;
  const { isHovered, hoverProps } = useHover();
  const [isEditing, setIsEditing] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState(initialCodeSnippet || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const randomColor = useMemo(() => nodeColors[Math.floor(Math.random() * nodeColors.length)], []);
  
  console.log('codeSnippet', codeSnippet);
  
  const handleCodeChange = useCallback((newCode: string) => {
    setCodeSnippet(newCode);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(false);
    setHasUnsavedChanges(false);
    if (onCodeSnippetChange) {
      onCodeSnippetChange(id, codeSnippet);
    }
  }, [id, data, codeSnippet, onCodeSnippetChange]);


  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isEditing) {
      props.onExpand(id, !isExpanded);
    }
  }, [id, isEditing, isExpanded, props.onExpand]);

  const handleEditClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(false);
    setCodeSnippet(initialCodeSnippet || '');
    setHasUnsavedChanges(false);
  }, [initialCodeSnippet]);

  return (
    <div className="relative">
      <div
        {...hoverProps}
        onDoubleClick={handleDoubleClick}
        className={`cursor-pointer transition-all duration-200 ${isExpanded ? 'shadow-lg' : ''}`}
      >
        <BaseNodeWrapper
          className={`${randomColor} ${isExpanded ? 'w-96' : ''}`}
          isHovered={isHovered}
        >
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            className="w-2 h-2 bg-gray-400"
          />
          <div className="relative">
            {isExpanded && (
              <div className="absolute top-0 right-0 flex items-center">
                <FaCircle
                  className={`mr-2 ${hasUnsavedChanges ? 'text-red-500' : 'text-green-500'}`}
                  size={12}
                />
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="p-1 text-white hover:text-gray-200 mr-1"
                      disabled={!hasUnsavedChanges}
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-white hover:text-gray-200"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="p-1 text-white hover:text-gray-200"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
            )}
            <div>{label}</div>
            <div className="text-xs">{nodeFunction}</div>
          </div>
          {isExpanded && (
            <div className="mt-2 text-left">
              {isEditing ? (
                <CodeEditor
                  code={codeSnippet}
                  onChange={handleCodeChange}
                  onBlur={() => { }}
                />
              ) : (
                <SyntaxHighlighter
                  language="python"
                  style={docco}
                  customStyle={{ fontSize: '12px', background: 'transparent' }}
                >
                  {codeSnippet}
                </SyntaxHighlighter>
              )}
            </div>
          )}
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="w-2 h-2 bg-gray-400"
          />
        </BaseNodeWrapper>
      </div>
    </div>
  );
};


export const EndNode = (props: NodeProps<BaseNode>) => {
  const { label, isConnectable } = props.data;
  const { isHovered, hoverProps } = useHover();
  return (
    <div {...hoverProps}>
      <BaseNodeWrapper className="bg-yellow-500 border-yellow-400 text-yellow-100" isHovered={isHovered}>
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-yellow-400"
        />
        <div>{label}</div>
      </BaseNodeWrapper>
    </div>
  );
};

export const nodeTypes = {
  start: StartNode,
  custom: DefaultNode,
  end: EndNode,
};