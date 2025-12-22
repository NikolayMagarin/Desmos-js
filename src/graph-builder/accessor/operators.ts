import { getShortVarName } from '../builder/compile';
import { parser } from '../builder/parser';
import { getVariableIdRecursively, registerVariable } from '../builder/scoping';
import { ParseError } from '../erorrs';
import { accessorWithValue, parseValue } from './accessor';
import { primitiveToValue } from './primitives';
import {
  Accessor,
  AccessorValue,
  ArrayAccessor,
  isAccessor,
  PrimitiveArray,
  PrimitiveValue,
  valueSymbol,
} from './types';

export interface Operators {
  for: ForOperator;
  if: IfOperator;
  not: NotOperator;
}

type ForOperator = (iterVariable: Accessor) => {
  in: (
    iterStart: Accessor | PrimitiveValue,
    iterEnd?: Accessor | PrimitiveValue
  ) => {
    for: ForOperator;
    compute: (value: Accessor | PrimitiveValue) => ArrayAccessor;
  };
};

export const operators = {} as Operators;

operators.for = (iterVar) => {
  const iteratorNames: string[] = [];
  const iteratorValues: (AccessorValue | [Accessor, Accessor])[] = [];

  const builder: ReturnType<ForOperator> = {
    in: (iterStart, iterEnd) => {
      if (!iterEnd) {
        iteratorValues.push(
          isAccessor(iterStart)
            ? iterStart[valueSymbol]
            : primitiveToValue(iterStart)
        );
      } else {
        const start = accessorWithValue(parseValue(iterStart));
        const end = accessorWithValue(parseValue(iterEnd));
        iteratorValues.push([start, end]);
      }

      return {
        for: forFunc,
        compute: computeFunction,
      };
    },
  };

  const forScope = {
    parentScope: parser.currentScope,
    variableId: new Map(),
  };

  parser.currentScope = forScope;

  function forFunc(iterVar: Accessor) {
    const iterVarValue = iterVar[valueSymbol];
    if (
      iterVarValue.parts.length !== 1 ||
      iterVarValue.parts[0] !== 0 ||
      iterVarValue.variables.length !== 1
    ) {
      throw new ParseError('Only variables can iterate, not expressions');
    }

    const varName = iterVarValue.variables[0];
    iteratorNames.push(varName);
    registerVariable(varName);

    return builder;
  }

  function computeFunction(computeValue: Accessor | PrimitiveValue) {
    const parts: (string | number)[] = [];
    const variables: string[] = [];

    const val = isAccessor(computeValue)
      ? computeValue[valueSymbol]
      : primitiveToValue(computeValue);

    parts.push('\\left(');

    val.parts.forEach((part, i) => {
      if (typeof part === 'number') {
        const varName = val.variables[part];
        if (iteratorNames.includes(varName)) {
          parts.push(
            getShortVarName(getVariableIdRecursively(forScope, varName))
          );
        } else {
          parts.push(variables.length);
          variables.push(varName);
        }
      } else {
        parts.push(part);
      }
    });

    parts.push('\\operatorname{for}');

    iteratorNames.forEach((iterName, i) => {
      const iteratorValue = iteratorValues[i];
      const iterLatexName = getShortVarName(
        getVariableIdRecursively(forScope, iterName)
      );

      if (Array.isArray(iteratorValue)) {
        const parametrizedPointBoundsValue = iteratorValue[0]
          .lt(accessorWithValue({ parts: [iterLatexName], variables: [] }))
          .lt(iteratorValue[1])[valueSymbol];

        parametrizedPointBoundsValue.parts.forEach((part) => {
          if (typeof part === 'number') {
            parts.push(variables.length);
            variables.push(parametrizedPointBoundsValue.variables[part]);
          } else {
            parts.push(part);
          }
        });
      } else {
        parts.push(iterLatexName, '=');

        iteratorValue.parts.forEach((part) => {
          if (typeof part === 'number') {
            parts.push(variables.length);
            variables.push(iteratorValue.variables[part]);
          } else {
            parts.push(part);
          }
        });
      }

      parts.push(',');
    });

    if (parts[parts.length - 1] === ',') {
      parts.pop();
    }

    parts.push('\\right)');

    parser.currentScope = forScope.parentScope;

    return accessorWithValue({
      parts,
      variables,
    });
  }

  return forFunc(iterVar);
};

type IfOperator = (
  condition: Accessor,
  value?: Accessor | PrimitiveValue
) => Accessor;

operators.if = (condition: Accessor, value?: Accessor | PrimitiveValue) => {
  const parts: (string | number)[] = ['\\left\\{'];
  const variables: string[] = [];

  const condVal = condition[valueSymbol];

  condVal.parts.forEach((part) => parts.push(part));
  condVal.variables.forEach((variable) => variables.push(variable));

  if (value) {
    parts.push(':');
    const val = parseValue(value);
    val.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + condVal.variables.length : part
      )
    );
    val.variables.forEach((variable) => variables.push(variable));
  }

  parts.push('\\right\\}');

  return accessorWithValue({ parts, variables, ifStatement: true });
};

type NotOperator = (condition: Accessor) => Accessor;

operators.not = (condition: Accessor) => {
  const val = parseValue(condition);

  return accessorWithValue({
    parts: ['\\left\\{', ...val.parts, ':0,1\\right\\}=1'],
    variables: [...val.variables],
  });
};
