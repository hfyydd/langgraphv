import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface NodeData {
    label: string;
    description: string;
    inputs: { name: string; type: string }[];
}

const StartNode = ({ data }: { data: NodeData }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 w-80">
            <div className="flex items-center mb-3">
                <div className="bg-indigo-600 text-white rounded p-1 mr-2">G</div>
                <h3 className="text-lg font-semibold flex-grow">{data.label}</h3>
                <button className="text-gray-500">▼</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{data.description}</p>
            <div>
                <h4 className="text-sm font-semibold mb-2">Input</h4>
                {data.inputs.map((input, index) => (
                    <div key={index} className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{input.name}</span>
                        <span className="text-gray-500">{input.type}</span>
                    </div>
                ))}
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 -right-1.5 bg-blue-500"
            />
        </div>
    );
};
export default memo(StartNode);