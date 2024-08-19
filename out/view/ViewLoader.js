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
exports.ViewLoader = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class ViewLoader {
    panel;
    context;
    static currentPanel;
    disposables = [];
    constructor(panel, context, messageHandler) {
        this.panel = panel;
        this.context = context;
        this.renderWebview();
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.onDidReceiveMessage(message => {
            messageHandler(message);
        }, null, this.disposables);
    }
    renderWebview() {
        this.panel.webview.html = this.getWebviewContent();
    }
    static showWebview(context, messageHandler) {
        const column = vscode.window.activeTextEditor?.viewColumn;
        if (ViewLoader.currentPanel) {
            ViewLoader.currentPanel.reveal(column);
        }
        else {
            const panel = vscode.window.createWebviewPanel('LangGraph Visualizer', 'LangGraph Visualizer', column || vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'out', 'app'))]
            });
            ViewLoader.currentPanel = panel;
            new ViewLoader(panel, context, messageHandler);
        }
    }
    static postMessageToWebview(message) {
        ViewLoader.currentPanel?.webview.postMessage(message);
    }
    dispose() {
        ViewLoader.currentPanel = undefined;
        this.panel.dispose();
        this.disposables.forEach(d => d.dispose());
    }
    getWebviewContent() {
        const bundleScriptPath = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'out', 'app', 'bundle.js')));
        return `
      <!DOCTYPE html>
      <html lang="en">
      
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LangGraph Visualizer</title>
        <link rel="stylesheet" type="text/css" href="styles.css">
      </head>
      <body>
        <div id="root"></div>
        <script src="${bundleScriptPath}"></script>
      </body>
      </html>
    `;
    }
}
exports.ViewLoader = ViewLoader;
//# sourceMappingURL=ViewLoader.js.map