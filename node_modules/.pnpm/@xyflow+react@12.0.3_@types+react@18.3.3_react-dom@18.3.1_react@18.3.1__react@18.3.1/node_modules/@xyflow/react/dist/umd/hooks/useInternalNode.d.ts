import type { InternalNode, Node } from '../types';
/**
 * Hook for getting an internal node by id
 *
 * @public
 * @param id - id of the node
 * @returns array with visible node ids
 */
export declare function useInternalNode<NodeType extends Node = Node>(id: string): InternalNode<NodeType> | undefined;
//# sourceMappingURL=useInternalNode.d.ts.map