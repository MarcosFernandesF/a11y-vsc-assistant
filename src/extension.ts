import * as vscode from 'vscode';
import { validateImagesWithoutAlt } from './rules/imageRules';
import { validateHeadersOrder } from './rules/headersRules';
import { RuleError } from './rules/types';

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

	const activeEditorChangeEvent = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (!editor) {
			return;
		}

		const document = editor.document;
		if (isFileExtensionValid(document)) {
			processValidation(document);
		}
	});

	context.subscriptions.push(documentChangeEvent);
	context.subscriptions.push(activeEditorChangeEvent);
}

export function deactivate() {
	if (timeout) {
		clearTimeout(timeout);
	}
}

function isFileExtensionValid(document: vscode.TextDocument): boolean {
	return document.languageId === 'html' || document.languageId === 'css';
}

function processValidation(document: vscode.TextDocument): void {
	const text = document.getText();

	let errors: RuleError[] = [];

	errors.push(...validateImagesWithoutAlt(text));
	errors.push(...validateHeadersOrder(text));

	errors.forEach(error => {
		const startPosition = document.positionAt(error.index);
		console.log(`[Linha ${startPosition.line + 1}] ${error.message}`);
	});
}