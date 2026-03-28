import * as assert from 'assert';
import { validateHeadersOrder } from '../../rules/headersRules';
import { TestCase } from '../../rules/types';

type HeadersTestCase = TestCase<number> & {
  category: 'Conforme' | 'Violacao' | 'Inaplicavel';
};

function runHeadersTests() {
  console.log('Iniciando Testes Unitarios: Regras de Hierarquia de Cabecalhos...');

  const testCases: HeadersTestCase[] = [
    { name: 'Apenas um cabecalho h1', category: 'Conforme', html: '<h1>Titulo</h1>', expected: 0 },
    { name: 'Apenas um cabecalho h4', category: 'Conforme', html: '<h4>Secao isolada</h4>', expected: 0 },
    { name: 'Apenas um cabecalho h6', category: 'Conforme', html: '<h6>Rodape isolado</h6>', expected: 0 },
    { name: 'Dois cabecalhos em ordem trocada (h2 -> h1)', category: 'Violacao', html: '<h2>Subtitulo</h2><h1>Titulo</h1>', expected: 1 },
    { name: 'Pulo de hierarquia (h1 -> h3)', category: 'Violacao', html: '<h1>Titulo</h1><h3>Subsecao</h3>', expected: 1 },
    { name: 'Ordem crescente valida (h1 -> h2 -> h3)', category: 'Conforme', html: '<h1>Titulo</h1><h2>Secao</h2><h3>Subsecao</h3>', expected: 0 },
    { name: 'Nivel repetido permitido (h2 -> h2)', category: 'Conforme', html: '<h2>Secao A</h2><h2>Secao B</h2>', expected: 0 },
    { name: 'Multiplos h2 seguidos', category: 'Conforme', html: '<h1>Titulo</h1><h2>Secao 1</h2><h2>Secao 2</h2><h2>Secao 3</h2>', expected: 0 },
    { name: 'Dois h1 nao permitido', category: 'Violacao', html: '<h1>Titulo 1</h1><h1>Titulo 2</h1>', expected: 1 },
    { name: 'Sem cabecalhos', category: 'Inaplicavel', html: '<p>Apenas paragrafo</p>', expected: 0 },
    { name: 'Pulo de hierarquia (h1 -> h3 -> h2)', category: 'Violacao', html: '<h1>Titulo</h1><h3>Subsecao</h3><h2>Detalhe</h2>', expected: 2 },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateHeadersOrder(testCase.html);
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

runHeadersTests();
