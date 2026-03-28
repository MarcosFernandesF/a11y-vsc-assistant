import * as assert from 'assert';
import { validateHtmlFocusVisible } from '../../rules/focusHtmlRules';
import { TestCase } from '../../rules/types';

type FocusHtmlTestCase = TestCase<number> & {
  category: 'Conforme' | 'Violacao' | 'Inaplicavel';
};

function runFocusHtmlRuleTests() {
  console.log('Iniciando Testes Unitarios: Regra de Foco Visivel em HTML...');

  const testCases: FocusHtmlTestCase[] = [
    {
      name: 'link com href sem remocao de foco inline',
      category: 'Conforme',
      html: '<a href="/home">Home</a>',
      expected: 0,
    },
    {
      name: 'span com tabindex=0 sem remocao de foco inline',
      category: 'Conforme',
      html: '<span tabindex="0">Item focavel</span>',
      expected: 0,
    },
    {
      name: 'botao focavel com outline none sem alternativa',
      category: 'Violacao',
      html: '<button style="outline: none;">Salvar</button>',
      expected: 1,
    },
    {
      name: 'link focavel com outline 0 sem alternativa',
      category: 'Violacao',
      html: '<a href="/x" style="outline:0;">Link</a>',
      expected: 1,
    },
    {
      name: 'outline none com box-shadow alternativo',
      category: 'Conforme',
      html: '<button style="outline:none; box-shadow: 0 0 0 3px #005fcc;">Salvar</button>',
      expected: 0,
    },
    {
      name: 'inaplicavel sem elementos focaveis',
      category: 'Inaplicavel',
      html: '<span>Apenas texto</span>',
      expected: 0,
    },
    {
      name: 'inaplicavel com tabindex -1 fora da ordem sequencial',
      category: 'Inaplicavel',
      html: '<a href="/x" tabindex="-1" style="outline:none;">Link fora da ordem</a>',
      expected: 0,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateHtmlFocusVisible(testCase.html);
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

runFocusHtmlRuleTests();
