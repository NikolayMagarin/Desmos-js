import { WebSocketServer } from 'ws';
import { readFileSync, existsSync } from 'fs';

export function createServer({
  port,
  graphPath,
}: {
  port?: number;
  graphPath: string;
}) {
  const wss = new WebSocketServer({ port });
  wss.on('error', console.error);

  wss.on('connection', (ws) => {
    ws.on('error', console.error);

    if (existsSync(graphPath)) {
      const data = readFileSync(graphPath);
      ws.send(data);
    }
  });

  function sendGraph() {
    const data = readFileSync(graphPath);
    wss.clients.forEach((ws) => ws.send(data));
  }

  return { server: wss, sendGraph };
}
