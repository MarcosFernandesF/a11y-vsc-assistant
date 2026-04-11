import * as assert from 'assert';
import { validateFocusVisualRemoval } from '../../rules/focusRules';
import { TestCase } from './testTypes';

function runFocusRuleTests() {
  console.log('Iniciando Testes Unitarios: Regra de Remocao de Foco Visual...');

  const testCases: TestCase<number>[] = [
    {
      name: 'outline none sem alternativa em focus',
      category: 'Violacao',
      html: 'button:focus { outline: none; }',
      expected: 1,
    },
    {
      name: 'outline 0 sem alternativa em focus-visible',
      category: 'Violacao',
      html: '.btn:focus-visible { outline: 0; }',
      expected: 1,
    },
    {
      name: 'outline none com box-shadow alternativo',
      category: 'Conforme',
      html: 'button:focus { outline: none; box-shadow: 0 0 0 3px #005fcc; }',
      expected: 0,
    },
    {
      name: 'outline 0 com border alternativo',
      category: 'Conforme',
      html: '.link:focus { outline: 0; border: 2px solid #111; }',
      expected: 0,
    },
    {
      name: 'outline positivo sem remocao',
      category: 'Conforme',
      html: '.field:focus { outline: 2px solid #000; }',
      expected: 0,
    },
    {
      name: 'sem declaracao de outline',
      category: 'Inaplicavel',
      html: '.box { color: red; }',
      expected: 0,
    },
    {
      name: 'outline none em comentario nao deve contar',
      category: 'Inaplicavel',
      html: '/* .x:focus { outline: none; } */ .x { color: #333; }',
      expected: 0,
    },
    {
      name: 'duas remocoes sem alternativa',
      category: 'Violacao',
      html: '.a:focus { outline: none; } .b:focus { outline: 0; }',
      expected: 2,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateFocusVisualRemoval(testCase.html);
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

runFocusRuleTests();
