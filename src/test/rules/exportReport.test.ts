import * as assert from 'assert';
import { buildSafeReportFileName, formatA11yReport } from '../../exportReport';

function runExportReportTests() {
  console.log('Iniciando Testes Unitarios: Exportacao de Relatorio...');

  const fixedDate = new Date('2026-04-14T10:20:30.456Z');

  const reportText = formatA11yReport({
    generatedAt: fixedDate.toISOString(),
    sourceFile: 'examples/duplicate-ids-test.html',
    totalErrors: 2,
    errors: [
      {
        category: 'Erros de Estrutura',
        summary: 'ID duplicado detectado',
        details: 'Dois elementos compartilham o mesmo ID.',
        line: 4,
        column: 5,
      },
      {
        category: 'Erros de Conteudo',
        summary: 'Imagem sem texto alternativo',
        details: 'A imagem deve possuir atributo alt.',
        line: 12,
        column: 3,
      },
    ],
  });

  const parsed = JSON.parse(reportText) as {
    generatedAt: string;
    sourceFile: string;
    totalErrors: number;
    errors: Array<{ summary: string; line: number; column: number }>;
  };

  assert.strictEqual(parsed.generatedAt, fixedDate.toISOString());
  assert.strictEqual(parsed.sourceFile, 'examples/duplicate-ids-test.html');
  assert.strictEqual(parsed.totalErrors, 2);
  assert.strictEqual(parsed.errors.length, 2);
  assert.strictEqual(parsed.errors[0].summary, 'ID duplicado detectado');
  assert.strictEqual(parsed.errors[0].line, 4);
  assert.strictEqual(parsed.errors[0].column, 5);

  const reportFileName = buildSafeReportFileName('duplicate ids test.html', fixedDate);

  assert.strictEqual(
    reportFileName,
    'a11y-report-duplicate_ids_test.html-2026-04-14T10-20-30Z.json'
  );

  console.log('Resultado Final: 2/2 testes passaram.\n');
}

runExportReportTests();
