import * as vscode from 'vscode';

let timeout: NodeJS.Timeout | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('A11y Assistant Funcionando.');

	const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
		const document = event.document;

		if (document.languageId === 'html' || document.languageId === 'css') {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => {
				console.log("Evento escutado: ", event);
			}, 500);
		}
	});

	context.subscriptions.push(documentChangeEvent);
}

export function deactivate() {
	if (timeout) {
		clearTimeout(timeout);
	}
}