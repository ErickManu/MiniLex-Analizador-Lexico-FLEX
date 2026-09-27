const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { spawn } = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    minWidth: 1000,
   minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};


ipcMain.handle('analizar-codigo', async (event, codigo) => {

    return new Promise((resolve, reject) => {

        const lexerPath = app.isPackaged
            ? path.join(process.resourcesPath, 'lexer.exe')
            : path.join(__dirname, '..', 'lexer', 'lexer.exe');

        const lexer = spawn(lexerPath);

        let salida = '';
        let errores = '';

        lexer.stdout.on('data', (data) => {
            salida += data.toString();
        });

        lexer.stderr.on('data', (data) => {
            errores += data.toString();
        });

        lexer.on('error', (error) => {
            reject(error.message);
        });

        lexer.on('close', (code) => {

            if (code !== 0) {
                reject(
                    errores || `El lexer terminó con código ${code}`
                );

                return;
            }

            resolve(salida);
        });

        lexer.stdin.write(codigo);
        lexer.stdin.end();

    });

});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
