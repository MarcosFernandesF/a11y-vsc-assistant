import * as assert from 'assert';
import { validateDuplicateIds } from '../../rules/duplicateIdsRules';
import { TestCase } from './testTypes';

function runDuplicateIdsRuleTests() {
  console.log('Iniciando Testes Unitarios: Regra de IDs Duplicados (HTML)...');

  const testCases: TestCase<number>[] = [
    {
      name: 'ids unicos no documento',
      category: 'Conforme',
      html: '<div id="header"></div><main id="content"></main><footer id="footer"></footer>',
      expected: 0,
    },
    {
      name: 'um id duplicado (segunda ocorrencia)',
      category: 'Violacao',
      html: '<div id="menu"></div><nav id="menu"></nav>',
      expected: 1,
    },
    {
      name: 'id repetido tres vezes (duas ocorrencias invalidas)',
      category: 'Violacao',
      html: '<section id="item"></section><article id="item"></article><aside id="item"></aside>',
      expected: 2,
    },
    {
      name: 'elementos sem id',
      category: 'Inaplicavel',
      html: '<div></div><p>Texto</p>',
      expected: 0,
    },
    {
      name: 'id vazio nao conta como duplicidade',
      category: 'Inaplicavel',
      html: '<div id=""></div><span id=""></span>',
      expected: 0,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateDuplicateIds(testCase.html);
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

runDuplicateIdsRuleTests();
