import * as vscode from 'vscode';
import { ValidationService } from './services/validationService';
import { writeReportForDocument } from './reporting/exportReport';
import { isSupportedLanguage } from './utils/language';

let validationService: ValidationService | undefined = undefined;

/**
 * Inicializa a extensao, registra a collection de diagnosticos e configura
 * os eventos para validar documentos HTML/CSS em tempo real.
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('A11y Assistant Funcionando.');

	validationService = new ValidationService(context);
	context.subscriptions.push(validationService);
	validationService.start();

	const revealErrorCommand = vscode.commands.registerCommand(
		'a11y-vsc-assistant.revealErrorFromPanel',
		async (item: any) => {
			const document = await vscode.workspace.openTextDocument(item.uri);
			const editor = await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
			editor.selection = new vscode.Selection(item.range.start, item.range.start);
			editor.revealRange(item.range, vscode.TextEditorRevealType.InCenter);
		}
	);

	const exportFileCommand = vscode.commands.registerCommand(
		'a11y-vsc-assistant.exportAccessibilityReportForFile',
		async (itemOrUri: any) => {
			try {
				let uri: vscode.Uri | undefined;
				if (itemOrUri && itemOrUri.uri instanceof vscode.Uri) {
					uri = itemOrUri.uri as vscode.Uri;
				} else if (itemOrUri instanceof vscode.Uri) {
					uri = itemOrUri;
				} else if (vscode.window.activeTextEditor) {
					uri = vscode.window.activeTextEditor.document.uri;
				}

				if (!uri) {
					vscode.window.showWarningMessage('Nenhum arquivo ativo para exportar o relatorio de acessibilidade.');
					return;
				}

				const document = await vscode.workspace.openTextDocument(uri);
				if (!isSupportedLanguage(document.languageId)) {
					vscode.window.showWarningMessage('A exportacao esta disponivel apenas para arquivos HTML e CSS.');
					return;
				}

				validationService!.validateDocument(document);
				const exportEntries = validationService!.errorSummaryProvider.getExportEntries(document);
				await writeReportForDocument(document, exportEntries);
				vscode.window.showInformationMessage(`Relatorio exportado: ${document.fileName.split(/[\\/]/).pop() ?? document.fileName}`);
			} catch (err) {
				console.error('Erro ao exportar relatorio do arquivo', err);
			}
		}
	);

	const exportAllCommand = vscode.commands.registerCommand(
		'a11y-vsc-assistant.exportAllAccessibilityReports',
		async () => {
			const uris = validationService!.errorSummaryProvider.getFileUris();
			if (uris.length === 0) {
				vscode.window.showInformationMessage('Nenhum erro encontrado para exportacao.');
				return;
			}

			for (const uri of uris) {
				try {
					const doc = await vscode.workspace.openTextDocument(uri);
					validationService!.validateDocument(doc);
					const entries = validationService!.errorSummaryProvider.getExportEntries(doc);
					await writeReportForDocument(doc, entries);
				} catch (err) {
					console.error('Erro exportando relatorio para', uri.toString(), err);
				}
			}

			vscode.window.showInformationMessage('Exportacao de relatorios concluida.');
		}
	);

	context.subscriptions.push(revealErrorCommand);
	context.subscriptions.push(exportFileCommand);
	context.subscriptions.push(exportAllCommand);
}

/**
 * Libera recursos ao desativar a extensao.
 */
export function deactivate() {
	validationService?.dispose();
	validationService = undefined;
}