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

  const testCases = [
    {
      name: 'gera HTML base valido',
      expected: '<!DOCTYPE html>',
      observed: reportText.startsWith('<!DOCTYPE html>') ? '<!DOCTYPE html>' : 'saida invalida',
    },
    {
      name: 'inclui lingua pt-BR',
      expected: '<html lang="pt-BR">',
      observed: reportText.includes('<html lang="pt-BR">') ? '<html lang="pt-BR">' : 'ausente',
    },
    {
      name: 'inclui titulo do relatorio',
      expected: 'Relatorio de acessibilidade',
      observed: reportText.includes('Relatorio de acessibilidade') ? 'Relatorio de acessibilidade' : 'ausente',
    },
    {
      name: 'inclui secao de problemas',
      expected: 'Problemas encontrados',
      observed: reportText.includes('Problemas encontrados') ? 'Problemas encontrados' : 'ausente',
    },
    {
      name: 'inclui erro de id duplicado',
      expected: 'ID duplicado detectado',
      observed: reportText.includes('ID duplicado detectado') ? 'ID duplicado detectado' : 'ausente',
    },
    {
      name: 'inclui erro de imagem sem alt',
      expected: 'Imagem sem texto alternativo',
      observed: reportText.includes('Imagem sem texto alternativo') ? 'Imagem sem texto alternativo' : 'ausente',
    },
    {
      name: 'inclui local do primeiro erro',
      expected: 'Linha 4, coluna 5',
      observed: reportText.includes('Linha 4, coluna 5') ? 'Linha 4, coluna 5' : 'ausente',
    },
    {
      name: 'inclui arquivo de origem',
      expected: 'examples/duplicate-ids-test.html',
      observed: reportText.includes('examples/duplicate-ids-test.html') ? 'examples/duplicate-ids-test.html' : 'ausente',
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    try {
      assert.strictEqual(testCase.observed, testCase.expected);
      console.log(`OK | Caso: ${testCase.name} | esperado=${testCase.expected} encontrado=${testCase.observed}`);
      passedCount++;
    } catch (err) {
      console.error(`ERRO | Caso: ${testCase.name} | esperado=${testCase.expected} encontrado=${testCase.observed}`);
    }
  });

  const reportFileName = buildSafeReportFileName('duplicate ids test.html', fixedDate, 'html');

  try {
    assert.strictEqual(
      reportFileName,
      'a11y-report-duplicate_ids_test.html-2026-04-14T10-20-30Z.html'
    );
    console.log(
      'OK | Caso: gera nome de arquivo seguro | esperado=a11y-report-duplicate_ids_test.html-2026-04-14T10-20-30Z.html encontrado=' +
      reportFileName
    );
    passedCount++;
  } catch (err) {
    console.error(
      'ERRO | Caso: gera nome de arquivo seguro | esperado=a11y-report-duplicate_ids_test.html-2026-04-14T10-20-30Z.html encontrado=' +
      reportFileName
    );
  }

  console.log(`\nResultado Final: ${passedCount}/${testCases.length + 1} testes passaram.\n`);
}

runExportReportTests();
