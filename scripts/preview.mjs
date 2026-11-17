import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.split('/').some(part => part.startsWith('.') || ['node_modules', 'content', 'scripts', 'tests', 'docs'].includes(part))) throw new Error('Not public');
    let target = path.resolve(root, `.${pathname}`);
    if (target !== path.resolve(root) && !target.startsWith(root)) throw new Error('Outside root');
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    const type = types[path.extname(target)];
    if (!type) throw new Error('Unsupported asset');
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
    response.end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(await readFile(path.join(root, '404.html')).catch(() => '찾을 수 없는 페이지입니다.'));
  }
}).listen(port, '127.0.0.1', () => console.log(`Portfolio preview: http://127.0.0.1:${port}`));
