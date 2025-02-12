import express from 'express';
import { readFileSync, stat } from 'fs';

export function createGraphListennerServer(
  graphPath = 'out/graph.json',
  port = 8085,
  callback: () => void = () => {}
) {
  const app = express();

  app.options('/graph', (req, res) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    res.header('Access-Control-Allow-Origin', 'https://www.desmos.com');
    res.sendStatus(200);
  });

  app.get('/graph', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://www.desmos.com');

    const lastTime = parseInt(req.query.t as string, 10) || 0;

    stat(graphPath, (error, stats) => {
      if (error !== null) {
        // Error probably due to `graphPath` doesn't exist
        res.status(200).json({ status: 'not_compiled' });
        return;
      }

      const { mtimeMs } = stats;

      const curTime = Math.floor(mtimeMs);
      if (curTime > lastTime) {
        res.status(200).json({
          status: 'modified',
          time: curTime,
          data: readFileSync(graphPath).toString(),
        });
      } else {
        res.status(200).json({ status: 'not_modified' });
      }
    });
  });

  app.listen(port, callback);

  return app;
}
