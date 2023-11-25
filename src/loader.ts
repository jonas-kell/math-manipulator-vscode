import manifest from "./dist/manifest.json";
import * as vscode from "vscode";

let cssPathSegments = [] as string[];
let jsPathSegment = "";

Object.keys(manifest).forEach((key: string) => {
    const elem = (manifest as any)[key] as {
        isEntry: boolean | undefined;
        src: string;
    };

    if (elem.isEntry !== undefined && elem.isEntry) {
        // elem also has "file" (js-file) and "css" properties
        const htmlManifest = elem as unknown as {
            css: string[];
            file: string;
        };

        cssPathSegments = htmlManifest.css.map((cssPath) => {
            return cssPath;
        });
        jsPathSegment = htmlManifest.file;
    }
});

export function getWebviewHtml(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    mainMode: "main" | "help" | "empty" | "stored"
) {
    return (
        `
<head>
    <meta charset="UTF-8" />
    <script>
        window.mainMode = "${mainMode}";
    </script>
    <script type="module" crossorigin src="${webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "dist", jsPathSegment)
    )}"></script>
` +
        cssPathSegments
            .map((cssPath: string) => {
                const path = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "dist", cssPath));
                return `
    <link rel="stylesheet" href="${path}">
        `;
            })
            .join() +
        `
    <style>
        body {
            font-weight: var(--vscode-editor-font-weight);
            font-size: var(--vscode-editor-font-size);
            font-family: var(--vscode-editor-font-family);
        }
        textarea {
            border-color: var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            background-color: var(--vscode-input-background);
        }
        textarea:disabled {
            color: var(--vscode-disabledForeground);
        }
        input {
            border-color: var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            background-color: var(--vscode-input-background);
        }
        input:disabled {
            color: var(--vscode-disabledForeground);
        }
        button {
            color: var(--vscode-button-foreground);
            background-color: var(--vscode-button-background);
            border-color: var(--vscode-button-background);
        }
        button:hover:not(:disabled) {
            background-color: var(--vscode-button-hoverBackground);
            border-color: var(--vscode-button-hoverBackground);
        }
        button:disabled {
            color: var(--vscode-disabledForeground);
        }
    </style>
</head>
<body>
        <div id="app"></div>
</body>`
    );
}
