import * as assert from 'assert';
import { validateJustifiedCss } from '../../rules/justifyRules';
import { TestCase } from '../../rules/types';

type JustifyTestCase = TestCase<number> & {
  category: 'Conforme' | 'Violacao' | 'Inaplicavel';
};

function runJustifyRuleTests() {
  console.log('Iniciando Testes Unitarios: Regra de Texto Justificado...');

  const testCases: JustifyTestCase[] = [
    {
      name: 'Sem text-align justify',
      category: 'Conforme',
      html: 'p { text-align: left; }',
      expected: 0,
    },
    {
      name: 'Com text-align justify simples',
      category: 'Violacao',
      html: '.content { text-align: justify; }',
      expected: 1,
    },
    {
      name: 'Com letras maiusculas e espacos',
      category: 'Violacao',
      html: '.content { TEXT-ALIGN :   JUSTIFY; }',
      expected: 1,
    },
    {
      name: 'Dois usos de justify',
      category: 'Violacao',
      html: '.a { text-align: justify; } .b { text-align: justify; }',
      expected: 2,
    },
    {
      name: 'Justify em comentario nao deve contar',
      category: 'Inaplicavel',
      html: '/* text-align: justify; */ .a { text-align: left; }',
      expected: 0,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateJustifiedCss(testCase.html);
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

runJustifyRuleTests();
