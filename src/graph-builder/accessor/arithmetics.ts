import {
  AccessorValue,
  ArithmeticOperator,
  isAccessor,
  Accessor,
  PrimitiveValue,
  valueSymbol,
} from './types';
import { accessorWithValue } from './accessor';
import { primitiveToValue } from './primitives';

const operatorPriority: Record<ArithmeticOperator, number> = {
  [ArithmeticOperator.PLUS]: 0,
  [ArithmeticOperator.MINUS]: 0,
  [ArithmeticOperator.TIMES]: 1,
  [ArithmeticOperator.OVER]: 1,
  [ArithmeticOperator.POW]: 2,
};

export function init(universal = function () {}) {
  universal.prototype.plus = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aValue = (this as Accessor)[valueSymbol];
    const bValue = isAccessor(value)
      ? value[valueSymbol]
      : primitiveToValue(value);

    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
      lastOperator: ArithmeticOperator.PLUS,
    };

    aValue.parts.forEach((part) => resultValue.parts.push(part));
    resultValue.parts.push('+');
    bValue.parts.forEach((part) =>
      resultValue.parts.push(
        typeof part === 'number' ? part + aValue.variables.length : part
      )
    );

    aValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );
    bValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    return accessorWithValue(resultValue);
  };

  universal.prototype.minus = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aValue = (this as Accessor)[valueSymbol];
    const bValue = isAccessor(value)
      ? value[valueSymbol]
      : primitiveToValue(value);

    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
      lastOperator: ArithmeticOperator.MINUS,
    };

    aValue.parts.forEach((part) => resultValue.parts.push(part));
    resultValue.parts.push('-');
    bValue.parts.forEach((part) =>
      resultValue.parts.push(
        typeof part === 'number' ? part + aValue.variables.length : part
      )
    );

    aValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );
    bValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    return accessorWithValue(resultValue);
  };

  universal.prototype.times = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aValue = (this as Accessor)[valueSymbol];
    const bValue = isAccessor(value)
      ? value[valueSymbol]
      : primitiveToValue(value);

    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
      lastOperator: ArithmeticOperator.TIMES,
    };

    const needBracketsForA =
      aValue.lastOperator !== undefined &&
      operatorPriority[aValue.lastOperator] <
        operatorPriority[ArithmeticOperator.TIMES];

    const needBracketsForB =
      bValue.lastOperator !== undefined &&
      operatorPriority[bValue.lastOperator] <
        operatorPriority[ArithmeticOperator.TIMES];

    if (needBracketsForA) resultValue.parts.push('\\left(');
    aValue.parts.forEach((part) => resultValue.parts.push(part));
    if (needBracketsForA) resultValue.parts.push('\\right)');

    // Возможно для умножения вообще необязательно '\\cdot ' и можно вообще ничего не вставлять
    resultValue.parts.push('\\cdot ');

    if (needBracketsForB) resultValue.parts.push('\\left(');
    bValue.parts.forEach((part) =>
      resultValue.parts.push(
        typeof part === 'number' ? part + aValue.variables.length : part
      )
    );
    if (needBracketsForB) resultValue.parts.push('\\right)');

    aValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );
    bValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    return accessorWithValue(resultValue);
  };

  universal.prototype.over = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aValue = (this as Accessor)[valueSymbol];
    const bValue = isAccessor(value)
      ? value[valueSymbol]
      : primitiveToValue(value);

    const resultValue: AccessorValue = {
      parts: ['\\frac{'],
      variables: [],
      lastOperator: ArithmeticOperator.PLUS,
    };

    aValue.parts.forEach((part) => resultValue.parts.push(part));
    resultValue.parts.push('}{');
    bValue.parts.forEach((part) =>
      resultValue.parts.push(
        typeof part === 'number' ? part + aValue.variables.length : part
      )
    );
    resultValue.parts.push('}');

    aValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );
    bValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    return accessorWithValue(resultValue);
  };

  universal.prototype.pow = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aValue = (this as Accessor)[valueSymbol];
    const bValue = isAccessor(value)
      ? value[valueSymbol]
      : primitiveToValue(value);

    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
      lastOperator: ArithmeticOperator.POW,
    };

    const needBracketsForA =
      aValue.lastOperator !== undefined &&
      operatorPriority[aValue.lastOperator] <
        operatorPriority[ArithmeticOperator.POW];

    if (needBracketsForA) resultValue.parts.push('\\left(');
    aValue.parts.forEach((part) => resultValue.parts.push(part));
    if (needBracketsForA) resultValue.parts.push('\\right)');

    resultValue.parts.push('^{');
    bValue.parts.forEach((part) =>
      resultValue.parts.push(
        typeof part === 'number' ? part + aValue.variables.length : part
      )
    );
    resultValue.parts.push('}');

    aValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );
    bValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    return accessorWithValue(resultValue);
  };
}
