import { getShortVarName } from '../builder/compile';
import { parser } from '../builder/parser';
import { getVariableIdRecursively, registerVariable } from '../builder/scoping';
import { ParseError } from '../erorrs';
import { accessorWithValue } from './accessor';
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
  if: any;
}

type ForOperator = (iterVariable: Accessor) => {
  in: (iterValue: Accessor | PrimitiveArray) => {
    for: ForOperator;
    compute: (value: Accessor | PrimitiveValue) => ArrayAccessor;
  };
};

export const operators = {} as Operators;

operators.for = (iterVar) => {
  const iteratorNames: string[] = [];
  const iteratorValues: AccessorValue[] = [];

  const builder: ReturnType<ForOperator> = {
    in: (iterVal: Accessor | PrimitiveArray) => {
      iteratorValues.push(
        isAccessor(iterVal) ? iterVal[valueSymbol] : primitiveToValue(iterVal)
      );

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
      parts.push(
        getShortVarName(getVariableIdRecursively(forScope, iterName)),
        '='
      );
      iteratorValues[i].parts.forEach((part) => {
        if (typeof part === 'number') {
          parts.push(variables.length);
          variables.push(iteratorValues[i].variables[part]);
        } else {
          parts.push(part);
        }
      });
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
