import React, { useCallback, useMemo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useHover } from "../hooks/useHover";
import BaseNodeWrapper from "./BaseNodeWrapper";
import { FaCodeBranch } from "react-icons/fa";

const nodeColors = [
  'bg-yellow-700 border-yellow-600 text-yellow-100',
  'bg-orange-700 border-orange-600 text-orange-100',
  'bg-amber-700 border-amber-600 text-amber-100',
];

export const ConditionNode = (props: NodeProps<BaseNode>) => {
  const { id, data, isConnectable } = props;
  const { label, conditions } = data;
  const { isHovered, hoverProps } = useHover();
  const randomColor = useMemo(() => nodeColors[Math.floor(Math.random() * nodeColors.length)], []);

  return (
    <div className="relative">
      <div {...hoverProps}>
        <BaseNodeWrapper
          className={`${randomColor}`}
          isHovered={isHovered}
        >
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            className="w-2 h-2 bg-gray-400"
          />
          <div className="flex items-center">
            <FaCodeBranch className="mr-2 w-4 h-4 flex-shrink-0" size={16} />
            <div className="truncate">{label}</div>
          </div>
          <div className="mt-2 flex justify-around">
            {conditions?.map((condition: string, index: number) => (
              <Handle
                key={`${id}-${index}`}
                type="source"
                position={Position.Bottom}
                id={`condition-${index}`}
                style={{ left: `${((index + 1) / (conditions.length + 1)) * 100}%` }}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-gray-400"
              />
            ))}
          </div>
        </BaseNodeWrapper>
      </div>
    </div>
  );
};
