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

export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri) {
    return (
        `
<head>
    <meta charset="UTF-8" />
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
</head>
<body>
        <div id="app"></div>
</body>`
    );
}
