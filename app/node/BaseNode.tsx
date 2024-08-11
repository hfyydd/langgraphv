import React from 'react';
import { Handle, Position } from '@xyflow/react';

export interface BaseNodeProps {
  data: any;
  isConnectable: boolean;
}

const BaseNode: React.FC<BaseNodeProps> = ({ data, isConnectable }) => {
  return (
    <div className="p-3 rounded-md w-40 text-sm text-gray-800 text-center border border-gray-300 bg-white shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default BaseNode;