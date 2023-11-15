// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getWebviewHtml } from "./loader";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "math-manipulator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("math-manipulator.open", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user

        const panel = vscode.window.createWebviewPanel("mathManipulatorMain", "", vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
        });

        const updateWebview = () => {
            panel.title = "Math Manipulator";
            panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri);
        };
        updateWebview();

        panel.onDidDispose(
            () => {
                // When the panel is closed, cancel any future updates to the webview content
                // TODO
            },
            null,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
