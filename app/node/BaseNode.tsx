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
import Editor from "@monaco-editor/react";

export type BaseNode = Node<{
  label: string;
  isConnectable: boolean;
  function?: string;
  codeSnippet?: string;
  isExpanded?: boolean;
  onCodeSnippetChange?: (id: string, newCodeSnippet: string) => void;
  conditions?: string[];
  conditionFunction?: string;
}>;

// 定义一个好看的颜色数组
















