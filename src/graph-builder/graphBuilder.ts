import fs from 'fs';
import { definer } from './definer/definer';
import { accessor, primimtiveToAccessor } from './accessor/accessor';
import { randomString } from '../utils/randomString';
import path from 'path';
import { ParsedExpression, Scope } from './types';
import { PrimitiveValue, Accessor } from './accessor/types';
import { parseValue } from './accessor/accessor';
import { Expression, State } from '../types';

interface GraphBuilder {
  definer: ReturnType<typeof definer>;
  accessor: ReturnType<typeof accessor>;
  converter: (primimtive: PrimitiveValue) => Accessor;
}

const parser: {
  currentScope: Scope;
  variableCounter: number;
  expressions: {
    general: ParsedExpression[];
  };
} = {
  currentScope: { parentScope: null, variableId: new Map() },
  variableCounter: 0,
  expressions: {
    general: [],
  },
};

export const graphBuilder: GraphBuilder = {
  definer: definer(onVariableDefine),
  accessor: accessor(),
  converter: primimtiveToAccessor,
};

function onVariableDefine(name: string, val: Accessor | PrimitiveValue) {
  if (parser.currentScope.variableId.has(name)) {
    // Дублирование переменной в скоупе
    // throw ...
  } else {
    parser.currentScope.variableId.set(name, parser.variableCounter);
    parser.variableCounter++;

    const { parts, variables } = parseValue(val);

    const expression: ParsedExpression = {
      scope: parser.currentScope,
      name: name,
      parts: parts,
      variables: variables,
      params: undefined,
    };

    parser.expressions.general.push(expression);
  }
}

const variableShortName = 'i';

function compile(): State {
  const expressionList: Expression[] = [];

  parser.expressions.general.forEach((expression, expressionId) => {
    const scopeVars = expression.scope.variableId;

    const latexName = expression.name
      ? `${variableShortName}_{${scopeVars.get(expression.name)}}=`
      : '';

    const latexValue = expression.parts
      .map((part) => {
        if (typeof part == 'number') {
          return `${variableShortName}_{${scopeVars.get(
            expression.variables[part]
          )}}`;
        } else {
          return part;
        }
      })
      .join('');

    expressionList.push({
      type: 'expression',
      id: expressionId.toString(),
      latex: latexName + latexValue,
    });
  });

  return {
    version: 11,
    randomSeed: randomString(32),
    graph: {
      viewport: {
        xmin: -10,
        ymin: -10,
        xmax: 10,
        ymax: 10,
      },
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      xAxisNumbers: true,
      yAxisNumbers: true,
      polarNumbers: false,
      userLockedViewport: false,
      squareAxes: true,
    },
    expressions: {
      list: expressionList,
      ticker: undefined,
    },
    includeFunctionParametersInRandomSeed: true,
    doNotMigrateMovablePointStyle: true,
  };
}

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
