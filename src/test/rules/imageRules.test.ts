import * as assert from 'assert';
import { validateImagesWithoutAlt } from '../../rules/imageRules';
import { TestCase } from './testTypes';

function runImageTests() {
    console.log("Iniciando Testes Unitarios: Regras de Acessibilidade de Imagem...");

    const testCases: TestCase<number>[] = [
        { name: "Atributo alt ausente", category: 'Violacao', html: '<img src="teste.png">', expected: 1 },
        { name: "Atributo alt vazio", category: 'Violacao', html: '<img src="teste.png" alt="">', expected: 1 },
        { name: "Alt valido", category: 'Conforme', html: '<img src="teste.png" alt="Descricao">', expected: 0 },
        { name: "Alt preenchido em ordem diferente", category: 'Conforme', html: '<img alt="Descrição valida" src="teste.png"', expected: 0 },
        { name: "Duas imagens sem alt", category: 'Violacao', html: '<img src="img1.png"><img src="img2.png">', expected: 2 },
        { name: "Duas imagens com alt vazio", category: 'Violacao', html: '<img src="img1.png" alt=""><img src="img2.png" alt="">', expected: 2 },
        { name: "Multiplas imagens sem alt", category: 'Violacao', html: '<img src="img1.png"><img src="img2.png" alt=""><img src="img3.png">', expected: 3 },
        { name: "Mix de imagens validas e invalidas", category: 'Violacao', html: '<img src="img1.png" alt="Ok"><img src="img2.png"><img src="img3.png" alt="Ok"><img src="img4.png" alt="">', expected: 2 },
        { name: "Sem imagens", category: 'Inaplicavel', html: '<p>Apenas paragrafo</p>', expected: 0 }
    ];

    let passedCount = 0;

    testCases.forEach(testCase => {
        const results = validateImagesWithoutAlt(testCase.html);
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

runImageTests();