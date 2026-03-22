import * as vscode from 'vscode';
import { validateImagesWithoutAlt } from './rules/imageRules';

let timeout: NodeJS.Timeout | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('A11y Assistant Funcionando.');

	if (vscode.window.activeTextEditor) {
		const doc = vscode.window.activeTextEditor.document;
		if (isFileExtensionValid(doc)) {
			processValidation(doc);
		}
	}

	const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
		const document = event.document;

		if (isFileExtensionValid(document)) {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => {
				processValidation(document);
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

function processValidation(document: vscode.TextDocument) {
	const text = document.getText();
	const errors = validateImagesWithoutAlt(text);

	errors.forEach(error => {
		const startPosition = document.positionAt(error.index);
		console.log(`[Linha ${startPosition.line + 1}] ${error.message}`);
	});
}