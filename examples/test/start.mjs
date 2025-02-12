import { start } from '../../dist/start.js';

start({
  watchFolder: 'src',
  entryPoint: 'src/main.mjs',
  graphPath: 'out/graph.json',
  port: 8085,
  useTypescript: false,
});
