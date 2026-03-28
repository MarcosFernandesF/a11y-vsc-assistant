import * as assert from 'assert';
import { validatePageLanguage } from '../../rules/languageRules';
import { TestCase } from './testTypes';

function runLanguageRuleTests() {
  console.log('Iniciando Testes Unitarios: Regra de Idioma da Pagina Ausente...');

  const testCases: TestCase<number>[] = [
    {
      name: 'html com lang pt-BR',
      category: 'Conforme',
      html: '<!doctype html><html lang="pt-BR"><head></head><body></body></html>',
      expected: 0,
    },
    {
      name: 'html com lang en',
      category: 'Conforme',
      html: '<html lang="en"><body>Hello</body></html>',
      expected: 0,
    },
    {
      name: 'html em maiusculas com lang definido',
      category: 'Conforme',
      html: '<HTML lang="FR"><body>Bonjour</body></HTML>',
      expected: 0,
    },
    {
      name: 'html sem lang',
      category: 'Violacao',
      html: '<html><head></head><body></body></html>',
      expected: 1,
    },
    {
      name: 'html com lang vazio',
      category: 'Violacao',
      html: '<html lang=""><body></body></html>',
      expected: 1,
    },
    {
      name: 'html com lang contendo um espaco',
      category: 'Violacao',
      html: '<html lang=" "><body></body></html>',
      expected: 1,
    },
    {
      name: 'html com lang contendo apenas whitespace ASCII',
      category: 'Violacao',
      html: '<html lang=" \t\n\r "><body></body></html>',
      expected: 1,
    },
    {
      name: 'html com apenas xml:lang sem lang',
      category: 'Violacao',
      html: '<html xml:lang="en"><body></body></html>',
      expected: 1,
    },
    {
      name: 'conteudo sem tag html',
      category: 'Inaplicavel',
      html: '<div>Fragmento</div>',
      expected: 0,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validatePageLanguage(testCase.html);
    const observed = results.length;

    try {
      assert.strictEqual(observed, testCase.expected);
      console.log(
        `OK | Categoria: ${testCase.category} | Caso: ${testCase.name} | esperado=${testCase.expected} encontrado=${observed}`
      );
      passedCount++;
    } catch (err) {
      console.error(
        `ERRO | Categoria: ${testCase.category} | Caso: ${testCase.name} | esperado=${testCase.expected} encontrado=${observed}`
      );
    }
  });

  console.log(`\nResultado Final: ${passedCount}/${testCases.length} testes passaram.\n`);

  if (passedCount !== testCases.length) {
    process.exit(1);
  }
}

runLanguageRuleTests();
