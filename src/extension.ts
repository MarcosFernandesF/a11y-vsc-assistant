import * as vscode from 'vscode';
import { validateImagesWithoutAlt } from './rules/imageRules';
import { validateHeadersOrder } from './rules/headersRules';
import { validateZoomCapability } from './rules/zoomRules';
import { validateJustifiedCss } from './rules/justifyRules';
import { validateNonInteractiveClickableElements } from './rules/nonInteractiveClickableRules';
import { validateFocusVisualRemoval } from './rules/focusRules';
import { validateHtmlFocusVisible } from './rules/focusHtmlRules';
import { validatePageLanguage } from './rules/languageRules';
import { validateDuplicateIds } from './rules/duplicateIdsRules';
import { RuleError } from './rules/types';

let timeout: NodeJS.Timeout | undefined = undefined;
let diagnosticsCollection: vscode.DiagnosticCollection | undefined = undefined;

/**
 * Inicializa a extensao, registra a collection de diagnosticos e configura
 * os eventos para validar documentos HTML/CSS em tempo real.
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('A11y Assistant Funcionando.');
	diagnosticsCollection = vscode.languages.createDiagnosticCollection('a11y-vsc-assistant');
	context.subscriptions.push(diagnosticsCollection);

	if (vscode.window.activeTextEditor) {
		const doc = vscode.window.activeTextEditor.document;
		if (isFileExtensionValid(doc)) {
			processValidation(doc);
		} else {
			clearDiagnostics(doc);
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
		} else {
			clearDiagnostics(document);
		}
	});

	const activeEditorChangeEvent = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (!editor) {
			return;
		}

		const document = editor.document;
		if (isFileExtensionValid(document)) {
			processValidation(document);
		} else {
			clearDiagnostics(document);
		}
	});

	context.subscriptions.push(documentChangeEvent);
	context.subscriptions.push(activeEditorChangeEvent);
}

/**
 * Libera recursos ao desativar a extensao.
 */
export function deactivate() {
	if (timeout) {
		clearTimeout(timeout);
	}

	diagnosticsCollection?.clear();
	diagnosticsCollection = undefined;
}

/**
 * Executa as regras de acessibilidade conforme a linguagem do documento,
 * publica os diagnosticos no editor e registra os erros no console.
 */
function processValidation(document: vscode.TextDocument): void {
	const text = document.getText();
	const language = document.languageId;

	let errors: RuleError[] = [];

	if (language === 'html') {
		errors.push(...validateImagesWithoutAlt(text));
		errors.push(...validateHeadersOrder(text));
		errors.push(...validateZoomCapability(text));
		errors.push(...validateNonInteractiveClickableElements(text));
		errors.push(...validateHtmlFocusVisible(text));
		errors.push(...validatePageLanguage(text));
		errors.push(...validateDuplicateIds(text));
	}

	if (language === 'css') {
		errors.push(...validateJustifiedCss(text));
		errors.push(...validateFocusVisualRemoval(text));
	}

	const diagnostics = mapRuleErrorsToDiagnostics(document, errors);
	diagnosticsCollection?.set(document.uri, diagnostics);

	errors.forEach(error => {
		const startPosition = document.positionAt(error.index);
		console.log(`[Linha ${startPosition.line + 1}] ${error.message}`);
	});
}

/**
 * Converte os erros de regra internos para Diagnostic do VS Code,
 * calculando range com base no indice e no tamanho da tag capturada.
 */
function mapRuleErrorsToDiagnostics(document: vscode.TextDocument, errors: RuleError[]): vscode.Diagnostic[] {
	const textLength = document.getText().length;

	return errors.map(error => {
		const startOffset = Math.max(0, Math.min(error.index, textLength));
		const rawTagLength = error.tag?.length ?? 0;
		let endOffset = Math.max(startOffset, Math.min(startOffset + Math.max(rawTagLength, 1), textLength));

		if (endOffset === startOffset && startOffset < textLength) {
			endOffset = startOffset + 1;
		}

		const range = new vscode.Range(
			document.positionAt(startOffset),
			document.positionAt(endOffset)
		);

		const diagnostic = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Warning);
		diagnostic.source = 'A11y Assistant';
		return diagnostic;
	});
}

/**
 * Verifica se o documento e de uma linguagem suportada pelo motor de regras.
 */
function isFileExtensionValid(document: vscode.TextDocument): boolean {
	return document.languageId === 'html' || document.languageId === 'css';
}

/**
 * Remove diagnosticos previamente publicados para um documento.
 */
function clearDiagnostics(document: vscode.TextDocument): void {
	diagnosticsCollection?.delete(document.uri);
}