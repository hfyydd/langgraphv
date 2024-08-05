import { type ReactNode } from 'react';
import type { Node, Edge } from '../../types';
import { NodeOrigin } from '@xyflow/system';
export type ReactFlowProviderProps = {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    defaultNodes?: Node[];
    defaultEdges?: Edge[];
    initialWidth?: number;
    initialHeight?: number;
    fitView?: boolean;
    nodeOrigin?: NodeOrigin;
    children: ReactNode;
};
export declare function ReactFlowProvider({ initialNodes: nodes, initialEdges: edges, defaultNodes, defaultEdges, initialWidth: width, initialHeight: height, fitView, nodeOrigin, children, }: ReactFlowProviderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map