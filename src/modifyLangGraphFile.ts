import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Node, Edge } from './types';
import { GlobalState } from './globalState';

interface GraphOperation {
    type: 'addNode' | 'removeNode' | 'addEdge' | 'removeEdge' | 'updateNode' | 'updateEdge';
    node?: Node;
    edge?: Edge;
    nodeId?: string;
    edgeId?: string;
}

export function modifyLangGraphFile(filePath: string, operation: GraphOperation): void {
    //console.log('Modifying file path:', filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    //console.log('Modifying file:', operation);
    switch (operation.type) {
        case 'addNode':
            if (operation.node) {
                const functionName = operation.node.data.label.replace(/\s+/g, '_').toLowerCase();
                const newFunctionLines = [
                    ``,
                    `def ${functionName}(state):`,
                    `    pass`,
                    ``
                ];
                const newNodeLine = `${GlobalState.graphBuilderVariable}.add_node("${operation.node.id}", ${functionName})  # Add node for ${operation.node.data.label}`;

                // 找到最后一个函数定义的结束位置
                let lastFunctionEndIndex = -1;
                let insideFunction = false;
                let indentLevel = 0;

                for (let i = lines.length - 1; i >= 0; i--) {
                    const line = lines[i];
                    if (!insideFunction) {
                        if (line.trim() !== '' && !line.startsWith(' ') && !line.startsWith('#')) {
                            insideFunction = true;
                            indentLevel = 0;
                        }
                    } else {
                        if (line.startsWith('def ')) {
                            lastFunctionEndIndex = i;
                            for (let j = i + 1; j < lines.length; j++) {
                                if (lines[j].trim() === '' || lines[j].startsWith(' '.repeat(indentLevel))) {
                                    lastFunctionEndIndex = j;
                                } else {
                                    break;
                                }
                            }
                            break;
                        } else if (line.trim() !== '') {
                            indentLevel = line.search(/\S/);
                        }
                    }
                }

                if (lastFunctionEndIndex === -1) {
                    // 如果没有找到函数定义，就在文件末尾添加
                    lines.push(...newFunctionLines);
                    lines.push(newNodeLine);
                } else {
                    // 在最后一个函数定义结束后插入新函数
                    lines.splice(lastFunctionEndIndex + 1, 0, ...newFunctionLines);
                    // 在新函数后面添加新节点
                    lines.splice(lastFunctionEndIndex + newFunctionLines.length + 1, 0, newNodeLine);
                }
            }
            break;
        case 'removeNode':
            if (operation.nodeId) {
                const nodeIndex = lines.findIndex(line => line.includes(`add_node("${operation.nodeId}"`));
                if (nodeIndex !== -1) {
                    const nodeLine = lines[nodeIndex];
                    lines.splice(nodeIndex, 1);

                    // 提取函数名
                    const functionNameMatch = nodeLine.match(/add_node\("[^"]+",\s*(\w+)/);
                    if (functionNameMatch) {
                        const functionName = functionNameMatch[1];

                        // 找到并删除函数定义
                        let functionStartIndex = -1;
                        let functionEndIndex = -1;
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].startsWith(`def ${functionName}(`)) {
                                functionStartIndex = i;
                                // 找到函数结束的位置
                                for (let j = i + 1; j < lines.length; j++) {
                                    if (j === lines.length - 1 || (lines[j].trim() !== '' && !lines[j].startsWith(' '))) {
                                        functionEndIndex = j - 1;
                                        break;
                                    }
                                }
                                break;
                            }
                        }

                        // 如果找到了函数定义，删除它
                        if (functionStartIndex !== -1 && functionEndIndex !== -1) {
                            lines.splice(functionStartIndex, functionEndIndex - functionStartIndex + 1);
                        }
                    }

                    // 删除与该节点相关的所有边
                    const edgesToRemove = [];
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes(`add_edge(`) &&
                            (lines[i].includes(`"${operation.nodeId}"`) || lines[i].includes(`'${operation.nodeId}'`))) {
                            edgesToRemove.push(i);
                        }
                    }

                    // 从后往前删除边，以避免索引变化问题
                    for (let i = edgesToRemove.length - 1; i >= 0; i--) {
                        lines.splice(edgesToRemove[i], 1);
                    }
                    console.log(`Removed node ${operation.nodeId} and ${edgesToRemove.length} related edges`);
                }

            }
            break;
        case 'addEdge':
            if (operation.edge) {
                const newEdgeLine = `${GlobalState.graphBuilderVariable}.add_edge("${operation.edge.source}", "${operation.edge.target}")`;
                lines.push(newEdgeLine);
            }
            break;
        case 'removeEdge':
            if (operation.edgeId) {
                // 移除开头的 'e' 并分割 source 和 target
                const [source, target] = operation.edgeId.replace(/^e/, '').split('-');
                console.log('Removing edge:', source, target);

                // 查找匹配的 add_edge 语句
                const edgeIndex = lines.findIndex(line => {
                    // 使用正则表达式来匹配 add_edge 语句，考虑可能的空格变化
                    const edgePattern = new RegExp(`add_edge\\s*\\(\\s*["']${source}["']\\s*,\\s*["']${target}["']\\s*\\)`);
                    return edgePattern.test(line);
                });

                if (edgeIndex !== -1) {
                    lines.splice(edgeIndex, 1);
                    console.log(`Edge removed at line ${edgeIndex + 1}`);
                } else {
                    console.log('Edge not found in the file');
                }
            }
            break;
        case 'updateNode':
            //console.log('Updating node:', operation.node);
            // Handle node updates (e.g., position changes) if needed
            break;
        case 'updateEdge':
            //console.log('Updating edge:', operation.edge);
            // Handle edge updates if needed
            break;
    }

    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
}