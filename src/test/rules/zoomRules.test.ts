import * as assert from 'assert';
import { validateZoomCapability } from '../../rules/zoomRules';
import { TestCase } from './testTypes';

type ZoomTestCase = TestCase<number> & {
  expectedMessageIncludes?: string[];
};

function runZoomTests() {
  console.log('Iniciando Testes Unitarios: Regra de Zoom Bloqueado...');

  const testCases: ZoomTestCase[] = [
    {
      name: 'user-scalable=yes',
      category: 'Conforme',
      html: '<meta name="viewport" content="user-scalable=yes" />',
      expected: 0,
    },
    {
      name: 'maximum-scale=2.0',
      category: 'Conforme',
      html: '<meta name="viewport" content="maximum-scale=2.0" />',
      expected: 0,
    },
    {
      name: 'maximum-scale=-1',
      category: 'Conforme',
      html: '<meta name="viewport" content="maximum-scale=-1" />',
      expected: 0,
    },
    {
      name: 'user-scalable=no',
      category: 'Violacao',
      html: '<meta name="viewport" content="user-scalable=no" />',
      expected: 1,
    },
    {
      name: 'maximum-scale=1.5',
      category: 'Violacao',
      html: '<meta name="viewport" content="user-scalable=yes, initial-scale=0.8, maximum-scale=1.5" />',
      expected: 1,
    },
    {
      name: 'maximum-scale=1.0',
      category: 'Violacao',
      html: '<meta name="viewport" content="maximum-scale=1.0" />',
      expected: 1,
    },
    {
      name: 'maximum-scale=yes',
      category: 'Violacao',
      html: '<meta name="viewport" content="maximum-scale=yes" />',
      expected: 1,
    },
    {
      name: 'user-scalable=no e maximum-scale=1.2',
      category: 'Violacao',
      html: '<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.2" />',
      expected: 2,
      expectedMessageIncludes: ['user-scalable=no', 'maximum-scale=1.2'],
    },
    {
      name: 'sem viewport',
      category: 'Inaplicavel',
      html: '<meta charset="UTF-8" />',
      expected: 0,
    },
    {
      name: 'viewport sem content',
      category: 'Inaplicavel',
      html: '<meta name="viewport" />',
      expected: 0,
    },
    {
      name: 'viewport sem maximum-scale/user-scalable',
      category: 'Inaplicavel',
      html: '<meta name="viewport" content="width=device-width" />',
      expected: 0,
    },
    {
      name: 'viewport com content vazio',
      category: 'Inaplicavel',
      html: '<meta name="viewport" content="" />',
      expected: 0,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateZoomCapability(testCase.html);
    const observed = results.length;

    try {
      assert.strictEqual(observed, testCase.expected);

      if (testCase.expectedMessageIncludes) {
        const allMessages = results.map(result => result.message).join(' || ');
        testCase.expectedMessageIncludes.forEach(expectedText => {
          assert.ok(allMessages.includes(expectedText));
        });
      }

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

runZoomTests();
