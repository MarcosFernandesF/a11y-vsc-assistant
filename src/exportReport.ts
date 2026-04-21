import { createA11yReportHtml } from './reportHtml';

export type A11yErrorExportItem = {
  category: string;
  summary: string;
  details: string;
  line: number;
  column: number;
  codeSnippet: string;
  wcagReferenceKey?: import('./rules/wcagReferences').WcagReferenceKey;
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
