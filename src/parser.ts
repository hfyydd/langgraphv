import { Edge, Node } from './types';
import { GlobalState } from './globalState';

export function parseLangGraphFile(fileContent: string): { nodes: Node[], edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const lines = fileContent.split('\n');


    let stateClassName: string | null = null;
    let conditionalEdgeBuffer = '';
    let isParsingConditionalEdge = false;

    lines.forEach((line, index) => {
        // 查找 StateGraph 实例的变量名和 State 类名
        const stateGraphMatch = line.match(/(\w+)\s*=\s*StateGraph\((\w+)\)/);
        if (stateGraphMatch) {
            GlobalState.graphBuilderVariable = stateGraphMatch[1];
            stateClassName = stateGraphMatch[2];
        }

        if (GlobalState.graphBuilderVariable) {
            // 解析通过 add_node 添加的节点
            const nodeRegex = new RegExp(`${GlobalState.graphBuilderVariable}\\.add_node\\("(\\w+)",\\s*(\\w+)`);
            const nodeMatch = line.match(nodeRegex);
            if (nodeMatch) {
                nodes.push({
                    id: nodeMatch[1],
                    type: 'custom',
                    position: { x: index * 150, y: index * 100 },
                    data: { label: nodeMatch[1], function: nodeMatch[2] }
                });
            }

            // 解析边，包括 START 和 END 的情况
            const edgeRegex = new RegExp(`${GlobalState.graphBuilderVariable}\\.add_edge\\(\\s*([\\w"]+)\\s*,\\s*([\\w"]+)\\s*\\)`);
            const edgeMatch = line.match(edgeRegex);
            if (edgeMatch) {
                let source = edgeMatch[1].replace(/"/g, '');
                let target = edgeMatch[2].replace(/"/g, '');

                if (source === 'START') {
                    if (!nodes.some(node => node.id === 'start')) {
                        nodes.push({
                            id: 'start',
                            type: 'start',
                            position: { x: 0, y: 0 },
                            data: { label: 'Start' }
                        });
                    }
                    source = 'start';
                }

                if (target === 'END') {
                    if (!nodes.some(node => node.id === 'end')) {
                        nodes.push({
                            id: 'end',
                            type: 'end',
                            position: { x: (index + 1) * 150, y: 100 },
                            data: { label: 'End' }
                        });
                    }
                    target = 'end';
                }

                edges.push({
                    id: `e${source}-${target}`,
                    source: source,
                    target: target
                });
            }

            // 解析入口点
            const entryPointMatch = line.match(`${GlobalState.graphBuilderVariable}\\.set_entry_point\\("(\\w+)"`);
            if (entryPointMatch) {
                if (!nodes.some(node => node.id === 'start')) {
                    nodes.push({
                        id: 'start',
                        type: 'start',
                        position: { x: 0, y: 0 },
                        data: { label: 'Start' }
                    });
                }
                edges.push({
                    id: `start-${entryPointMatch[1]}`,
                    source: 'start',
                    target: entryPointMatch[1]
                });
            }

            // 解析结束点
            const finishPointMatch = line.match(`${GlobalState.graphBuilderVariable}\\.set_finish_point\\("(\\w+)"`);
            if (finishPointMatch) {
                if (!nodes.some(node => node.id === 'end')) {
                    nodes.push({
                        id: 'end',
                        type: 'end',
                        position: { x: (index + 1) * 150, y: 100 },
                        data: { label: 'End' }
                    });
                }
                edges.push({
                    id: `${finishPointMatch[1]}-end`,
                    source: finishPointMatch[1],
                    target: 'end'
                });
            }

            // 开始解析条件边
            if (line.includes(`${GlobalState.graphBuilderVariable}.add_conditional_edges(`)) {
                isParsingConditionalEdge = true;
                conditionalEdgeBuffer = line;
            } else if (isParsingConditionalEdge) {
                conditionalEdgeBuffer += line;
                if (line.includes(')')) {
                    isParsingConditionalEdge = false;
                    parseConditionalEdge(conditionalEdgeBuffer, nodes, edges);
                    conditionalEdgeBuffer = '';
                }
            }
        }
    });

    console.log('nodes', nodes);
    console.log('edges', edges);

    return { nodes, edges };
}

function parseConditionalEdge(content: string, nodes: Node[], edges: Edge[]) {
    const sourceNodeMatch = content.match(/"(\w+)"/);
    const conditionFunctionMatch = content.match(/,\s*(\w+)/);

    if (sourceNodeMatch && conditionFunctionMatch) {
        const sourceNode = sourceNodeMatch[1];
        const conditionFunction = conditionFunctionMatch[1];

        console.log('sourceNode', sourceNode);
        console.log('conditionFunction', conditionFunction);

        if (conditionFunction === 'tools_condition') {
            // 为 tools_condition 添加两条边
            edges.push({
                id: `e${sourceNode}-tools`,
                source: sourceNode,
                target: 'tools',
                data: { conditionFunction: 'tools_condition' }
            });

            if (!nodes.some(node => node.id === 'end')) {
                nodes.push({
                    id: 'end',
                    type: 'end',
                    position: { x: (nodes.length + 1) * 150, y: 100 },
                    data: { label: 'End' }
                });
            }

            edges.push({
                id: `e${sourceNode}-end`,
                source: sourceNode,
                target: 'end',
                data: { conditionFunction: 'tools_condition' }
            });
        } else {
            // 处理其他类型的条件边
            const mappingMatch = content.match(/{([^}]+)}/);
            if (mappingMatch) {
                const mappings = mappingMatch[1].split(',').map(pair => pair.trim());
                mappings.forEach(mapping => {
                    const [condition, target] = mapping.split(':').map(s => s.trim().replace(/['"]/g, ''));
                    edges.push({
                        id: `e${sourceNode}-${target}-${condition}`,
                        source: sourceNode,
                        target: target,
                        data: { condition: condition, conditionFunction: conditionFunction }
                    });
                });
            }
        }
    }
}