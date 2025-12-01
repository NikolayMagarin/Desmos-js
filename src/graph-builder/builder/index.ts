import path from 'path';
import fs from 'fs';
import { accessor, primitiveToAccessor } from '../accessor/accessor';
import { functions } from '../accessor/build-in-functions';
import { definer } from '../definer/definer';
import { utils } from '../utils';
import { GraphBuilder } from './types';
import { compile } from './compile';
import { operators } from '../accessor/operators';

export const graphBuilder: GraphBuilder = {
  definer: definer(),
  accessor: accessor(),
  converter: primitiveToAccessor,
  functions: functions,
  utils: utils,
  operators: operators,
};

process.on('beforeExit', (code) => {
  if (code === 0) {
    const dir = path.dirname(process.argv[2]);

    if (!fs.existsSync(dir)) {
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }
    fs.writeFileSync(
      process.argv[2] || 'out/graph.json',
      JSON.stringify(compile())
    );
  }
});
