import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { createA11yReportHtml } from './reportHtml';

export type A11yErrorExportItem = {
  category: string;
  summary: string;
  details: string;
  line: number;
  column: number;
  codeSnippet: string;
  wcagReferenceKey?: import('../rules/core/wcagReferences').WcagReferenceKey;
};

export type A11yReportPayload = {
  generatedAt: string;
  sourceFile: string;
  totalErrors: number;
  errors: A11yErrorExportItem[];
};

/**
 * Gera o conteudo do relatorio em HTML para exportacao.
 */
export function formatA11yReport(payload: A11yReportPayload): string {
  return createA11yReportHtml(payload);
}

/**
 * Normaliza nomes para um nome de arquivo seguro no sistema operacional.
 */
export function buildSafeReportFileName(baseName: string, date = new Date(), extension = 'json'): string {
  const timestamp = date
    .toISOString()
    .replace(/[:]/g, '-')
    .replace(/\.\d{3}Z$/, 'Z');
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeExtension = extension.replace(/^\./, '') || 'json';

  return `a11y-report-${safeBaseName}-${timestamp}.${safeExtension}`;
}

/**
 * Escreve o relatorio HTML gerado no diretorio Downloads do usuario.
 */
export async function writeReportForDocument(document: vscode.TextDocument, exportEntries: A11yErrorExportItem[]): Promise<void> {
  const reportText = formatA11yReport({
    generatedAt: new Date().toISOString(),
    sourceFile: vscode.workspace.asRelativePath(document.uri, false),
    totalErrors: exportEntries.length,
    errors: exportEntries,
  });

  const downloadsDir = path.join(os.homedir(), 'Downloads');
  const downloadsDirUri = vscode.Uri.file(downloadsDir);
  await vscode.workspace.fs.createDirectory(downloadsDirUri);

  const reportFileName = buildSafeReportFileName(path.basename(document.fileName), new Date(), 'html');
  const reportFileUri = vscode.Uri.joinPath(downloadsDirUri, reportFileName);

  await vscode.workspace.fs.writeFile(reportFileUri, new TextEncoder().encode(reportText));
}