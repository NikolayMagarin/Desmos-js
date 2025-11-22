import { ParseError } from '../erorrs';
import { accessorWithValue } from './accessor';
import { primitiveToValue } from './primitives';
import {
  Accessor,
  AccessorValue,
  ArithmeticOperator,
  isAccessor,
  PrimitiveValue,
  valueSymbol,
} from './types';

// prettier-ignore
export const functionNames = [
  'sin','cos','tan','csc','sec','cot','asin','acos','atan','acsc','asec','acot','mean','median','min','max','quartile',
  'quantile','stdev','stdevp','var','varp','mad','cov','covp','corr','spearman','stats','count','total','repeat','join','sort',
  'shuffle','unique','histogram','dotplot','boxplot','normaldist','tdist','poissondist','binomialdist','uniformdist',
  'pdf','cdf','inversecdf','random','ttest','tscore','ittest','exp','ln','log','logn',
  /* производная*/'deriv',/* интеграл */'int',/*суммирование*/'sum',/*произведение*/'prod',
  'sinh','cosh','tanh','csch','sech','coth','rgb','hsv','tone','lcm','gcd','mod','ceil','floor','round','sign','nthroot','nPr',
  'real','imag','conj','arg','modulus',
  'midpoint','distance','polygon',
] as const;

export type FunctionName = (typeof functionNames)[number];

// TODO: manually specify type for every function
export type FunctionCollector = Record<
  FunctionName,
  (...values: (Accessor | PrimitiveValue)[]) => Accessor
>;

export const functions = {} as FunctionCollector;

functionNames.forEach((functionName) => {
  functions[functionName] = function (...args) {
    return handleFunction(functionName, args);
  };
});

// prettier-ignore
const asIsFunctionNames: Set<FunctionName> = new Set(
  ['sin','cos','tan','csc','sec','cot','min','max','exp','ln','log','sinh','cosh','tanh','coth','gcd','arg']
);
// prettier-ignore
const invertFunctionNames: Set<FunctionName> = new Set(['asin','acos','atan','acsc','asec','acot']);

function handleFunction<T extends FunctionName>(
  functionName: T,
  args: (Accessor | PrimitiveValue)[]
): Accessor {
  const argValues = args.map((arg) =>
    isAccessor(arg) ? arg[valueSymbol] : primitiveToValue(arg)
  );

  if (asIsFunctionNames.has(functionName)) {
    return handleDefault(argValues, functionName, `\\${functionName}`);
  } else if (invertFunctionNames.has(functionName)) {
    return handleDefault(
      argValues,
      functionName,
      `\\${functionName.slice(1)}^{-1}`
    );
  }

  switch (functionName) {
    case 'logn':
      return handleLogn(argValues);
    case 'deriv':
      return handleCumulative(argValues, 'deriv');
    case 'int':
      return handleCumulative(argValues, 'int');
    case 'sum':
      return handleCumulative(argValues, 'sum');
    case 'prod':
      return handleCumulative(argValues, 'prod');
    case 'nthroot':
      return handleNthroot(argValues);
    case 'modulus':
      return handleDefault(argValues, 'modulus', '', true);
    default:
      return handleDefault(
        argValues,
        functionName,
        `\\operatorname{${functionName}}`
      );
  }
}

function handleLogn(argsValues: AccessorValue[]) {
  if (argsValues.length !== 2) {
    throw new ParseError(
      `Function "logn": Expected 2 arguments, but got ${argsValues.length}`
    );
  }

  const indexValue = argsValues[0];
  const argValue = argsValues[1];

  const parts: (number | string)[] = ['\\log_{'];
  const variables: string[] = [];

  indexValue.parts.forEach((part) => parts.push(part));
  parts.push('}\\left(');
  argValue.parts.forEach((part) =>
    parts.push(
      typeof part === 'number' ? part + indexValue.variables.length : part
    )
  );
  parts.push('\\right)');

  indexValue.variables.forEach((variable) => variables.push(variable));
  argValue.variables.forEach((variable) => variables.push(variable));

  return accessorWithValue({
    parts,
    variables,
    // lastOperator: ArithmeticOperator....,
  });
}

function handleNthroot(argsValues: AccessorValue[]) {
  if (argsValues.length !== 2) {
    throw new ParseError(
      `Function "nthroot": Expected 2 arguments, but got ${argsValues.length}`
    );
  }

  const indexValue = argsValues[0];
  const argValue = argsValues[1];

  const parts: (number | string)[] = ['\\sqrt['];
  const variables: string[] = [];

  indexValue.parts.forEach((part) => parts.push(part));
  parts.push(']{');
  argValue.parts.forEach((part) =>
    parts.push(
      typeof part === 'number' ? part + indexValue.variables.length : part
    )
  );
  parts.push('}');

  indexValue.variables.forEach((variable) => variables.push(variable));
  argValue.variables.forEach((variable) => variables.push(variable));

  return accessorWithValue({
    parts,
    variables,
    // lastOperator: ArithmeticOperator....,
  });
}

function handleDefault(
  argsValues: AccessorValue[],
  functionName: string,
  functionLatex: string,
  modulusBrackets: boolean = false
) {
  // TODO: specify argument quantity for every function (max and min quantity)
  if (argsValues.length === 0) {
    throw new ParseError(
      `Function "${functionName}": Expected at least 1 argument, but got ${argsValues.length}`
    );
  }

  const { parts, variables } = calcResultValue(argsValues);

  if (modulusBrackets) {
    parts.unshift('\\left|');
    parts.push('\\right|');
  } else {
    parts.unshift(`${functionLatex}\\left(`);
    parts.push('\\right)');
  }

  return accessorWithValue({
    parts,
    variables,
    // lastOperator: ArithmeticOperator....,
  });
}

// TODO: implement
function handleCumulative(
  argsValues: AccessorValue[],
  functionName: 'int' | 'deriv' | 'sum' | 'prod'
) {
  // d/dx (или int, sum, prod), но аргументом является функция (FunctionAccessor), либо примитив функции (Например `(x) => x.plus(1)`)
  // Если это функция то нужно написать d/dx(f(x)), a если примитив функции, то d/dx(вставить сюда примитив, если аргумент один и его имя "x")

  // для всех функций на вход поступает функция как для производной так и для интеграла, суммы и произведения

  // для int, prod и sum есть нижний и верхний индекс
  // для prod и sum нижний индекс является присваиванием типа n=1

  return accessorWithValue({
    parts: [],
    variables: [],
    // lastOperator: ArithmeticOperator....,
  });
}

function calcResultValue(argsValues: AccessorValue[]): AccessorValue {
  const parts: (number | string)[] = [];
  const variables: string[] = [];

  argsValues.forEach((val) => {
    val.parts.forEach((part) => {
      if (typeof part === 'number') {
        parts.push(variables.length);
        variables.push(val.variables[part]);
      } else {
        parts.push(part);
      }
    });
    parts.push(',');
  });

  if (parts[parts.length - 1] === ',') {
    parts.pop();
  }

  return {
    parts,
    variables,
  };
}

// + 'for' с возможностью указания i for i = [1,2,3,4...] и i for 0 < i < 1
// + какой-то удобный способ указания цветов отличный от функций rgb и hsv (хотя они тоже будут)

// Нужно добавить типы: Function, Polygon, Action (в том числе Action с параметрами), Color, Distribution ...
// Также добавить условия а значит методы для isEqual isGreater и тд, которые будут возвращать новый тип Condition,
// который можно закидывать в условие типа: Record<ConditionAccessor | 'default', Accessor>
