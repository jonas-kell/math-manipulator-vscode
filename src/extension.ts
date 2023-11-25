// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getWebviewHtml } from "./loader";
import { MathManipulatorEditorProvider } from "./editor";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "math-manipulator" is now active!');

    let openCommand = vscode.commands.registerCommand("math-manipulator.open", () => {
        const panel = vscode.window.createWebviewPanel("math-manipulator.main-editor", "", vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
        });

        const updateWebview = () => {
            panel.title = "Math Manipulator";
            panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri, "empty");
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
    let helpCommand = vscode.commands.registerCommand("math-manipulator.help", () => {
        const panel = vscode.window.createWebviewPanel("math-manipulator.help-editor", "", vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
        });

        const updateWebview = () => {
            panel.title = "MM Help Playground";
            panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri, "help");
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

    context.subscriptions.push(openCommand);
    context.subscriptions.push(helpCommand);
    context.subscriptions.push(MathManipulatorEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
