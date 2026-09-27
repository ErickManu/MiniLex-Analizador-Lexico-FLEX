# MiniLex

MiniLex es un analizador léxico gráfico para Windows. Electron envía el código mediante IPC a `lexer.exe`, generado con FLEX, y muestra el tipo de token, su lexema y su línea. También cuenta tokens y errores léxicos. No realiza análisis sintáctico ni semántico.

## Tecnologías

- Electron, Electron Forge y JavaScript para la aplicación de escritorio.
- HTML y CSS para la interfaz.
- FLEX / WinFlexBison para generar el analizador en C.
- GCC / MSYS2 para compilar `lexer.exe`.

## Estructura

```text
src/                  Ventana, interfaz y comunicación IPC
  index.js            Proceso principal; ejecuta FLEX
  preload.js          API de comunicación con la interfaz
  renderer.js         Botones, tabla y contadores
  index.html          Interfaz
  index.css           Estilos
lexer/
  lexer.l             Reglas FLEX
  lex.yy.c            Código C generado
  lexer.exe           Analizador compilado para Windows
pruebas/              Ejemplos y verificación automática
forge.config.js       Configuración de empaquetado
package.json          Dependencias y comandos
out/                  Paquetes generados (ignorado en Git)
```

## Ejecutar en desarrollo

Con Windows, Node.js y npm instalados, abrir PowerShell en la carpeta del proyecto:

```powershell
npm ci
npm start
```

Escribir código o cargar un archivo de `pruebas` con **Abrir archivo** y presionar **Analizar**. El ejecutable FLEX ya está incluido; no se requiere recompilarlo para ejecutar la aplicación.

## Pruebas

```powershell
node pruebas/verificar.cjs
```

El verificador ejecuta el binario real y comprueba cantidades, errores, tipos de operadores y líneas de comentarios. Los archivos también pueden abrirse desde la interfaz:

| Archivo | Tokens (incluidos errores) | Errores esperados |
| --- | ---: | ---: |
| prueba_valida.minilex | 39 | 0 |
| prueba_operadores.minilex | 23 | 0 |
| prueba_comentario.minilex | 10 | 0 |
| prueba_error.minilex | 13 | 3 |

Los comentarios admitidos son de una línea (`//`). La prueba de operadores es una lista de símbolos para análisis léxico; no pretende ser un programa sintácticamente válido. Los caracteres `@`, `#` y `$` producen los tres errores intencionales.

## Empaquetar para Windows

```powershell
npm run make
```

Forge genera la aplicación en `out/minilex-win32-x64/` y el instalador Squirrel en `out/make/squirrel.windows/x64/`. La primera ejecución puede necesitar Internet para descargar Electron y herramientas de empaquetado.

`extraResource` copia `lexer/lexer.exe` a `resources/lexer.exe`, fuera de `app.asar`. En desarrollo, `src/index.js` usa la carpeta `lexer` del proyecto; en la aplicación empaquetada usa `process.resourcesPath`. Las reglas y el C generado se conservan en el proyecto y no se duplican dentro del paquete.

Para comprobar el binario incluido:

```powershell
node pruebas/verificar.cjs out/minilex-win32-x64/resources/lexer.exe
```

Para comprobar la aplicación completa, abrir `out/minilex-win32-x64/minilex.exe` directamente y analizar las cuatro muestras. Debe mostrar los resultados de la tabla anterior sin ejecutar `npm start` ni abrir Visual Studio Code. Para distribuir la versión portable se debe entregar toda la carpeta `minilex-win32-x64`, no solo su `.exe`; también se puede entregar el instalador generado. El usuario final no necesita Node.js, npm, FLEX ni GCC.

## Regenerar FLEX (solo si se modifican sus reglas)

Con WinFlexBison y GCC de MSYS2 disponibles en PATH, desde la raíz del proyecto:

```powershell
win_flex -o lexer/lex.yy.c lexer/lexer.l
gcc lexer/lex.yy.c -o lexer/lexer.exe
node pruebas/verificar.cjs
```

Después de recompilar, volver a ejecutar `npm run make` para incluir el binario actualizado. No borrar `lexer.l`, `lex.yy.c` ni `lexer.exe`.
