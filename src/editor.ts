import * as vscode from "vscode";
import { getWebviewHtml } from "./loader";

type EditorInstanceStuff = {
    debounceStoring: NodeJS.Timeout;
    isSelfEditing: boolean;
};

export class MathManipulatorEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        vscode.commands.registerCommand("math-manipulator.new-document", () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage(
                    "Creating new Math Manipulator Document files currently requires opening a workspace"
                );
                return;
            }

            const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, `${String(Date.now())}.mmdata`).with({ scheme: "untitled" });

            vscode.commands.executeCommand("vscode.openWith", uri, MathManipulatorEditorProvider.viewType);
        });

        const provider = new MathManipulatorEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(MathManipulatorEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = "math-manipulator.document-editor";
    constructor(private readonly context: vscode.ExtensionContext) {}

    private documentState = {} as any;

    /**
     * Called when our custom editor is opened.
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        let editorInstanceStuff = {
            debounceStoring: setTimeout(() => {}, 0),
            isSelfEditing: false,
        } as EditorInstanceStuff;

        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "dist")],
        };
        webviewPanel.webview.html = getWebviewHtml(webviewPanel.webview, this.context.extensionUri, "stored");

        // hold state locally
        this.documentState = this.getDocumentAsJson(document);

        const updateWebview = () => {
            webviewPanel.webview.postMessage({
                type: "update",
                content: this.documentState,
            });
        };
        const postAtLeastOneUpdateSent = () => {
            webviewPanel.webview.postMessage({
                type: "atLeastOneUpdateSent",
            });
        };

        // Hook up event handlers so that we can synchronize the webview with the text document.
        //
        // The text document acts as our model, so we have to sync change in the document to our
        // editor and sync changes in the editor back to the document.
        //
        // Remember that a single text document can also be shared between multiple custom
        // editors (this happens for example when you split a custom editor)
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                if (!editorInstanceStuff.isSelfEditing) {
                    const newState = this.getDocumentAsJson(document);
                    let changeLoaded = false;
                    Object.keys(this.documentState).forEach((oldKey) => {
                        if (
                            newState[oldKey] === null ||
                            newState[oldKey] === undefined ||
                            this.documentState[oldKey] === null ||
                            this.documentState[oldKey] === undefined
                        ) {
                            delete this.documentState[oldKey];
                            changeLoaded = true;
                        }
                    });
                    Object.keys(newState).forEach((newKey) => {
                        if (this.documentState[newKey] !== newState[newKey]) {
                            this.documentState[newKey] = newState[newKey];
                            changeLoaded = true;
                        }
                    });
                    if (changeLoaded) {
                        console.log("External changes to local document state detected");
                    }

                    updateWebview();
                }
            }
        });

        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case "change":
                    this.putValueForUuidIntoStorage(document, e.uuid, e.content, editorInstanceStuff);
                    return;
                default:
                    throw Error(`Message handler for ${e.type} not implemented`);
            }
        });

        // initial update
        updateWebview();
        postAtLeastOneUpdateSent();
    }

    /**
     * Put values into the document
     */
    private putValueForUuidIntoStorage(
        document: vscode.TextDocument,
        uuid: string,
        content: string,
        editorInstanceStuff: EditorInstanceStuff
    ) {
        if (this.documentState[uuid] !== content) {
            this.documentState[uuid] = content;

            this.updateTextDocument(document, editorInstanceStuff);
        }
    }

    /**
     * Try to get a current document as json text.
     */
    private getDocumentAsJson(document: vscode.TextDocument): any {
        const text = document.getText();
        if (text.trim().length === 0) {
            return {};
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Could not get document as json. Content is not valid json");
        }
    }

    /**
     * Write out the json to a given document.
     */
    private async updateTextDocument(document: vscode.TextDocument, editorInstanceStuff: EditorInstanceStuff) {
        clearTimeout(editorInstanceStuff.debounceStoring);
        editorInstanceStuff.debounceStoring = setTimeout(async () => {
            if (!editorInstanceStuff.isSelfEditing) {
                editorInstanceStuff.isSelfEditing = true;

                const edit = new vscode.WorkspaceEdit();
                // Just replace the entire document every time for this example extension.
                // A more complete extension should compute minimal edits instead.
                edit.replace(
                    document.uri,
                    new vscode.Range(0, 0, document.lineCount, 0),
                    JSON.stringify(this.documentState, null, 2)
                );
                await vscode.workspace.applyEdit(edit);

                editorInstanceStuff.isSelfEditing = false;
            } else {
                // back off, try again
                setTimeout(() => {
                    this.updateTextDocument(document, editorInstanceStuff);
                }, 150);
            }
        }, 100);
    }
}
