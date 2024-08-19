export interface Node {
    id: string;
    type: 'start' | 'end' | 'custom';
    position: { x: number; y: number };
    data: {
        label: string;
        function?: string;
        codeSnippet?: string;
    };
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    data?: {
        condition?: string;
        conditionFunction?: string;
    };
}