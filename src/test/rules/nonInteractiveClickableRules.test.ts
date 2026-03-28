import * as assert from 'assert';
import { validateNonInteractiveClickableElements } from '../../rules/nonInteractiveClickableRules';
import { TestCase } from './testTypes';

function runNonInteractiveClickableTests() {
  console.log('Iniciando Testes Unitarios: Regra de Elementos Nao Interativos Clicaveis...');

  const testCases: TestCase<number>[] = [
    {
      name: 'div com onclick sem role/tabindex',
      category: 'Violacao',
      html: '<div onclick="abrirModal()">Abrir</div>',
      expected: 1,
    },
    {
      name: 'span com onclick sem role/tabindex',
      category: 'Violacao',
      html: '<span onclick="acao()">Clique</span>',
      expected: 1,
    },
    {
      name: 'p com onclick sem role/tabindex',
      category: 'Violacao',
      html: '<p onclick="acao()">Clique</p>',
      expected: 1,
    },
    {
      name: 'a sem href com onclick sem role/tabindex',
      category: 'Violacao',
      html: '<a onclick="acao()">Link fake</a>',
      expected: 1,
    },
    {
      name: 'div com onclick e role',
      category: 'Conforme',
      html: '<div onclick="abrirModal()" role="button">Abrir</div>',
      expected: 0,
    },
    {
      name: 'div com onclick e tabindex',
      category: 'Conforme',
      html: '<div onclick="abrirModal()" tabindex="0">Abrir</div>',
      expected: 0,
    },
    {
      name: 'botao com onclick',
      category: 'Conforme',
      html: '<button onclick="acao()">Salvar</button>',
      expected: 0,
    },
    {
      name: 'link com href e onclick',
      category: 'Conforme',
      html: '<a href="/home" onclick="acao()">Home</a>',
      expected: 0,
    },
    {
      name: 'sem listener de clique',
      category: 'Inaplicavel',
      html: '<div>Sem clique</div>',
      expected: 0,
    },
    {
      name: 'dois elementos nao interativos com clique',
      category: 'Violacao',
      html: '<div onclick="a()">A</div><span onclick="b()">B</span>',
      expected: 2,
    },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateNonInteractiveClickableElements(testCase.html);
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

runNonInteractiveClickableTests();
