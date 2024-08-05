import { type Dispatch, type SetStateAction } from 'react';
import type { Node, Edge, OnNodesChange, OnEdgesChange } from '../types';
/**
 * Hook for managing the state of nodes - should only be used for prototyping / simple use cases.
 *
 * @public
 * @param initialNodes
 * @returns an array [nodes, setNodes, onNodesChange]
 */
export declare function useNodesState<NodeType extends Node>(initialNodes: NodeType[]): [NodeType[], Dispatch<SetStateAction<NodeType[]>>, OnNodesChange<NodeType>];
/**
 * Hook for managing the state of edges - should only be used for prototyping / simple use cases.
 *
 * @public
 * @param initialEdges
 * @returns an array [edges, setEdges, onEdgesChange]
 */
export declare function useEdgesState<EdgeType extends Edge = Edge>(initialEdges: EdgeType[]): [EdgeType[], Dispatch<SetStateAction<EdgeType[]>>, OnEdgesChange<EdgeType>];
//# sourceMappingURL=useNodesEdgesState.d.ts.map