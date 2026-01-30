/**
 * Anime Maker - Electron Preload Script
 * Secure bridge between renderer and main process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('animeMaker', {
    // System
    getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
    getTeams: () => ipcRenderer.invoke('get-teams'),
    checkComfyUI: () => ipcRenderer.invoke('check-comfyui'),

    // Production
    generateStory: (options: { theme: string; genre?: string }) =>
        ipcRenderer.invoke('generate-story', options),
    startProduction: (options: {
        theme: string;
        genre?: string;
        duration?: number;
        outputPath?: string;
    }) => ipcRenderer.invoke('start-production', options),

    // Dialogs
    selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),

    // Events
    onProgress: (callback: (progress: any) => void) => {
        ipcRenderer.on('production-progress', (_event, progress) => callback(progress));
    },
    onError: (callback: (error: any) => void) => {
        ipcRenderer.on('production-error', (_event, error) => callback(error));
    },
    onComplete: (callback: (result: any) => void) => {
        ipcRenderer.on('production-complete', (_event, result) => callback(result));
    },
});

// Type definitions for TypeScript
declare global {
    interface Window {
        animeMaker: {
            getSystemStatus: () => Promise<any>;
            getTeams: () => Promise<any>;
            checkComfyUI: () => Promise<{ connected: boolean; data?: any }>;
            generateStory: (options: { theme: string; genre?: string }) => Promise<any>;
            startProduction: (options: {
                theme: string;
                genre?: string;
                duration?: number;
                outputPath?: string;
            }) => Promise<any>;
            selectOutputFolder: () => Promise<string | null>;
            onProgress: (callback: (progress: any) => void) => void;
            onError: (callback: (error: any) => void) => void;
            onComplete: (callback: (result: any) => void) => void;
        };
    }
}
