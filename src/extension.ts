import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
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
import { getWcagReference } from './rules/wcagReferences';
import { A11yErrorTreeItem, A11yErrorsTreeDataProvider, A11yTreeItem } from './errorSummaryProvider';
import { buildSafeReportFileName, formatA11yReport } from './exportReport';

let timeout: NodeJS.Timeout | undefined = undefined;
let diagnosticsCollection: vscode.DiagnosticCollection | undefined = undefined;
let errorSummaryProvider: A11yErrorsTreeDataProvider | undefined = undefined;
let errorSummaryTreeView: vscode.TreeView<A11yTreeItem> | undefined = undefined;

/**
 * Inicializa a extensao, registra a collection de diagnosticos e configura
 * os eventos para validar documentos HTML/CSS em tempo real.
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('A11y Assistant Funcionando.');
	diagnosticsCollection = vscode.languages.createDiagnosticCollection('a11y-vsc-assistant');
	errorSummaryProvider = new A11yErrorsTreeDataProvider(context.extensionUri);
	context.subscriptions.push(diagnosticsCollection);

	errorSummaryTreeView = vscode.window.createTreeView('a11yErrorSummary', {
		treeDataProvider: errorSummaryProvider,
		showCollapseAll: false,
	});

	const revealErrorCommand = vscode.commands.registerCommand(
		'a11y-vsc-assistant.revealErrorFromPanel',
		async (item: A11yErrorTreeItem) => {
			const document = await vscode.workspace.openTextDocument(item.uri);
			const editor = await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
			editor.selection = new vscode.Selection(item.range.start, item.range.start);
			editor.revealRange(item.range, vscode.TextEditorRevealType.InCenter);
		}
	);

	const exportReportCommand = vscode.commands.registerCommand(
		'a11y-vsc-assistant.exportAccessibilityReport',
		async () => {
			await exportAccessibilityReport();
		}
	);

	context.subscriptions.push(errorSummaryTreeView);
	context.subscriptions.push(revealErrorCommand);
	context.subscriptions.push(exportReportCommand);

	if (vscode.window.activeTextEditor) {
		const doc = vscode.window.activeTextEditor.document;
		if (isFileExtensionValid(doc)) {
			processValidation(doc);
		} else {
			clearDiagnostics(doc);
			errorSummaryProvider?.clear();
		}
	}

	updateErrorSummaryBadge();

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
			errorSummaryProvider?.clear();
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
			errorSummaryProvider?.clear();
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
	errorSummaryProvider = undefined;
	errorSummaryTreeView = undefined;
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
	errorSummaryProvider?.setErrors(document, errors);
	updateErrorSummaryBadge();

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
		const rawTagLength = error.tagLength ?? error.tag?.length ?? 0;
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

		if (error.wcagReferenceKey) {
			const reference = getWcagReference(error.wcagReferenceKey);
			diagnostic.code = {
				value: `WCAG ${reference.criterion} - ${reference.title}`,
				target: vscode.Uri.parse(reference.url),
			};
		}

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
	errorSummaryProvider?.clear();
	updateErrorSummaryBadge();
}

/**
 * Atualiza a apresentacao do painel de resumo com base no total atual de erros,
 * sincronizando descricao, badge numerico e mensagem de estado vazio.
 */
function updateErrorSummaryBadge(): void {
	if (!errorSummaryTreeView || !errorSummaryProvider) {
		return;
	}

	const totalErrors = errorSummaryProvider.getTotalErrors();
	errorSummaryTreeView.description = `Total: ${totalErrors}`;

	if (totalErrors <= 0) {
		errorSummaryTreeView.badge = undefined;
		errorSummaryTreeView.message = 'Sem erros de acessibilidade no arquivo ativo.';
		return;
	}

	errorSummaryTreeView.badge = {
		value: totalErrors,
		tooltip: `${totalErrors} erro(s) de acessibilidade no arquivo ativo`,
	};
	errorSummaryTreeView.message = undefined;
}

/**
 * Exporta os erros de acessibilidade do arquivo ativo para um arquivo JSON em Downloads.
 */
async function exportAccessibilityReport(): Promise<void> {
	if (!errorSummaryProvider) {
		vscode.window.showErrorMessage('Resumo de erros indisponivel para exportacao.');
		return;
	}

	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		vscode.window.showWarningMessage('Nenhum arquivo ativo para exportar o relatorio de acessibilidade.');
		return;
	}

	const document = activeEditor.document;
	if (!isFileExtensionValid(document)) {
		vscode.window.showWarningMessage('A exportacao esta disponivel apenas para arquivos HTML e CSS.');
		return;
	}

	processValidation(document);

	const exportEntries = errorSummaryProvider.getExportEntries();
	const reportText = formatA11yReport({
		generatedAt: new Date().toISOString(),
		sourceFile: vscode.workspace.asRelativePath(document.uri, false),
		totalErrors: exportEntries.length,
		errors: exportEntries,
	});

	const downloadsDir = path.join(os.homedir(), 'Downloads');
	const downloadsDirUri = vscode.Uri.file(downloadsDir);
	await vscode.workspace.fs.createDirectory(downloadsDirUri);

	const reportFileName = buildSafeReportFileName(path.basename(document.fileName));
	const reportFileUri = vscode.Uri.joinPath(downloadsDirUri, reportFileName);

	await vscode.workspace.fs.writeFile(reportFileUri, new TextEncoder().encode(reportText));

	const openLabel = 'Abrir relatorio';
	const selectedAction = await vscode.window.showInformationMessage(
		`Relatorio exportado em Downloads: ${reportFileName}`,
		openLabel
	);

	if (selectedAction === openLabel) {
		const reportDocument = await vscode.workspace.openTextDocument(reportFileUri);
		await vscode.window.showTextDocument(reportDocument, { preview: false });
	}
}