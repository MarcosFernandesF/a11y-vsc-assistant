import * as vscode from 'vscode';

let timeout: NodeJS.Timeout | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('A11y Assistant Funcionando.');

	if (vscode.window.activeTextEditor) {
		const doc = vscode.window.activeTextEditor.document;
		if (isFileExtensionValid(doc)) {
			imagesWithNoAltTextValidation(doc);
		}
	}

	const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(event => {
		const document = event.document;

		if (isFileExtensionValid(document)) {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => {
				imagesWithNoAltTextValidation(document);
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

function imagesWithNoAltTextValidation(document: vscode.TextDocument) {
	const text = document.getText();

	// Regex ampla para capturar TODAS as tags <img>, independente do conteúdo
	const regexTagImg = /<img[^>]*>/gi;

	// Regex específica para validar se o 'alt' existe e TEM CONTEÚDO (independente da ordem dos atributos)
	const regexValidAlt = /<img\s+(?=[^>]*?\balt=["'](?!\s*["'])[^"']+?["'])[^>]*?>/i;

	let match;
	while ((match = regexTagImg.exec(text)) !== null) {
		const entireTag = match[0];

		const hasValidAlt = regexValidAlt.test(entireTag);

		if (!hasValidAlt) {
			const inicioScan = document.positionAt(match.index);

			console.log(`Erro de Acessibilidade na Linha ${inicioScan.line + 1}: Tag <img> sem atributo 'alt' ou com 'alt' vazio.`);
		}
		else {
			console.log("Alt sendo utilizado!");
		}
	}
}

