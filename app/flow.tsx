// flow.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  NodeTypes,
  NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BaseNode } from './node/BaseNode';
import { DefaultNode } from './node/DefaultNode';
import nodeTypes from './node/index';
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
    const width = node.data.isExpanded ? 400 : nodeWidth;
    const height = node.data.isExpanded ? 200 : nodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const width = node.data.isExpanded ? 400 : nodeWidth;
      const height = node.data.isExpanded ? 200 : nodeHeight;
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2,
        },
      };
    }),
    edges,
  };
};
// const getLayoutedElements = (
//   nodes: Node[],
//   edges: Edge[],
//   expandedNodeId: string | null,
//   isInitialLayout: boolean,
//   direction = 'TB'
// ) => {
//   const dagreGraph = new dagre.graphlib.Graph();
//   dagreGraph.setDefaultEdgeLabel(() => ({}));
//   dagreGraph.setGraph({ rankdir: direction });

//   let affectedNodeIds: Set<string>;

//   if (isInitialLayout) {
//     // 初始化时全局重排
//     affectedNodeIds = new Set(nodes.map(node => node.id));
//   } else if (expandedNodeId) {
//     // 展开节点时的部分重排逻辑
//     affectedNodeIds = new Set<string>([expandedNodeId]);
//     const expandedNode = nodes.find(node => node.id === expandedNodeId);

//     // 获取被展开节点可能遮挡的节点
//     if (expandedNode) { // 确保 expandedNode 存在
//       nodes.forEach(node => {
//         if (node.id !== expandedNodeId && isNodeOverlapping(expandedNode, node)) {
//           affectedNodeIds.add(node.id);
//         }
//       });
//     }
//   } else {
//     console.log('No affected nodes');
//     // 如果既不是初始化也没有展开的节点，则不进行任何重排
//     return { nodes, edges };
//   }
//   console.log('Affected nodes:', affectedNodeIds);

//   // 设置节点
//   nodes.forEach((node) => {
//     if (affectedNodeIds.has(node.id)) {
//       const width = node.data.isExpanded ? 400 : nodeWidth;
//       const height = node.data.isExpanded ? 200 : nodeHeight;
//       dagreGraph.setNode(node.id, { width, height });
//     }
//   });

//   // 设置边
//   edges.forEach((edge) => {
//     if (isInitialLayout || affectedNodeIds.has(edge.source) || affectedNodeIds.has(edge.target)) {
//       dagreGraph.setEdge(edge.source, edge.target);
//     }
//   });

//   dagre.layout(dagreGraph);

//   // 更新节点位置
//   const updatedNodes = nodes.map(node => {
//     if (affectedNodeIds.has(node.id)) {
//       const nodeWithPosition = dagreGraph.node(node.id);
//       const width = node.data.isExpanded ? 400 : nodeWidth;
//       const height = node.data.isExpanded ? 200 : nodeHeight;
//       return {
//         ...node,
//         position: {
//           x: nodeWithPosition.x - width / 2,
//           y: nodeWithPosition.y - height / 2,
//         },
//       };
//     }
//     return node;
//   });
//   console.log('Updated nodes:', updatedNodes);

//   return {
//     nodes: updatedNodes,
//     edges,
//   };
// };




// // 辅助函数：检查两个节点是否重叠
// const isNodeOverlapping = (node1: Node, node2: Node) => {
//   const width1 = node1.data.isExpanded ? 400 : nodeWidth;
//   const height1 = node1.data.isExpanded ? 200 : nodeHeight;
//   const width2 = node2.data.isExpanded ? 400 : nodeWidth;
//   const height2 = node2.data.isExpanded ? 200 : nodeHeight;

//   return (
//     Math.abs(node1.position.x - node2.position.x) < (width1 + width2) / 2 &&
//     Math.abs(node1.position.y - node2.position.y) < (height1 + height2) / 2
//   );
// };


function Flow({ initialNodes, initialEdges, onGraphChange, onGraphOperation }: FlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);


  // useEffect(() => {
  //   console.log('Initial layout');
  //   const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  //     initialNodes,
  //     initialEdges,null, true
  //   );
  //   setNodes(layoutedNodes);
  //   setEdges(layoutedEdges);
  // }, [initialNodes, initialEdges]);
  useEffect(() => {
    console.log('Initial layout');
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, []);


  const handleNodeExpand = useCallback((nodeId: string, isExpanded: boolean) => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, isExpanded } } : node
      );

      // 重新计算布局
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        updatedNodes,
        edges,
      );

      // 如果有onGraphChange回调,调用它
      onGraphChange?.(layoutedNodes, layoutedEdges);

      // 如果有onGraphOperation回调,为更新的节点触发它
      onGraphOperation?.({ type: 'updateNode', node: layoutedNodes.find(n => n.id === nodeId)! });

      return layoutedNodes;
    });
  }, [edges, onGraphChange, onGraphOperation]);


  // const onLayout = useCallback(
  //   (direction: 'TB' | 'LR') => {
  //     // 记录当前方向
  //     const currentDirection = direction === 'TB' ? 'LR' : 'TB';
  //     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  //       nodes,
  //       edges,
  //       direction
  //     );
  //     setNodes([...layoutedNodes]);
  //     setEdges([...layoutedEdges]);
  //     onGraphChange?.(layoutedNodes, layoutedEdges);
  //     // 为每个节点触发 updateNode 操作
  //     layoutedNodes.forEach(node => {
  //       onGraphOperation?.({ type: 'updateNode', node });
  //     });
  //   },
  //   [nodes, edges, onGraphChange, onGraphOperation]
  // );

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
      newEdges,
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
            //onGraphOperation?.({ type: 'updateNode', node: updatedNode });
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

  const handleCodeSnippetChange = useCallback((id: string, newCodeSnippet: string) => {
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node =>
        node.id === id ? { ...node, data: { ...node.data, codeSnippet: newCodeSnippet } } : node
      );

      const updatedNode = updatedNodes.find(node => node.id === id);
      if (updatedNode) {
        onGraphOperation?.({ type: 'updateNode', node: updatedNode });
      }

      return updatedNodes;
    });
  }, [setNodes, onGraphOperation]);

  const edgeOptions = {
    animated: true,
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#2a9d8f',
    },
    type: 'custom-edge',
  };

  const nodeTypesWithExpand = useMemo(() => ({
    ...nodeTypes,
    custom: (props: NodeProps<BaseNode>) => (
      <DefaultNode
        {...props}
        data={{
          ...props.data,
          isExpanded: props.data.isExpanded || false,
          onCodeSnippetChange: handleCodeSnippetChange
        }}
        onExpand={handleNodeExpand}
      />
    ),
  }), [handleNodeExpand]);


  return (
    <div style={{ height: '100%' }} onContextMenu={(e) => e.preventDefault()} >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypesWithExpand}
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
        {/* <button onClick={() => onLayout('TB')}>Vertical Layout</button>
        <button onClick={() => onLayout('LR')}>Horizontal Layout</button> */}
        <button onClick={addNode}>Add Node</button>
      </div>
    </div>
  );
}

export default Flow;


