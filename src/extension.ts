import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('A11y Assistant Funcionado.');

	const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
		const document = event.document;

		if (document.languageId === 'html' || document.languageId === 'css') {
			console.log(event);
			console.log("Evento escutado.");
		}
	});

	context.subscriptions.push(documentChangeEvent);
}

export function deactivate() { }
