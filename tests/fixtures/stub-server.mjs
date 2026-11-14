// Stands in for Vite: argv[2] is the port, argv[3] is the mode.
import { createServer } from 'node:http';
const [port, mode] = process.argv.slice(2);
console.log('stub starting');
if (mode === 'crash') { console.error('boom: cannot compile'); process.exit(1); }
if (mode !== 'hang') {
  createServer((_req, res) => res.end('<div id="app"></div>')).listen(Number(port), '127.0.0.1');
}
setInterval(() => {}, 1000);
