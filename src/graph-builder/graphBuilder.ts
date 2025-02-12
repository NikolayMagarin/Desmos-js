import fs from 'fs';
import { definer } from './definer/definer';
import { accessor, primimtiveToAccessor } from './accessor/accessor';
import { randomString } from '../utils/random-string';
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

// Нужно добавить в gb функцию для изоляции переменных,
// чтобы была возможность написать внешний модуль, переменные в котором можно было бы назвать как угодно,
// не боясь что их названия будут пересекаться с глобальными переменными.
// Каким образом я добъюсь не пересечения? Внутри onVariableDefine будет прописана логика для проверки текущего блока переменных,
// Если он отличается от глобального, то к названию переменной будет добавляться название блока, или может его хэш или например символ $ а после него порядковый номер блока

// Еще для внешних модулей нужно сделать возможность пробрасывания переменных из текущей области видимости
// Так же и для обычных областей видимости нужно сделать возможность пробрасывания в них переменных из родительских областей видимости
// (Скорее всего области видимости будут хранить id родительской области видимости)
// Не забыть учесть, что внутри области видимости не может быть переменных с таким же именем что и у пропрошенной из родительской области видимости переменной
// то есть сделать на это проверку (Наверное эта проверка автоматически получится вместе с обычной проверкой на дубликаты переменных внутри одной области видимости, если корректно связать область видимости с родительской)

// В теории, можно конечно сделать, чтобы из области видимости были доступны все переменные всех родительских областей видимости (как в порграммировании)
// но не знаю, будет ли это лучше, наверное нет. Лучше сделаю, чтобы нужно было вручную прописывать какие переменные прокидываются в дочернюю область видимости
// Все таки сделаю видимость всех переменных из родительских областей видимости

// А может лучше не париться и просто все неглобальные переменные переименовывать в a_1, a_2, a_3 и тд?
// На каждое объявление переменной мы просто увеличиваем счетчик на 1 и привязываем значение счетчика
// (назовем индексом переменной) к текущей области видимости и имени переменной,
// чтобы потом при попытке получить переменную по имени мы могли легко узнать ее индекс, исходя из ее имени
// и текущей области видимости

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
