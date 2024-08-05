"use strict";
// src/view/ViewLoader.ts
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
    static currentPanel;
    panel;
    context;
    disposables;
    constructor(context) {
        this.context = context;
        this.disposables = [];
        this.panel = vscode.window.createWebviewPanel('LangGraph Visualizer', 'LangGraph Visualizer', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'out', 'app'))],
        });
        // render webview
        this.renderWebview();
        // listen messages from webview
        this.panel.webview.onDidReceiveMessage((message) => {
            console.log('msg', message);
        }, null, this.disposables);
        this.panel.onDidDispose(() => {
            this.dispose();
        }, null, this.disposables);
    }
    renderWebview() {
        const html = this.render();
        this.panel.webview.html = html;
    }
    static showWebview(context) {
        const cls = this;
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (cls.currentPanel) {
            cls.currentPanel.reveal(column);
        }
        else {
            cls.currentPanel = new cls(context).panel;
        }
    }
    static postMessageToWebview(message) {
        // post message from extension to webview
        const cls = this;
        cls.currentPanel?.webview.postMessage(message);
    }
    dispose() {
        ViewLoader.currentPanel = undefined;
        // Clean up our resources
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    render() {
        const bundleScriptPath = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'out', 'app', 'bundle.js')));
        return `
      <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>React App</title>
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