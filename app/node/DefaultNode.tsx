import { Handle, NodeProps, Position } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useHover } from "../hooks/useHover";
import { useCallback, useMemo, useState } from "react";
import BaseNodeWrapper from "./BaseNodeWrapper";
import React from "react";
import { FaCircle, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import CodeEditor from "./CodeEditor";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';


const nodeColors = [
    'bg-blue-700 border-blue-600 text-blue-100',
    'bg-cyan-700 border-cyan-600 text-cyan-100',
    'bg-sky-700 border-sky-600 text-sky-100',
    'bg-indigo-700 border-indigo-600 text-indigo-100',
    'bg-slate-700 border-slate-600 text-slate-100',
    'bg-violet-700 border-violet-600 text-violet-100',
  ];

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
              <div className="mt-2 text-left h-40"> {/* 增加高度以适应编辑器 */}
                {isEditing ? (
                  <CodeEditor
                    code={codeSnippet}
                    onChange={handleCodeChange}
                    onBlur={() => {}}
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