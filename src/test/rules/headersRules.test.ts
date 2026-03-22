import * as assert from 'assert';
import { validateHeadersOrder } from '../../rules/headersRules';
import { TestCase } from '../../rules/types';

function runHeadersTests() {
  console.log('Iniciando Testes Unitarios: Regras de Hierarquia de Cabecalhos...');

  const testCases: TestCase<number>[] = [
    { name: 'Apenas um cabecalho h1', html: '<h1>Titulo</h1>', expected: 0 },
    { name: 'Apenas um cabecalho h4', html: '<h4>Secao isolada</h4>', expected: 0 },
    { name: 'Apenas um cabecalho h6', html: '<h6>Rodape isolado</h6>', expected: 0 },
    { name: 'Dois cabecalhos em ordem trocada (h2 -> h1)', html: '<h2>Subtitulo</h2><h1>Titulo</h1>', expected: 1 },
    { name: 'Pulo de hierarquia (h1 -> h3)', html: '<h1>Titulo</h1><h3>Subsecao</h3>', expected: 1 },
    { name: 'Ordem crescente valida (h1 -> h2 -> h3)', html: '<h1>Titulo</h1><h2>Secao</h2><h3>Subsecao</h3>', expected: 0 },
    { name: 'Nivel repetido permitido (h2 -> h2)', html: '<h2>Secao A</h2><h2>Secao B</h2>', expected: 0 },
    { name: 'Multiplos h2 seguidos', html: '<h1>Titulo</h1><h2>Secao 1</h2><h2>Secao 2</h2><h2>Secao 3</h2>', expected: 0 },
    { name: 'Dois h1 nao permitido', html: '<h1>Titulo 1</h1><h1>Titulo 2</h1>', expected: 1 },
    { name: 'Sem cabecalhos', html: '<p>Apenas paragrafo</p>', expected: 0 },
    { name: 'Pulo de hierarquia (h1 -> h3 -> h2)', html: '<h1>Titulo</h1><h3>Subsecao</h3><h2>Detalhe</h2>', expected: 2 },
  ];

  let passedCount = 0;

  testCases.forEach(testCase => {
    const results = validateHeadersOrder(testCase.html);
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

runHeadersTests();
