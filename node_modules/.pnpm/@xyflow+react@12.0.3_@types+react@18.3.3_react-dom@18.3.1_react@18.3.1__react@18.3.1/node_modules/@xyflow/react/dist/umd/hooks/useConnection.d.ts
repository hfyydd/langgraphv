import { ConnectionState } from '@xyflow/system';
import type { InternalNode, Node } from '../types';
/**
 * Hook for accessing the connection state.
 *
 * @public
 * @returns ConnectionState
 */
export declare function useConnection<NodeType extends Node = Node>(): ConnectionState<InternalNode<NodeType>>;
//# sourceMappingURL=useConnection.d.ts.map