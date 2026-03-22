import * as vscode from 'vscode';
import { validateImagesWithoutAlt } from './rules/imageRules';

let timeout: NodeJS.Timeout | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('A11y Assistant Funcionando.');

	if (vscode.window.activeTextEditor) {
		const doc = vscode.window.activeTextEditor.document;
		if (isFileExtensionValid(doc)) {
			validateImagesWithoutAlt(doc.getText());
		}
	}

	const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
		const document = event.document;

		if (isFileExtensionValid(document)) {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => {
				validateImagesWithoutAlt(document.getText());
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

function isFileExtensionValid(document: vscode.TextDocument) {
	return document.languageId === 'html' || document.languageId === 'css';
}