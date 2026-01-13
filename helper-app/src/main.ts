import { app, BrowserWindow, Tray, Menu, shell } from 'electron';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const PORT = 8887;
const LOG_FILE = path.join(os.tmpdir(), 'log');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let server: http.Server | null = null;

function logToFile(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    console.log(logEntry.trim());

    // Also send to renderer if window exists
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('log-update', logEntry);
    }
}

function startHttpServer(): void {
    server = http.createServer((req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (req.method === 'POST') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                logToFile(`POST ${req.url}`);
                logToFile(`Body: ${body}`);

                try {
                    const data = JSON.parse(body);

                    if (data.uri) {
                        logToFile(`Opening URI: ${data.uri}`);

                        // Use shell.openExternal to trigger the protocol handler
                        await shell.openExternal(data.uri);

                        logToFile(`Screen pop triggered successfully`);
                        logToFile('---');

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            status: 'success',
                            message: 'Screen pop triggered',
                            timestamp: new Date().toISOString()
                        }));
                    } else {
                        logToFile('No URI provided');
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'error', message: 'No URI provided' }));
                    }
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    logToFile(`Error: ${errorMessage}`);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', message: errorMessage }));
                }
            });
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
        }
    });

    server.listen(PORT, () => {
        logToFile(`HTTP server listening on port ${PORT}`);
        logToFile(`Log file: ${LOG_FILE}`);
    });

    server.on('error', (err) => {
        logToFile(`Server error: ${err.message}`);
    });
}

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('close', (event) => {
        event.preventDefault();
        mainWindow?.hide();
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow?.show();
    });
}

function createTray(): void {
    // Create a simple tray icon (you can replace with actual icon)
    tray = new Tray(path.join(__dirname, 'icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Window',
            click: () => mainWindow?.show()
        },
        {
            label: 'Open Log File',
            click: () => {
                const { shell } = require('electron');
                shell.openPath(LOG_FILE);
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                if (server) server.close();
                app.quit();
                process.exit(0);
            }
        }
    ]);

    tray.setToolTip('Helper App - Port 8887');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow?.show();
    });
}

app.whenReady().then(() => {
    // Clear/create log file on startup
    fs.writeFileSync(LOG_FILE, `=== Helper App Started ===\n`, 'utf8');

    startHttpServer();
    createWindow();

    // Only create tray if icon exists, otherwise skip
    const iconPath = path.join(__dirname, 'icon.png');
    if (fs.existsSync(iconPath)) {
        createTray();
    }
});

app.on('window-all-closed', () => {
    // Don't quit on macOS when all windows are closed
    if (process.platform !== 'darwin') {
        if (server) server.close();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    } else {
        mainWindow?.show();
    }
});

app.on('before-quit', () => {
    if (server) {
        server.close();
        logToFile('Server stopped');
    }
});
