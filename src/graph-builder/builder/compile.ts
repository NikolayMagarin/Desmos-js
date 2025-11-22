import { Expression, State } from '../../types';
import { randomString } from '../../utils/randomString';
import { CompileError } from '../erorrs';
import { parser } from './parser';
import { getVariableIdRecursively } from './scoping';

// TODO: Сделать функцией от имени переменной, ее id, additionParams и может от чего-то еще
const variableShortName = 'i';

export function compile(): State {
  const expressionList: Expression[] = [];

  if (parser.currentScope.parentScope !== null) {
    throw new CompileError('The current scope was never closed');
  }

  parser.expressions.general.forEach((expression, expressionId) => {
    let scope = expression.scope;
    let latexName = '';
    if (expression.name) {
      latexName = `${variableShortName}_{${getVariableIdRecursively(
        expression.scope,
        expression.name
      )}}`;

      const params = expression.params;
      if (params.functionArgumentNames?.length && params.localScope) {
        // Если мы находимся внутри функции, то текущим скоупом становится локальный скоуп функции
        scope = params.localScope;
        latexName += `\\left(${params.functionArgumentNames
          .map(
            (v) =>
              `${variableShortName}_{${getVariableIdRecursively(scope, v)}}`
          )
          .join(',')}\\right)`;
      }

      latexName += '=';
    }

    const latexValue = expression.parts
      .map((part) => {
        if (typeof part == 'number') {
          return `${variableShortName}_{${getVariableIdRecursively(
            scope,
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
