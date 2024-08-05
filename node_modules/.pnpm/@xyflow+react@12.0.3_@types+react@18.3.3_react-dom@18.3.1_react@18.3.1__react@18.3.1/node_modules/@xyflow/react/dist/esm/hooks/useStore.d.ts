import type { Edge, Node, ReactFlowState } from '../types';
/**
 * Hook for accessing the internal store. Should only be used in rare cases.
 *
 * @public
 * @param selector
 * @param equalityFn
 * @returns The selected state slice
 *
 * @example
 * const nodes = useStore((state: ReactFlowState<MyNodeType>) => state.nodes);
 *
 */
declare function useStore<StateSlice = unknown>(selector: (state: ReactFlowState) => StateSlice, equalityFn?: (a: StateSlice, b: StateSlice) => boolean): StateSlice;
declare function useStoreApi<NodeType extends Node = Node, EdgeType extends Edge = Edge>(): {
    getState: () => ReactFlowState<NodeType, EdgeType>;
    setState: (partial: ReactFlowState<NodeType, EdgeType> | Partial<ReactFlowState<NodeType, EdgeType>> | ((state: ReactFlowState<NodeType, EdgeType>) => ReactFlowState<NodeType, EdgeType> | Partial<ReactFlowState<NodeType, EdgeType>>), replace?: boolean | undefined) => void;
    subscribe: (listener: (state: ReactFlowState<NodeType, EdgeType>, prevState: ReactFlowState<NodeType, EdgeType>) => void) => () => void;
};
export { useStore, useStoreApi };
//# sourceMappingURL=useStore.d.ts.map