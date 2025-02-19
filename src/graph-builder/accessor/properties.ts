import { accessorWithValue } from './accessor';
import { Accessor, AccessorValue, valueSymbol } from './types';

export function init(universal = function () {}) {
  Object.defineProperty(universal.prototype, 'length', {
    configurable: false,
    get() {
      const value = (this as Accessor)[valueSymbol];
      const resultValue: AccessorValue = {
        parts: [],
        variables: [],
      };
      if (value.lastOperator !== undefined) resultValue.parts.push('\\left(');
      value.parts.forEach((part) => resultValue.parts.push(part));
      if (value.lastOperator !== undefined) resultValue.parts.push('\\right)');
      resultValue.parts.push('.\\operatorname{length}');

      value.variables.forEach((variable) =>
        resultValue.variables.push(variable)
      );

      return accessorWithValue(resultValue);
    },
  });

  Object.defineProperty(universal.prototype, 'x', {
    configurable: false,
    get() {
      const value = (this as Accessor)[valueSymbol];
      const resultValue: AccessorValue = {
        parts: [],
        variables: [],
      };
      if (value.lastOperator !== undefined) resultValue.parts.push('\\left(');
      value.parts.forEach((part) => resultValue.parts.push(part));
      if (value.lastOperator !== undefined) resultValue.parts.push('\\right)');
      resultValue.parts.push('.x');

      value.variables.forEach((variable) =>
        resultValue.variables.push(variable)
      );

      return accessorWithValue(resultValue);
    },
  });

  Object.defineProperty(universal.prototype, 'y', {
    configurable: false,
    get() {
      const value = (this as Accessor)[valueSymbol];
      const resultValue: AccessorValue = {
        parts: [],
        variables: [],
      };
      if (value.lastOperator !== undefined) resultValue.parts.push('\\left(');
      value.parts.forEach((part) => resultValue.parts.push(part));
      if (value.lastOperator !== undefined) resultValue.parts.push('\\right)');
      resultValue.parts.push('.y');

      value.variables.forEach((variable) =>
        resultValue.variables.push(variable)
      );

      return accessorWithValue(resultValue);
    },
  });
}
