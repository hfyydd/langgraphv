// CustomEdge.tsx
import React, { useEffect } from 'react';
import { EdgeProps, getBezierPath, MarkerType } from '@xyflow/react';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });


  return (
    <path
      id={id}
      style={style}
      className={`react-flow__edge-path transition-colors duration-300 ${
        selected ? 'stroke-blue-500' : 'stroke-green-400'
      }`}
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

export default CustomEdge;



