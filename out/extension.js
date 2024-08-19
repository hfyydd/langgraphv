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
const vscode = __importStar(require("vscode"));
const ViewLoader_1 = require("./view/ViewLoader");
const path = __importStar(require("path"));
const parser_1 = require("./parser");
const modifyLangGraphFile_1 = require("./modifyLangGraphFile");
const globalState_1 = require("./globalState");
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
function activate(context) {
    console.log('Congratulations, "LangGraph Visualizer" is now active!');
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.py');
    const updateCurrentFilePath = (document) => {
        globalState_1.GlobalState.currentFilePath = document?.languageId === 'python' ? document.uri.fsPath : undefined;
    };
    const handleFileChange = async (uri) => {
        const document = await vscode.workspace.openTextDocument(uri);
        if (document.languageId === 'python') {
            updateCurrentFilePath(document);
            const parsedGraph = (0, parser_1.parseLangGraphFile)(document.getText());
            ViewLoader_1.ViewLoader.postMessageToWebview({ type: 'updateGraph', data: parsedGraph });
        }
    };
    const messageHandler = (message) => {
        if (message.type === 'graphOperation' && globalState_1.GlobalState.currentFilePath) {
            (0, modifyLangGraphFile_1.modifyLangGraphFile)(globalState_1.GlobalState.currentFilePath, message.operation);
        }
    };
    const openVisualizer = vscode.commands.registerCommand('langgraphv.openVisualizer', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'python') {
            updateCurrentFilePath(editor.document);
            ViewLoader_1.ViewLoader.showWebview(context, messageHandler);
            const parsedGraph = (0, parser_1.parseLangGraphFile)(editor.document.getText());
            console.log(parsedGraph);
            setTimeout(() => {
                ViewLoader_1.ViewLoader.postMessageToWebview({ type: 'updateGraph', data: parsedGraph });
            }, 1000);
            vscode.window.showInformationMessage('LangGraph file parsed and visualizer opened!');
        }
        else {
            vscode.window.showWarningMessage('Please open a Python file first.');
        }
    });
    const newGraph = vscode.commands.registerCommand('langgraphv.newGraph', async () => {
        const targetFolder = await getTargetFolder();
        if (!targetFolder) {
            return;
        }
        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter a name for the new graph file',
            placeHolder: 'new_graph.py',
            value: 'new_graph.py'
        }) || 'new_graph.py';
        const newFile = vscode.Uri.file(path.join(targetFolder.fsPath, fileName.endsWith('.py') ? fileName : `${fileName}.py`));
        try {
            await vscode.workspace.fs.writeFile(newFile, Buffer.from(graphTemplate));
            const document = await vscode.workspace.openTextDocument(newFile);
            await vscode.window.showTextDocument(document);
            globalState_1.GlobalState.currentFilePath = newFile.fsPath;
            await vscode.commands.executeCommand('langgraphv.openVisualizer');
            vscode.window.showInformationMessage(`New graph file created: ${newFile.fsPath}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create new graph file: ${error}`);
        }
    });
    vscode.window.onDidChangeActiveTextEditor(editor => updateCurrentFilePath(editor?.document));
    //监控文件变化
    // watcher.onDidChange(handleFileChange);
    // watcher.onDidCreate(handleFileChange);
    // context.subscriptions.push(watcher, openVisualizer, newGraph);
    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.uri.fsPath === globalState_1.GlobalState.currentFilePath) {
            const fileContent = document.getText();
            const parsedGraph = (0, parser_1.parseLangGraphFile)(fileContent);
            ViewLoader_1.ViewLoader.postMessageToWebview({
                type: 'updateGraph',
                data: parsedGraph
            });
        }
    }, null, context.subscriptions);
    context.subscriptions.push(openVisualizer, newGraph);
}
async function getTargetFolder() {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.window.activeTextEditor
            ? vscode.Uri.file(path.dirname(vscode.window.activeTextEditor.document.uri.fsPath))
            : vscode.workspace.workspaceFolders[0].uri;
    }
    else {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select Folder'
        });
        if (folderUri && folderUri[0]) {
            await vscode.commands.executeCommand('vscode.openFolder', folderUri[0]);
            return folderUri[0];
        }
    }
    return undefined;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map