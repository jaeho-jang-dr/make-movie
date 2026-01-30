/**
 * Anime Maker - Web Server
 * 간단한 HTTP 서버로 웹 UI 제공
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { UnifiedConductor } from '../conductor/UnifiedConductor';

const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

// Conductor instance
let conductor: UnifiedConductor | null = null;

function getConductor(): UnifiedConductor {
    if (!conductor) {
        conductor = new UnifiedConductor();
    }
    return conductor;
}

// API handlers
async function handleAPI(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    const pathname = url.pathname;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        const cond = getConductor();

        if (pathname === '/api/status') {
            const status = cond.getSystemStatus();
            res.writeHead(200);
            res.end(JSON.stringify(status));
            return;
        }

        if (pathname === '/api/teams') {
            const teams = cond.getTeams();
            res.writeHead(200);
            res.end(JSON.stringify(teams));
            return;
        }

        if (pathname === '/api/comfyui') {
            try {
                const comfyUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
                const response = await fetch(`${comfyUrl}/system_stats`);
                if (response.ok) {
                    const data = await response.json();
                    res.writeHead(200);
                    res.end(JSON.stringify({ connected: true, data }));
                } else {
                    res.writeHead(200);
                    res.end(JSON.stringify({ connected: false }));
                }
            } catch {
                res.writeHead(200);
                res.end(JSON.stringify({ connected: false }));
            }
            return;
        }

        if (pathname === '/api/story' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const options = JSON.parse(body);
                    const squad = cond.getSquad('story');
                    if (squad && 'developStory' in squad) {
                        const result = await (squad as any).developStory(options.theme);
                        res.writeHead(200);
                        res.end(JSON.stringify({ success: true, data: result }));
                    } else {
                        res.writeHead(200);
                        res.end(JSON.stringify({ success: false, error: 'Story squad not available' }));
                    }
                } catch (error) {
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: false, error: String(error) }));
                }
            });
            return;
        }

        if (pathname === '/api/production' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const options = JSON.parse(body);
                    const result = await cond.runFullProduction(options);
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true, data: result }));
                } catch (error) {
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: false, error: String(error) }));
                }
            });
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: String(error) }));
    }
}

// Static file handler
function handleStatic(req: http.IncomingMessage, res: http.ServerResponse): void {
    let pathname = new URL(req.url || '/', `http://localhost:${PORT}`).pathname;

    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, '../../electron', pathname);
    const ext = path.extname(filePath);
    const mimeType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        res.setHeader('Content-Type', mimeType);
        res.writeHead(200);
        res.end(data);
    });
}

// Create server
const server = http.createServer((req, res) => {
    const url = req.url || '/';

    if (url.startsWith('/api/')) {
        handleAPI(req, res);
    } else {
        handleStatic(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`\n🌐 Anime Maker Web UI`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api/status\n`);
});
