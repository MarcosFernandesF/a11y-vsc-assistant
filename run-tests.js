const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const testsDir = path.join(__dirname, 'out', 'test', 'rules');

// Encontra todos os arquivos *.test.js
const testFiles = fs.readdirSync(testsDir)
  .filter(file => file.endsWith('.test.js'))
  .map(file => path.join(testsDir, file));

if (testFiles.length === 0) {
  console.error('Nenhum arquivo de teste encontrado em', testsDir);
  process.exit(1);
}

console.log(`Rodando ${testFiles.length} teste(s)...\n`);

let completedTests = 0;
let failedTests = 0;

const promises = testFiles.map(testFile => {
  return new Promise((resolve) => {
    const testName = path.basename(testFile);
    const child = spawn('node', [testFile], { stdio: 'inherit' });

    child.on('close', (code) => {
      completedTests++;
      if (code !== 0) {
        failedTests++;
      }
      resolve(code);
    });

    child.on('error', (err) => {
      console.error(`Erro ao rodar ${testName}:`, err);
      completedTests++;
      failedTests++;
      resolve(1);
    });
  });
});

Promise.all(promises).then((results) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testes completados: ${completedTests}/${testFiles.length}`);
  
  if (failedTests > 0) {
    console.log(`${failedTests} teste(s) falharam`);
    process.exit(1);
  } else {
    console.log(`Todos os testes passaram`);
    process.exit(0);
  }
});
