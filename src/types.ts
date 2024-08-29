export interface Node {
    id: string;
    type: 'start' | 'end' | 'custom' | 'condition';
    position: { x: number; y: number };
    data: {
        label: string;
        function?: string;
        codeSnippet?: string;
        conditionFunction?: string;
        conditions?: string[];
    };
}

export interface Edge {
    id: string;
    source: string;
    sourceHandle?: string;
    target: string;
    data?: {
        condition?: string;
        conditionFunction?: string;
    };
}