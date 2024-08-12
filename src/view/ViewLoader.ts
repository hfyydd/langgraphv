import * as vscode from 'vscode';
import * as path from 'path';


export class ViewLoader {
  private static currentPanel?: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  private constructor(
    private readonly panel: vscode.WebviewPanel,
    private readonly context: vscode.ExtensionContext,
    messageHandler: (message: any) => void
  ) {
    this.renderWebview();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      message => {
        messageHandler(message);
      },
      null,
      this.disposables
    );
  }

  private renderWebview() {
    this.panel.webview.html = this.getWebviewContent();
  }

  static showWebview(context: vscode.ExtensionContext, messageHandler: (message: any) => void) {
    const column = vscode.window.activeTextEditor?.viewColumn;
    if (ViewLoader.currentPanel) {
      ViewLoader.currentPanel.reveal(column);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'LangGraph Visualizer',
        'LangGraph Visualizer',
        column || vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'out', 'app'))]
        }
      );
      ViewLoader.currentPanel = panel;
      new ViewLoader(panel, context, messageHandler);
    }
  }

  static postMessageToWebview(message: any) {
    ViewLoader.currentPanel?.webview.postMessage(message);
  }

  private dispose() {
    ViewLoader.currentPanel = undefined;
    this.panel.dispose();
    this.disposables.forEach(d => d.dispose());
  }

  private getWebviewContent(): string {
    const bundleScriptPath = this.panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'out', 'app', 'bundle.js'))
    );

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