import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeProps, Node } from '@xyflow/react';

export type BaseNode = Node<
  {
    label: string;
    isConnectable: boolean;
  }
>;

const BaseNodeWrapper: React.FC<{
  children: React.ReactNode;
  className: string;
}> = ({ children, className }) => (
  <div className={`p-2 rounded-md w-40 bg-opacity-20 text-sm text-center border ${className}`}>
    {children}
  </div>
);

export const StartNode = (props: NodeProps<BaseNode>) => {
  const { label, isConnectable } = props.data;
  return (
    <BaseNodeWrapper className="bg-purple-600 border-purple-400 text-purple-100">
      <div>{label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-400"
      />
    </BaseNodeWrapper>
  );
};

export const DefaultNode = (props: NodeProps<BaseNode>) => {
  const { label, isConnectable } = props.data;
  return (
    <BaseNodeWrapper className="bg-blue-800 border-blue-600 text-purple-100">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-400"
      />
      <div>{label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-400"
      />
    </BaseNodeWrapper>
  );
};

export const EndNode = (props: NodeProps<BaseNode>) => {
  const { label, isConnectable } = props.data;
  return (
    <BaseNodeWrapper className="bg-yellow-500  border-yellow-400 text-yellow-100">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-yellow-400"
      />
      <div>{label}</div>
    </BaseNodeWrapper>
  );
};

export const nodeTypes = {
  start: StartNode,
  custom: DefaultNode,
  end: EndNode,
};