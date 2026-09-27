console.log("RENDERER.JS CARGADO CORRECTAMENTE");
const codeEditor = document.getElementById('codeEditor');
const clearBtn = document.getElementById('clearBtn');
const openBtn = document.getElementById('openBtn');
const analyzeBtn = document.getElementById('analyzeBtn');

const lineCount = document.getElementById('lineCount');
const tokenCount = document.getElementById('tokenCount');
const errorCount = document.getElementById('errorCount');

const consoleOutput = document.getElementById('consoleOutput');


// ==========================================
// CONTADOR DE LÍNEAS
// ==========================================

function updateLineCount() {
    const code = codeEditor.value;

    if (code.length === 0) {
        lineCount.textContent = '0';
        return;
    }

    const lines = code.split('\n').length;

    lineCount.textContent = lines;
}


// Actualizar automáticamente mientras escribe
codeEditor.addEventListener('input', updateLineCount);


// Contar las líneas iniciales
updateLineCount();


// ==========================================
// BOTÓN LIMPIAR
// ==========================================

clearBtn.addEventListener('click', () => {

    codeEditor.value = '';

    tokenCount.textContent = '0';
    errorCount.textContent = '0';
    lineCount.textContent = '0';

    consoleOutput.textContent =
        'Editor limpiado. MiniLex listo para analizar código.';

});


// ==========================================
// ABRIR ARCHIVO
// ==========================================

openBtn.addEventListener('click', () => {

    const input = document.createElement('input');

    input.type = 'file';

    input.accept =
        '.txt,.ml,.minilex,.c,.cpp,.java,.js';

    input.addEventListener('change', () => {

        const file = input.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            codeEditor.value = reader.result;

            updateLineCount();

            consoleOutput.textContent =
                `Archivo "${file.name}" cargado correctamente.`;

        };

        reader.readAsText(file);

    });

    input.click();

});


// ==========================================
// ANALIZAR
// ==========================================

analyzeBtn.addEventListener('click', async () => {

    const code = codeEditor.value;

    if (code.trim() === '') {

        consoleOutput.textContent =
            'No hay código para analizar.';

        return;
    }


    consoleOutput.textContent =
        'Analizando código con FLEX...';


    try {

        const resultado =
            await window.miniLex.analizar(code);


        const lineasResultado =
            resultado
                .trim()
                .split('\n')
                .filter(linea => linea.trim() !== '');


        const tokens = [];

        lineasResultado.forEach(linea => {

            const partes = linea
                .replace(/\r/g, '')
                .split('\t');

            if (partes.length >= 3) {

                tokens.push({
                    tipo: partes[0],
                    lexema: partes[1],
                    linea: partes[2]
                });

            }

        });


        mostrarTokens(tokens);

    }
    catch (error) {

        consoleOutput.textContent =
            `Error al ejecutar FLEX: ${error}`;

    }

});

function mostrarTokens(tokens) {

    const tokenTable =
        document.getElementById('tokenTable');


    tokenTable.innerHTML = '';


    let errores = 0;


    tokens.forEach(token => {

        if (token.tipo === 'ERROR') {
            errores++;
        }


        const fila =
            document.createElement('tr');


        const tipo =
            document.createElement('td');

        const lexema =
            document.createElement('td');

        const linea =
            document.createElement('td');


        tipo.textContent = token.tipo;
        lexema.textContent = token.lexema;
        linea.textContent = token.linea;


        if (token.tipo === 'ERROR') {

            tipo.style.color = '#f87171';
            lexema.style.color = '#f87171';

        }


        fila.appendChild(tipo);
        fila.appendChild(lexema);
        fila.appendChild(linea);

        tokenTable.appendChild(fila);

    });


    tokenCount.textContent =
        tokens.length;


    errorCount.textContent =
        errores;


    updateLineCount();


    if (errores === 0) {

        consoleOutput.textContent =
            `Análisis completado. ${tokens.length} tokens encontrados. No se detectaron errores léxicos.`;

    }
    else {

        consoleOutput.textContent =
            `Análisis completado. ${tokens.length} tokens encontrados y ${errores} error(es) léxico(s).`;

    }

}