/**
 * Anime Maker - Electron Main Process
 * Multi-AI Orchestration Desktop Application
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let conductorProcess: ChildProcess | null = null;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: 'Anime Maker - Multi-AI Studio',
        icon: path.join(__dirname, '../assets/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#1a1a2e',
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (conductorProcess) {
            conductorProcess.kill();
        }
    });
}

// IPC Handlers
ipcMain.handle('get-system-status', async () => {
    try {
        const { UnifiedConductor } = await import('../src/conductor/UnifiedConductor');
        const conductor = new UnifiedConductor();
        return conductor.getSystemStatus();
    } catch (error) {
        return { error: String(error) };
    }
});

ipcMain.handle('get-teams', async () => {
    try {
        const { UnifiedConductor } = await import('../src/conductor/UnifiedConductor');
        const conductor = new UnifiedConductor();
        return conductor.getTeams();
    } catch (error) {
        return { error: String(error) };
    }
});

ipcMain.handle('generate-story', async (_event, options: { theme: string; genre?: string }) => {
    try {
        const { UnifiedConductor } = await import('../src/conductor/UnifiedConductor');
        const conductor = new UnifiedConductor();
        const squad = conductor.getSquad('story');

        if (squad && 'developStory' in squad) {
            const result = await (squad as any).developStory(options.theme);
            return { success: true, data: result };
        }

        return { success: false, error: 'Story squad not available' };
    } catch (error) {
        return { success: false, error: String(error) };
    }
});

ipcMain.handle('start-production', async (_event, options: {
    theme: string;
    genre?: string;
    duration?: number;
    outputPath?: string;
}) => {
    try {
        const { UnifiedConductor } = await import('../src/conductor/UnifiedConductor');
        const conductor = new UnifiedConductor();

        // Run full production pipeline
        const result = await conductor.runFullProduction({
            theme: options.theme,
            genre: options.genre,
            duration: options.duration,
            outputPath: options.outputPath,
        });

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: String(error) };
    }
});

ipcMain.handle('check-comfyui', async () => {
    try {
        const url = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
        const response = await fetch(`${url}/system_stats`);

        if (response.ok) {
            const data = await response.json();
            return { connected: true, data };
        }

        return { connected: false };
    } catch {
        return { connected: false };
    }
});

ipcMain.handle('select-output-folder', async () => {
    if (!mainWindow) return null;

    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Output Folder',
    });

    return result.canceled ? null : result.filePaths[0];
});

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (conductorProcess) {
        conductorProcess.kill();
    }
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
