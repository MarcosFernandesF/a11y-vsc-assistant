export type A11yErrorExportItem = {
  category: string;
  summary: string;
  details: string;
  line: number;
  column: number;
};

export type A11yReportPayload = {
  generatedAt: string;
  sourceFile: string;
  totalErrors: number;
  errors: A11yErrorExportItem[];
};

/**
 * Gera o conteudo textual do relatorio em JSON para exportacao.
 */
export function formatA11yReport(payload: A11yReportPayload): string {
  return JSON.stringify(payload, null, 2);
}

/**
 * Normaliza nomes para um nome de arquivo seguro no sistema operacional.
 */
export function buildSafeReportFileName(baseName: string, date = new Date()): string {
  const timestamp = date
    .toISOString()
    .replace(/[:]/g, '-')
    .replace(/\.\d{3}Z$/, 'Z');
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `a11y-report-${safeBaseName}-${timestamp}.json`;
}
