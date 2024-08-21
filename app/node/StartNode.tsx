import { Handle, NodeProps, Position } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { useHover } from "../hooks/useHover";
import BaseNodeWrapper from "./BaseNodeWrapper";
import React from "react";




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