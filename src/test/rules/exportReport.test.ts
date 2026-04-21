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
        codeSnippet: '<div id="duplicado"></div>',
      },
      {
        category: 'Erros de Conteudo',
        summary: 'Imagem sem texto alternativo',
        details: 'A imagem deve possuir atributo alt.',
        line: 12,
        column: 3,
        codeSnippet: '<img src="imagem.png">',
      },
    ],
  });

  assert.ok(reportText.startsWith('<!DOCTYPE html>'));
  assert.ok(reportText.includes('<html lang="pt-BR">'));
  assert.ok(reportText.includes('Relatorio de acessibilidade'));
  assert.ok(reportText.includes('Problemas encontrados'));
  assert.ok(reportText.includes('ID duplicado detectado'));
  assert.ok(reportText.includes('Imagem sem texto alternativo'));
  assert.ok(reportText.includes('Linha 4, coluna 5'));
  assert.ok(reportText.includes('examples/duplicate-ids-test.html'));

  const reportFileName = buildSafeReportFileName('duplicate ids test.html', fixedDate, 'html');

  assert.strictEqual(
    reportFileName,
    'a11y-report-duplicate_ids_test.html-2026-04-14T10-20-30Z.html'
  );

  console.log('Resultado Final: 2/2 testes passaram.\n');
}

runExportReportTests();
