const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const executable = path.resolve(process.argv[2] || path.join(__dirname, '..', 'lexer', 'lexer.exe'));
const expected = {
  prueba_valida: { count: 39, errors: 0 },
  prueba_operadores: { count: 23, errors: 0 },
  prueba_comentario: { count: 10, errors: 0 },
  prueba_error: { count: 13, errors: 3 },
};
for (const [name, spec] of Object.entries(expected)) {
  const input = fs.readFileSync(path.join(__dirname, `${name}.minilex`), 'utf8');
  // Archivos temporales como stdin/stdout: tambien permite probar sin tuberias de Node.
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'minilex-test-'));
  const descriptors = [];
  let result;
  try {
    fs.writeFileSync(path.join(temp, 'input'), input);
    descriptors.push(fs.openSync(path.join(temp, 'input'), 'r'));
    descriptors.push(fs.openSync(path.join(temp, 'output'), 'w'));
    descriptors.push(fs.openSync(path.join(temp, 'error'), 'w'));
    result = spawnSync(executable, [], { stdio: descriptors, windowsHide: true, timeout: 10000 });
    descriptors.forEach(fd => fs.closeSync(fd));
    descriptors.length = 0;
    result.stdout = fs.readFileSync(path.join(temp, 'output'), 'utf8');
    result.stderr = fs.readFileSync(path.join(temp, 'error'), 'utf8');
  } finally {
    descriptors.forEach(fd => fs.closeSync(fd));
    for (const name of ['input', 'output', 'error']) {
      const file = path.join(temp, name);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    fs.rmdirSync(temp);
  }
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  const rows = result.stdout.trim().split(/\r?\n/).filter(Boolean).map(line => line.split('\t'));
  assert.equal(rows.length, spec.count, `${name}: cantidad de tokens`);
  assert.equal(rows.filter(row => row[0] === 'ERROR').length, spec.errors, name);
  assert.ok(rows.every(row => row.length === 3 && Number(row[2]) > 0));
  if (name === 'prueba_operadores') {
    assert.deepEqual(rows.map(row => row[0]), ['ASIGNACION','IGUALDAD','DIFERENTE','MAYOR_QUE','MENOR_QUE','MAYOR_IGUAL','MENOR_IGUAL','AND','OR','NOT','SUMA','RESTA','MULTIPLICACION','DIVISION','MODULO','PARENTESIS_IZQUIERDO','PARENTESIS_DERECHO','LLAVE_IZQUIERDA','LLAVE_DERECHA','CORCHETE_IZQUIERDO','CORCHETE_DERECHO','PUNTO_COMA','COMA']);
  }
  if (name === 'prueba_comentario') assert.deepEqual(rows.map(row => Number(row[2])), [2,2,2,2,2,5,5,5,5,5]);
  if (name === 'prueba_error') assert.deepEqual(rows.filter(row => row[0] === 'ERROR'), [['ERROR','@','2'],['ERROR','#','2'],['ERROR','$','2']]);
  console.log(`${name}: ${rows.length} tokens, ${spec.errors} errores; OK`);
}

