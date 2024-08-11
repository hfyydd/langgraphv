import React, { useState, useEffect, useCallback } from 'react';
import dagre from 'dagre';
import {
  ReactFlow, 
  Controls, 
  Background, 
  Node, Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  EdgeChange,
  applyEdgeChanges,
  Connection,
  addEdge,
  NodeChange,
  applyNodeChanges,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import BaseNode from './node/BaseNode';

interface FlowProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onGraphChange?: (nodes: Node[], edges: Edge[]) => void; 
}



const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
};

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    }),
    edges,
  };
};

function Flow({ initialNodes, initialEdges, onGraphChange }: FlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges]);

  const onLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      onGraphChange?.(layoutedNodes, layoutedEdges);
    },
    [nodes, edges, onGraphChange]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      type: 'baseNode',
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onGraphChange?.(updatedNodes, edges);
  }, [nodes, edges, onGraphChange]);


  const onEdgesChangeHandler = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      onGraphChange?.(nodes, updatedEdges);
    },
    [edges, nodes, onGraphChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        animated: true,
        style: { stroke: '#2a9d8f', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#2a9d8f',
        },
      };
      
      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      onGraphChange?.(nodes, updatedEdges);
    },
    [edges, nodes, onGraphChange]
  );
  const edgeOptions = {
    animated: true,
    style: { stroke: '#2a9d8f', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#2a9d8f',
    },
  };

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={edgeOptions}
      >
        <Background />
        <Controls />
      </ReactFlow>
      <div style={{ position: 'absolute', left: 10, top: 10, zIndex: 4 }}>
        <button onClick={() => onLayout('TB')}>Vertical Layout</button>
        <button onClick={() => onLayout('LR')}>Horizontal Layout</button>
        <button onClick={addNode}>Add Node</button>
      </div>
    </div>
  );
}

export default Flow;