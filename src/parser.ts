import { Edge, Node } from './types';
import { GlobalState } from './globalState';

export function parseLangGraphFile(fileContent: string): { nodes: Node[], edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    // 预处理：移除注释
    const lines = fileContent.split('\n').map(line => {
        const commentIndex = line.indexOf('#');
        // 新增：保留缩进
        return commentIndex !== -1 ? line.substring(0, commentIndex).trim() : line; // 保留缩进
    }).filter(line => line !== ''); 

    let stateClassName: string | null = null;
    let conditionalEdgeBuffer = '';
    let isParsingConditionalEdge = false;
    let isParsingAddNode = false;
    let addNodeBuffer = '';
    let isParsingForLoop = false;
    let forLoopBuffer = '';

    // New: Store function definitions
    const functionDefinitions: { [key: string]: string } = {};
    let currentFunction = '';
    let functionBuffer = '';
    let functionIndentLevel = 0;

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const indentLevel = line.search(/\S|$/) / 4;
        // New: Capture function definitions
        if (trimmedLine.startsWith('def ')) {
            if (currentFunction) {
                // Save the previous function if there was one
                functionDefinitions[currentFunction] = functionBuffer.trim();
            }
            currentFunction = trimmedLine.split('(')[0].split(' ')[1];
            functionBuffer = line + '\n';
            functionIndentLevel = indentLevel;
        } else if (currentFunction) {
            if (indentLevel > functionIndentLevel || (indentLevel === functionIndentLevel && trimmedLine.startsWith(')'))) {
                // This line is part of the current function
                functionBuffer += line + '\n';
            } else {
                // Function has ended
                console.log('Function ended:', currentFunction);
                console.log('Function content:', functionBuffer);
                functionDefinitions[currentFunction] = functionBuffer.trim();
                currentFunction = '';
                functionBuffer = '';
            }
        }

        // 查找 StateGraph 实例的变量名和 State 类名
        const stateGraphMatch = line.match(/(\w+)\s*=\s*StateGraph\((\w+)\)/);
        if (stateGraphMatch) {
            GlobalState.graphBuilderVariable = stateGraphMatch[1];
            stateClassName = stateGraphMatch[2];
        }

        if (GlobalState.graphBuilderVariable) {
            // 开始解析多行 add_node
            if (line.includes(`${GlobalState.graphBuilderVariable}.add_node(`) && !line.trim().endsWith(')')) {
                isParsingAddNode = true;
                addNodeBuffer = line + '\n';
            } else if (isParsingAddNode) {
                addNodeBuffer += line + '\n';
                if (line.trim().endsWith(')')) {
                    isParsingAddNode = false;
                    parseAddNode(addNodeBuffer.trim(), nodes, index, functionDefinitions);
                    addNodeBuffer = '';
                }
            } else {
                // 解析单行 add_node
                const nodeRegex = new RegExp(`${GlobalState.graphBuilderVariable}\\.add_node\\("(\\w+)",\\s*(\\w+)`);

                const nodeMatch = line.match(nodeRegex);
                if (nodeMatch) {
                    const nodeId = nodeMatch[1];
                    const nodeFunction = nodeMatch[2];
                    nodes.push({
                        id: nodeId,
                        type: 'custom',
                        position: { x: index * 150, y: index * 100 },
                        data: {
                            label: nodeId,
                            function: nodeFunction,
                            codeSnippet: functionDefinitions[nodeFunction] || 'Code not found'
                        }
                    });
                }
            }

            // 解析边，包括 START 和 END 的情况
            const edgeRegex = new RegExp(`${GlobalState.graphBuilderVariable}\\.add_edge\\(\\s*([\\w"]+)\\s*,\\s*([\\w"]+)\\s*\\)`);
            const edgeMatch = line.match(edgeRegex);
            if (edgeMatch) {
                let source = edgeMatch[1].replace(/"/g, '');
                let target = edgeMatch[2].replace(/"/g, '');

                if (source === 'START' || source === '__start__') {
                    source = 'start';
                    ensureNodeExists(nodes, 'start', 'start', { x: 0, y: 0 });
                }

                if (target === 'END' || target === '__end__') {
                    target = 'end';
                    ensureNodeExists(nodes, 'end', 'end', { x: (index + 1) * 150, y: 100 });
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
                ensureNodeExists(nodes, 'start', 'start', { x: 0, y: 0 });
                edges.push({
                    id: `start-${entryPointMatch[1]}`,
                    source: 'start',
                    target: entryPointMatch[1]
                });
            }

            // 解析结束点
            const finishPointMatch = line.match(`${GlobalState.graphBuilderVariable}\\.set_finish_point\\("(\\w+)"`);
            if (finishPointMatch) {
                ensureNodeExists(nodes, 'end', 'end', { x: (index + 1) * 150, y: 100 });
                edges.push({
                    id: `${finishPointMatch[1]}-end`,
                    source: finishPointMatch[1],
                    target: 'end'
                });
            }

            // 开始解析条件边
            if (line.includes(`${GlobalState.graphBuilderVariable}.add_conditional_edges(`)) {
                isParsingConditionalEdge = true;
                conditionalEdgeBuffer = line + '\n';
            } else if (isParsingConditionalEdge) {
                conditionalEdgeBuffer += line + '\n';
                if (line.trim().endsWith(')')) {
                    isParsingConditionalEdge = false;
                    parseConditionalEdge(conditionalEdgeBuffer.trim(), nodes, edges);
                    conditionalEdgeBuffer = '';
                }
            }

            // 开始解析 for 循环
            if (line.trim().startsWith('for ') && line.includes(GlobalState.graphBuilderVariable)) {
                isParsingForLoop = true;
                forLoopBuffer = line + '\n';
            } else if (isParsingForLoop) {
                forLoopBuffer += line + '\n';
                if (line.trim().endsWith(')') || !line.trim().startsWith(' ')) {
                    isParsingForLoop = false;
                    parseForLoop(forLoopBuffer.trim(), nodes, edges, index);
                    forLoopBuffer = '';
                }
            }
        }
    });

    return { nodes, edges };
}

function parseAddNode(content: string, nodes: Node[], index: number, functionDefinitions: { [key: string]: string }) {

    const nodeMatch = content.match(/"(\w+)",\s*(\w+)/);
    if (nodeMatch) {
        const [, nodeId, nodeFunction] = nodeMatch;
        const newNode: Node = {
            id: nodeId,
            type: 'custom',
            position: { x: index * 150, y: index * 100 },
            data: { label: nodeId, function: nodeFunction, codeSnippet: functionDefinitions[nodeFunction] || 'Code not found' }
        };



        nodes.push(newNode);
    } else {
        console.error('Failed to parse add_node:', content);
    }
}

function parseConditionalEdge(content: string, nodes: Node[], edges: Edge[]) {

    // 移除以 '#' 开头的整行注释，保留其他行
    const contentWithoutComments = content.split('\n')
        .filter(line => !line.trim().startsWith('#'))
        .join('\n');


    // 提取源节点
    const sourceNodeMatch = contentWithoutComments.match(/\(\s*"?([^",]+)"?\s*,/);
    // 提取条件函数
    const conditionFunctionMatch = contentWithoutComments.match(/,\s*(\w+)\s*,/);
    // 提取映射
    const mappingMatch = contentWithoutComments.match(/{([^}]+)}/s);

    if (sourceNodeMatch && conditionFunctionMatch && mappingMatch) {
        let sourceNode = sourceNodeMatch[1].trim().replace(/['"]/g, '');
        const conditionFunction = conditionFunctionMatch[1];

        // 处理 START 特殊情况
        if (sourceNode === 'START' || sourceNode === '__start__') {
            sourceNode = 'start';
            ensureNodeExists(nodes, 'start', 'start', { x: 0, y: 0 });
        }

        // 创建新的条件节点
        const conditionNodeId = `condition_${sourceNode}_${conditionFunction}`;
        const mappings = mappingMatch[1].split(',')
            .map(pair => pair.trim())
            .filter(pair => pair.length > 0);

        const conditions = mappings.map(mapping => mapping.split(':')[0].trim().replace(/['"]/g, ''));

        const conditionNode: Node = {
            id: conditionNodeId,
            type: 'condition',
            position: { x: (nodes.length + 1) * 150, y: (nodes.length + 1) * 100 },
            data: { 
                label: conditionFunction,
                conditionFunction: conditionFunction,
                conditions: conditions
            }
        };
        nodes.push(conditionNode);

        // 添加从源节点到条件节点的边
        edges.push({
            id: `e${sourceNode}-${conditionNodeId}`,
            source: sourceNode,
            target: conditionNodeId
        });

        // 处理每个条件分支
        mappings.forEach((mapping, index) => {
            const [condition, target] = mapping.split(':').map(s => s.trim().replace(/['"]/g, ''));
            let targetNode = target;

            // 处理 END 特殊情况
            if (targetNode === 'END' || targetNode === '__end__') {
                targetNode = 'end';
                ensureNodeExists(nodes, 'end', 'end', { x: (nodes.length + 1) * 150, y: 100 });
            }

            // 添加从条件节点到目标节点的边，包含索引
            edges.push({
                id: `e${conditionNodeId}-${targetNode}-${condition}`,
                source: conditionNodeId,
                target: targetNode,
                sourceHandle: `condition-${index}`, // 添加这行
                data: { condition: condition } // 可选：添加条件信息到边的数据中
            });

            // 如果目标节点不存在且不是 start 或 end，添加一个新的节点
            if (!['start', 'end'].includes(targetNode)) {
                ensureNodeExists(nodes, targetNode, 'custom', { x: (nodes.length + 1) * 150, y: (nodes.length + 1) * 100 });
            }
        });
    } else {
        console.error('Failed to parse conditional edge:', content);
    }
}

function parseForLoop(content: string, nodes: Node[], edges: Edge[], startIndex: number) {
    const lines = content.split('\n');
    const rangeMatch = lines[0].match(/for\s+\w+\s+in\s+range\((\d+)\):/);

    if (rangeMatch) {
        const loopCount = parseInt(rangeMatch[1]);

        for (let i = 0; i < loopCount; i++) {
            lines.slice(1).forEach(line => {
                const nodeMatch = line.match(/add_node\(f"(\w+)_{\w+}",\s*(\w+)\)/);
                if (nodeMatch) {
                    const nodeId = `${nodeMatch[1]}_${i}`;
                    nodes.push({
                        id: nodeId,
                        type: 'custom',
                        position: { x: (startIndex + i) * 150, y: (startIndex + i) * 100 },
                        data: { label: nodeId, function: nodeMatch[2] }
                    });
                }

                const edgeMatch = line.match(/add_edge\(f"(\w+)_{\w+}",\s*f"(\w+)_{\w+\+1}"\)/);
                if (edgeMatch && i < loopCount - 1) {
                    const sourceId = `${edgeMatch[1]}_${i}`;
                    const targetId = `${edgeMatch[2]}_${i + 1}`;
                    edges.push({
                        id: `e${sourceId}-${targetId}`,
                        source: sourceId,
                        target: targetId
                    });
                }
            });
        }
    }
}

function ensureNodeExists(nodes: Node[], id: string, type: 'start' | 'end' | 'custom', position: { x: number, y: number }) {
    if (!nodes.some(node => node.id === id)) {
        nodes.push({
            id: id,
            type: type,
            position: position,
            data: { label: id }
        });
    }
}