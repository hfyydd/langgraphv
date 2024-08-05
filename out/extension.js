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
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const ViewLoader_1 = require("./view/ViewLoader");
const path = __importStar(require("path"));
const graphTemplate = `from typing import Annotated

from typing_extensions import TypedDict
from langgraph.graph import END,S
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(
    base_url='',
    api_key='',
    model='',
)

class State(TypedDict):
    # Messages have the type "list". The \`add_messages\` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]


graph_builder = StateGraph(State)


def chatbot(state: State):
    return {"messages": [llm.invoke(state["messages"])]}


# The first argument is the unique node name
# The second argument is the function or object that will be called whenever
# the node is used.
graph_builder.add_node("chatbot", chatbot)


graph_builder.set_entry_point("chatbot")
graph_builder.set_finish_point("chatbot")


graph = graph_builder.compile()
`;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "langgraphv" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('langgraphv.openVisualizer', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        ViewLoader_1.ViewLoader.showWebview(context);
        //vscode.window.showInformationMessage('Hello World from langgraphv!');
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            // 检查文件是否是 Python 文件
            if (document.languageId === 'python') {
                const fileContent = document.getText();
                const parsedGraph = parseLangGraphFile(fileContent);
                // 等待一小段时间确保 WebView 已经准备好
                setTimeout(() => {
                    // 发送解析结果到 WebView
                    ViewLoader_1.ViewLoader.postMessageToWebview({
                        type: 'updateGraph',
                        data: parsedGraph
                    });
                }, 1000); // 1秒的延迟，可以根据需要调整
                vscode.window.showInformationMessage('LangGraph file parsed and visualizer opened!');
            }
            else {
                vscode.window.showWarningMessage('The active file is not a Python file. Please open a LangGraph Python file.');
            }
        }
        else {
            vscode.window.showWarningMessage('No active editor found. Please open a LangGraph file.');
        }
    });
    let newGraphDisposable = vscode.commands.registerCommand('langgraphv.newGraph', async () => {
        let targetFolder;
        // Check if there's an open workspace
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            // If there's an active text editor, use its folder; otherwise use the first workspace folder
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                targetFolder = vscode.Uri.file(path.dirname(activeEditor.document.uri.fsPath));
            }
            else {
                targetFolder = vscode.workspace.workspaceFolders[0].uri;
            }
        }
        else {
            // No open workspace, ask the user to select a folder
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Folder'
            });
            if (folderUri && folderUri[0]) {
                targetFolder = folderUri[0];
                // Open the selected folder in VS Code
                await vscode.commands.executeCommand('vscode.openFolder', targetFolder);
            }
            else {
                vscode.window.showErrorMessage('No folder selected. Cannot create new graph file.');
                return;
            }
        }
        // Ask for the file name
        const defaultFileName = 'new_graph.py';
        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter a name for the new graph file',
            placeHolder: defaultFileName,
            value: defaultFileName // Set default value
        });
        const finalFileName = fileName || defaultFileName;
        const newFile = vscode.Uri.file(path.join(targetFolder.fsPath, finalFileName.endsWith('.py') ? finalFileName : `${finalFileName}.py`));
        try {
            await vscode.workspace.fs.writeFile(newFile, Buffer.from(graphTemplate));
            const document = await vscode.workspace.openTextDocument(newFile);
            await vscode.commands.executeCommand('langgraphv.openVisualizer', newFile);
            await vscode.window.showTextDocument(document, { preserveFocus: false, preview: false });
            vscode.window.showInformationMessage(`New graph file created: ${newFile.fsPath}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create new graph file: ${error}`);
        }
    });
    context.subscriptions.push(disposable, newGraphDisposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
function parseLangGraphFile(fileContent) {
    const nodes = [];
    const edges = [];
    const lines = fileContent.split('\n');
    let graphBuilderVariable = null;
    let stateClassName = null;
    const functionDefinitions = {};
    lines.forEach((line, index) => {
        // 查找 StateGraph 实例的变量名和 State 类名
        const stateGraphMatch = line.match(/(\w+)\s*=\s*StateGraph\((\w+)\)/);
        if (stateGraphMatch) {
            graphBuilderVariable = stateGraphMatch[1];
            stateClassName = stateGraphMatch[2];
        }
        // 查找函数定义，只要参数类型是 State 就认为是节点
        const functionDefMatch = line.match(/def\s+(\w+)\s*\(\s*\w+\s*:\s*(\w+)\s*\)/);
        if (functionDefMatch && functionDefMatch[2] === stateClassName) {
            functionDefinitions[functionDefMatch[1]] = { name: functionDefMatch[1], line: index };
        }
        if (graphBuilderVariable) {
            // 解析边
            const edgeRegex = new RegExp(`${graphBuilderVariable}\\.add_edge\\("(\\w+)",\\s*"(\\w+)"`);
            const edgeMatch = line.match(edgeRegex);
            if (edgeMatch) {
                edges.push({
                    id: `e${edgeMatch[1]}-${edgeMatch[2]}`,
                    source: edgeMatch[1],
                    target: edgeMatch[2]
                });
            }
            // 解析入口点
            const entryPointMatch = line.match(`${graphBuilderVariable}\\.set_entry_point\\("(\\w+)"`);
            if (entryPointMatch) {
                nodes.push({
                    id: 'entry',
                    type: 'entry',
                    position: { x: 0, y: 0 },
                    data: { label: 'Entry Point' }
                });
                edges.push({
                    id: `entry-${entryPointMatch[1]}`,
                    source: 'entry',
                    target: entryPointMatch[1]
                });
            }
            // 解析结束点
            const finishPointMatch = line.match(`${graphBuilderVariable}\\.set_finish_point\\("(\\w+)"`);
            if (finishPointMatch) {
                nodes.push({
                    id: 'finish',
                    type: 'finish',
                    position: { x: index * 150, y: index * 100 },
                    data: { label: 'Finish Point' }
                });
                edges.push({
                    id: `${finishPointMatch[1]}-finish`,
                    source: finishPointMatch[1],
                    target: 'finish'
                });
            }
        }
    });
    // 将所有接受 State 作为参数的函数添加为节点
    Object.values(functionDefinitions).forEach((func, index) => {
        nodes.push({
            id: func.name,
            type: 'function',
            position: { x: index * 150, y: func.line * 30 },
            data: { label: func.name, function: func.name }
        });
    });
    return { nodes, edges };
}
//# sourceMappingURL=extension.js.map