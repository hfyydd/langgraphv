export interface Node {
    id: string;
    type: 'input' | 'output' | 'default';
    position: { x: number; y: number };
    data: {
        label: string;
        function?: string;
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