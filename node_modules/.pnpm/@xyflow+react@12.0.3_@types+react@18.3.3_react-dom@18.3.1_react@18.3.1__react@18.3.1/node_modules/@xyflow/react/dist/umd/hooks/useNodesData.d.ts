import type { Node } from '../types';
/**
 * Hook for receiving data of one or multiple nodes
 *
 * @public
 * @param nodeId - The id (or ids) of the node to get the data from
 * @param guard - Optional guard function to narrow down the node type
 * @returns An object (or array of object) with {id, type, data} representing each node
 */
export declare function useNodesData<NodeType extends Node = Node>(nodeId: string): Pick<NodeType, 'id' | 'type' | 'data'> | null;
export declare function useNodesData<NodeType extends Node = Node>(nodeIds: string[]): Pick<NodeType, 'id' | 'type' | 'data'>[];
//# sourceMappingURL=useNodesData.d.ts.map