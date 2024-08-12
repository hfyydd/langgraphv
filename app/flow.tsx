// flow.tsx
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
import { nodeTypes } from './node/BaseNode';
import { edgeTypes } from './edge/CustomEdge';

interface FlowProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onGraphChange?: (nodes: Node[], edges: Edge[]) => void;
  onGraphOperation?: (operation: GraphOperation) => void;
}

type GraphOperation =
  | { type: 'addNode'; node: Node }
  | { type: 'removeNode'; nodeId: string }
  | { type: 'addEdge'; edge: Edge }
  | { type: 'removeEdge'; edgeId: string }
  | { type: 'updateNode'; node: Node }
  | { type: 'updateEdge'; edge: Edge };



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

function Flow({ initialNodes, initialEdges, onGraphChange, onGraphOperation }: FlowProps) {
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
      // 为每个节点触发 updateNode 操作
      layoutedNodes.forEach(node => {
        onGraphOperation?.({ type: 'updateNode', node });
      });
    },
    [nodes, edges, onGraphChange, onGraphOperation]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      data: { label: `node${nodes.length + 1}` },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      type: 'custom',
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onGraphChange?.(updatedNodes, edges);
    // 触发 onGraphOperation
    onGraphOperation?.({ type: 'addNode', node: newNode });
  }, [nodes, edges, onGraphChange, onGraphOperation]);




  // Expose updateGraph function to window
  const updateGraph = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    onGraphChange?.(layoutedNodes, layoutedEdges);
  }, [onGraphChange]);

  useEffect(() => {
    if (typeof (window as any).updateGraphFlow !== 'function') {
      (window as any).updateGraphFlow = updateGraph;
    }
  }, [updateGraph]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      changes.forEach(change => {
        if (change.type === 'remove') {
          onGraphOperation?.({ type: 'removeNode', nodeId: change.id });
        }
        else if (change.type === 'position') {
          const updatedNode = nodes.find(node => node.id === change.id);
          if (updatedNode) {
            //console.log('Updated node from Flow:', updatedNode);
            onGraphOperation?.({ type: 'updateNode', node: updatedNode });
          }
        }
      });
    },
    [onNodesChange, onGraphOperation, nodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      changes.forEach(change => {
        if (change.type === 'add') {
          onGraphOperation?.({ type: 'addEdge', edge: change.item });
        } else if (change.type === 'remove') {
          onGraphOperation?.({ type: 'removeEdge', edgeId: change.id });
        } else if (change.type === 'select') {
          const updatedEdge = edges.find(edge => edge.id === change.id);
          if (updatedEdge) {
            onGraphOperation?.({ type: 'updateEdge', edge: updatedEdge });
          }
        }
      });
    },
    [onEdgesChange, onGraphOperation, edges]
  );

  const handleConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `e${params.source}-${params.target}`,
        source: params.source || '',
        target: params.target || '',
        animated: true,
        style: { stroke: '#2a9d8f', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#2a9d8f',
        },
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      onGraphOperation?.({ type: 'addEdge', edge: newEdge });
    },
    [setEdges, onGraphOperation]
  );

  const edgeOptions = {
    animated: true,
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#2a9d8f',
    },
    type: 'custom-edge',
  };


  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
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