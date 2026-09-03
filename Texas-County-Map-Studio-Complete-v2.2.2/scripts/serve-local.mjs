import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const host = '127.0.0.1';
const preferredPort = 4173;
const maximumPort = 4193;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

if (!existsSync(join(root, 'index.html'))) {
  console.error('The built application is missing. Run npm install and npm run build first.');
  process.exit(1);
}

const server = createServer((request, response) => {
  const requested = decodeURIComponent((request.url || '/').split('?')[0]);
  const relative = normalize(requested).replace(/^([/\\])+/, '');
  let file = join(root, relative || 'index.html');
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, 'index.html');
  }
  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  createReadStream(file).pipe(response);
});

const startServer = (port) => {
  const onError = (error) => {
    server.off('listening', onListening);
    if (error.code === 'EADDRINUSE' && port < maximumPort) {
      console.log(`Local address ${port} is busy. Trying ${port + 1}...`);
      startServer(port + 1);
      return;
    }
    console.error(`Texas County Map Studio could not start: ${error.message}`);
    process.exitCode = 1;
  };
  const onListening = () => {
    server.off('error', onError);
    const url = `http://${host}:${port}/`;
    console.log(`Texas County Map Studio is running at ${url}`);
    console.log('Keep this window open while using the studio. Press Ctrl+C to stop it.');
    if (process.platform === 'win32' && process.env.MAP_STUDIO_NO_OPEN !== '1') {
      spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    }
  };
  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port, host);
};

startServer(preferredPort);
