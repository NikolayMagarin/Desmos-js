import { createWatcher } from './Watcher';
import { createServer } from './server';

export function start({
  watchFolder = 'src',
  entryPoint = 'src/main.mjs',
  graphPath = 'out/graph.json',
  port = 8085,
  useTypescript = false,
}: {
  watchFolder?: string;
  entryPoint?: string;
  graphPath?: string;
  port?: number;
  useTypescript?: boolean;
}) {
  createWatcher(
    watchFolder,
    entryPoint,
    graphPath,
    useTypescript,
    createServer({
      port,
      graphPath,
    }).sendGraph
  );
}
