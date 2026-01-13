import { app, BrowserWindow, Tray, Menu, shell, ipcMain } from 'electron';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import selfsigned from 'selfsigned';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, update, Database, Unsubscribe } from 'firebase/database';

const HTTP_PORT = 8887;
const HTTPS_PORT = 8888;
const LOG_FILE = path.join(os.tmpdir(), 'helper-app.log');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let httpServer: http.Server | null = null;
let httpsServer: https.Server | null = null;
let firebaseApp: FirebaseApp | null = null;
let firebaseDb: Database | null = null;
let firebaseUnsubscribe: Unsubscribe | null = null;

// Preferences interface
interface Preferences {
    username: string;
    firebaseConfig: {
        apiKey: string;
        authDomain: string;
        databaseURL: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
    };
}

function getPreferencesPath(): string {
    return path.join(app.getPath('userData'), 'preferences.json');
}

function loadPreferences(): Preferences | null {
    const prefsPath = getPreferencesPath();
    if (fs.existsSync(prefsPath)) {
        try {
            const data = fs.readFileSync(prefsPath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            logToFile(`Error loading preferences: ${err}`);
        }
    }
    return null;
}

function savePreferences(prefs: Preferences): void {
    const prefsPath = getPreferencesPath();
    fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2), 'utf8');
    logToFile(`Preferences saved to: ${prefsPath}`);
}

interface CertPaths {
    keyPath: string;
    certPath: string;
}

function getCertPaths(): CertPaths {
    const certsDir = path.join(app.getPath('userData'), 'certs');
    return {
        keyPath: path.join(certsDir, 'localhost.key'),
        certPath: path.join(certsDir, 'localhost.crt')
    };
}

async function generateCertificates(): Promise<{ key: string; cert: string }> {
    const { keyPath, certPath } = getCertPaths();
    const certsDir = path.dirname(keyPath);

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        logToFile('Using existing certificates');
        return {
            key: fs.readFileSync(keyPath, 'utf8'),
            cert: fs.readFileSync(certPath, 'utf8')
        };
    }

    logToFile('Generating new self-signed certificates...');

    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = await selfsigned.generate(attrs, {
        keySize: 2048,
        algorithm: 'sha256',
        extensions: [
            { name: 'basicConstraints', cA: true },
            {
                name: 'subjectAltName',
                altNames: [
                    { type: 2, value: 'localhost' },
                    { type: 7, ip: '127.0.0.1' }
                ]
            }
        ]
    });

    if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
    }
    fs.writeFileSync(keyPath, pems.private, 'utf8');
    fs.writeFileSync(certPath, pems.cert, 'utf8');

    logToFile(`Certificates saved to: ${certsDir}`);

    return {
        key: pems.private,
        cert: pems.cert
    };
}

function logToFile(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    console.log(logEntry.trim());

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('log-update', logEntry);
    }
}

// Sanitize username for Firebase path (must match server-side)
function sanitizeForFirebase(str: string): string {
    return str
        .replace(/\./g, ',')  // Firebase convention: replace . with ,
        .replace(/[#$\[\]]/g, '_');  // Replace other invalid chars
}

// Firebase listener
function startFirebaseListener(prefs: Preferences): void {
    if (!prefs.firebaseConfig || !prefs.username) {
        logToFile('Firebase config or username not set, skipping Firebase listener');
        return;
    }

    try {
        // Initialize Firebase
        firebaseApp = initializeApp(prefs.firebaseConfig);
        firebaseDb = getDatabase(firebaseApp);

        const sanitizedUsername = sanitizeForFirebase(prefs.username);
        const screenPopsRef = ref(firebaseDb, `screenPops/${sanitizedUsername}`);

        logToFile(`Listening for screen pops for user: ${prefs.username}`);

        firebaseUnsubscribe = onChildAdded(screenPopsRef, async (snapshot) => {
            const data = snapshot.val();

            if (data && !data.processed && data.uri) {
                logToFile(`Received screen pop: ${JSON.stringify(data)}`);

                try {
                    // Open the URI
                    await shell.openExternal(data.uri);
                    logToFile(`Screen pop triggered successfully for: ${data.phoneNumber}`);

                    // Mark as processed
                    await update(ref(firebaseDb!, `screenPops/${sanitizedUsername}/${snapshot.key}`), {
                        processed: true,
                        processedAt: Date.now()
                    });
                } catch (err) {
                    logToFile(`Error opening URI: ${err}`);
                }
            }
        });

        logToFile('Firebase listener started');
    } catch (err) {
        logToFile(`Error starting Firebase listener: ${err}`);
    }
}

function stopFirebaseListener(): void {
    if (firebaseUnsubscribe) {
        firebaseUnsubscribe();
        firebaseUnsubscribe = null;
        logToFile('Firebase listener stopped');
    }
}

function createRequestHandler() {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
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
    };
}

async function startServers(): Promise<void> {
    const requestHandler = createRequestHandler();

    httpServer = http.createServer(requestHandler);
    httpServer.listen(HTTP_PORT, () => {
        logToFile(`HTTP server listening on port ${HTTP_PORT}`);
        logToFile(`Log file: ${LOG_FILE}`);
    });
    httpServer.on('error', (err) => {
        logToFile(`HTTP server error: ${err.message}`);
    });

    try {
        const { key, cert } = await generateCertificates();
        httpsServer = https.createServer({ key, cert }, requestHandler);
        httpsServer.listen(HTTPS_PORT, () => {
            logToFile(`HTTPS server listening on port ${HTTPS_PORT}`);
        });
        httpsServer.on('error', (err) => {
            logToFile(`HTTPS server error: ${err.message}`);
        });
    } catch (err) {
        logToFile(`Failed to start HTTPS server: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 500,
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
    tray = new Tray(path.join(__dirname, 'icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Window',
            click: () => mainWindow?.show()
        },
        {
            label: 'Open Log File',
            click: () => {
                shell.openPath(LOG_FILE);
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                stopFirebaseListener();
                if (httpServer) httpServer.close();
                if (httpsServer) httpsServer.close();
                app.quit();
                process.exit(0);
            }
        }
    ]);

    tray.setToolTip(`Helper App - HTTP:${HTTP_PORT} HTTPS:${HTTPS_PORT}`);
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow?.show();
    });
}

// IPC handlers for preferences
ipcMain.handle('get-preferences', () => {
    return loadPreferences();
});

ipcMain.handle('save-preferences', (_event, prefs: Preferences) => {
    savePreferences(prefs);

    // Restart Firebase listener with new preferences
    stopFirebaseListener();
    startFirebaseListener(prefs);

    return { success: true };
});

ipcMain.handle('get-preferences-path', () => {
    return getPreferencesPath();
});

app.whenReady().then(() => {
    fs.writeFileSync(LOG_FILE, `=== Helper App Started ===\n`, 'utf8');

    startServers();
    createWindow();

    const iconPath = path.join(__dirname, 'icon.png');
    if (fs.existsSync(iconPath)) {
        createTray();
    }

    // Start Firebase listener if preferences exist
    const prefs = loadPreferences();
    if (prefs) {
        startFirebaseListener(prefs);
    } else {
        logToFile('No preferences found. Please configure username and Firebase settings.');
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopFirebaseListener();
        if (httpServer) httpServer.close();
        if (httpsServer) httpsServer.close();
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
    stopFirebaseListener();
    if (httpServer) {
        httpServer.close();
        logToFile('HTTP server stopped');
    }
    if (httpsServer) {
        httpsServer.close();
        logToFile('HTTPS server stopped');
    }
});
