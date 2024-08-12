import React, { useState, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeProps, Node } from '@xyflow/react';

export type BaseNode = Node<
  {
    label: string;
    isConnectable: boolean;
  }
>;

// 定义一个好看的颜色数组
const nodeColors = [
  'bg-blue-700 border-blue-600 text-blue-100',
  'bg-cyan-700 border-cyan-600 text-cyan-100',
  'bg-sky-700 border-sky-600 text-sky-100',
  'bg-indigo-700 border-indigo-600 text-indigo-100',
  'bg-slate-700 border-slate-600 text-slate-100',
  'bg-violet-700 border-violet-600 text-violet-100',
];

const BaseNodeWrapper: React.FC<{
  children: React.ReactNode;
  className: string;
  isHovered: boolean;
}> = ({ children, className, isHovered }) => (
  <div
    className={`p-2 rounded-md w-40 bg-opacity-20 text-sm text-center border transition-all duration-200 ${className} ${
      isHovered ? 'brightness-125' : ''
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

export const DefaultNode = (props: NodeProps<BaseNode>) => {
  const { label, isConnectable } = props.data;
  const { isHovered, hoverProps } = useHover();
  
  // 使用 useMemo 来确保颜色只在组件挂载时随机选择一次
  const randomColor = useMemo(() => nodeColors[Math.floor(Math.random() * nodeColors.length)], []);

  return (
    <div {...hoverProps}>
      <BaseNodeWrapper className={randomColor} isHovered={isHovered}>
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-gray-400"
        />
        <div>{label}</div>
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-gray-400"
        />
      </BaseNodeWrapper>
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