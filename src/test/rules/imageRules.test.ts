import * as assert from 'assert';
import { validateImagesWithoutAlt } from '../../rules/imageRules';

interface ImageTestCase {
    name: string;
    html: string;
    expected: number;
}

function runImageTests() {
    console.log("Iniciando Testes Unitarios: Regras de Acessibilidade de Imagem...");

    const testCases: ImageTestCase[] = [
        { name: "Atributo alt ausente", html: '<img src="teste.png">', expected: 1 },
        { name: "Atributo alt vazio", html: '<img src="teste.png" alt="">', expected: 1 },
        { name: "Alt valido", html: '<img src="teste.png" alt="Descricao">', expected: 0 },
        { name: "Alt preenchido em ordem diferente", html: '<img alt="Descrição valida" src="teste.png"', expected: 0 }
    ];

    let passedCount = 0;

    testCases.forEach(testCase => {
        const results = validateImagesWithoutAlt(testCase.html);
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

runImageTests();