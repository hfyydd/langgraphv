"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyLangGraphFile = modifyLangGraphFile;
const fs = __importStar(require("fs"));
const globalState_1 = require("./globalState");
function modifyLangGraphFile(filePath, operation) {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
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
                const newNodeLine = `${globalState_1.GlobalState.graphBuilderVariable}.add_node("${operation.node.id}", ${functionName})  # Add node for ${operation.node.data.label}`;
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
                    }
                    else {
                        if (line.startsWith('def ')) {
                            lastFunctionEndIndex = i;
                            for (let j = i + 1; j < lines.length; j++) {
                                if (lines[j].trim() === '' || lines[j].startsWith(' '.repeat(indentLevel))) {
                                    lastFunctionEndIndex = j;
                                }
                                else {
                                    break;
                                }
                            }
                            break;
                        }
                        else if (line.trim() !== '') {
                            indentLevel = line.search(/\S/);
                        }
                    }
                }
                if (lastFunctionEndIndex === -1) {
                    // 如果没有找到函数定义，就在文件末尾添加
                    lines.push(...newFunctionLines);
                    lines.push(newNodeLine);
                }
                else {
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
                }
            }
            break;
        case 'addEdge':
            if (operation.edge) {
                const newEdgeLine = `${globalState_1.GlobalState.graphBuilderVariable}.add_edge("${operation.edge.source}", "${operation.edge.target}")`;
                lines.push(newEdgeLine);
            }
            break;
        case 'removeEdge':
            if (operation.edgeId) {
                // 移除开头的 'e' 并分割 source 和 target
                const [source, target] = operation.edgeId.replace(/^e/, '').split('-');
                // 查找匹配的 add_edge 语句
                const edgeIndex = lines.findIndex(line => {
                    // 使用正则表达式来匹配 add_edge 语句，考虑可能的空格变化
                    const edgePattern = new RegExp(`add_edge\\s*\\(\\s*["']${source}["']\\s*,\\s*["']${target}["']\\s*\\)`);
                    return edgePattern.test(line);
                });
                if (edgeIndex !== -1) {
                    lines.splice(edgeIndex, 1);
                    //console.log(`Edge removed at line ${edgeIndex + 1}`);
                }
                else {
                    //console.log('Edge not found in the file');
                }
            }
            break;
        case 'updateNode':
            // Handle node updates (e.g., position changes) if needed
            break;
        case 'updateEdge':
            // Handle edge updates if needed
            break;
    }
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
}
//# sourceMappingURL=modifyLangGraphFile.js.map