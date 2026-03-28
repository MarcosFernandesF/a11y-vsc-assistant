import * as assert from 'assert';
import { validateJustifiedCss } from '../../rules/justifyRules';
import { TestCase } from '../../rules/types';

function runJustifyRuleTests() {
  console.log('Iniciando Testes Unitarios: Regra de Texto Justificado...');

  const testCases: TestCase<number>[] = [
    {
      name: 'Sem text-align justify',
      html: 'p { text-align: left; }',
      expected: 0,
    },
    {
      name: 'Com text-align justify simples',
      html: '.content { text-align: justify; }',
      expected: 1,
    },
    {
      name: 'Com letras maiusculas e espacos',
      html: '.content { TEXT-ALIGN :   JUSTIFY; }',
      expected: 1,
    },
    {
      name: 'Dois usos de justify',
      html: '.a { text-align: justify; } .b { text-align: justify; }',
      expected: 2,
    },
    {
      name: 'Justify em comentario nao deve contar',
      html: '/* text-align: justify; */ .a { text-align: left; }',
      expected: 0,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateJustifiedCss(testCase.html);
    try {
      assert.strictEqual(results.length, testCase.expected);
      console.log(`PASSOU: ${testCase.name}`);
      passedCount++;
    } catch (err) {
      console.error(`FALHOU: ${testCase.name}`);
    }
  });

  console.log(`\nResultado Final: ${passedCount}/${testCases.length} testes passaram.\n`);

  if (passedCount !== testCases.length) {
    process.exit(1);
  }
}

runJustifyRuleTests();
