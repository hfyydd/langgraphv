import React from 'react';
import { ReactFlow, Controls, Background, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodes: Node[] = [
    {
      id: '1',
      position: { x: 0, y: 0 },
      data: { label: 'Node 1' }, // 添加 data 属性
    },
  ];
function Flow() {
  return (
    <div style={{ height: '100%' }}>
      <ReactFlow nodes={nodes}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;