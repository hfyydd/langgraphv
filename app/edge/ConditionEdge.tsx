import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from '@xyflow/react';

export default function ConditionEdge({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  label 
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}