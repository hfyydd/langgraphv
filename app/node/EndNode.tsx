import { Handle, NodeProps, Position } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useHover } from "../hooks/useHover";
import React from "react";
import BaseNodeWrapper from "./BaseNodeWrapper";

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