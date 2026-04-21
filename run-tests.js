const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const testsDir = path.join(__dirname, 'out', 'test', 'rules');

// Encontra todos os arquivos *.test.js
const testFiles = fs.readdirSync(testsDir)
  .filter(file => file.endsWith('.test.js'))
  .sort((left, right) => left.localeCompare(right, 'pt-BR'))
  .map(file => path.join(testsDir, file));

if (testFiles.length === 0) {
  console.error('Nenhum arquivo de teste encontrado em', testsDir);
  process.exit(1);
}

console.log(`Rodando ${testFiles.length} teste(s)...\n`);

let completedTests = 0;
let failedTests = 0;

async function runTestsSequentially() {
  for (const testFile of testFiles) {
    const testName = path.basename(testFile);

    const code = await new Promise((resolve) => {
      const child = spawn('node', [testFile], { stdio: 'inherit' });

      child.on('close', (exitCode) => {
        resolve(exitCode ?? 1);
      });

      child.on('error', (err) => {
        console.error(`Erro ao rodar ${testName}:`, err);
        resolve(1);
      });
    });

    completedTests++;

    if (code !== 0) {
      failedTests++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testes completados: ${completedTests}/${testFiles.length}`);

  if (failedTests > 0) {
    console.log(`${failedTests} teste(s) falharam`);
    process.exit(1);
  } else {
    console.log(`Todos os testes passaram`);
    process.exit(0);
  }
}

void runTestsSequentially();
