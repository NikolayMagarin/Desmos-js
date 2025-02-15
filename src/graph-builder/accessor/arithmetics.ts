import { isAccessor } from './types';
import { accessorWithValue } from './accessor';
import { Accessor, PrimitiveValue, valueSymbol } from './types';
import { primitiveToValue } from './primitives';

export function init(universal = function () {}) {
  universal.prototype.plus = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aVal = (this as Accessor)[valueSymbol];
    const bVal = (
      isAccessor(value) ? value : accessorWithValue(primitiveToValue(value))
    )[valueSymbol];

    return accessorWithValue({
      parts: aVal.parts.concat(
        ['+'],
        bVal.parts.map((part) =>
          typeof part === 'number' ? part + aVal.variables.length : part
        )
      ),
      variables: aVal.variables.concat(bVal.variables),
    });
  };

  universal.prototype.minus = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aVal = (this as Accessor)[valueSymbol];
    const bVal = (
      isAccessor(value) ? value : accessorWithValue(primitiveToValue(value))
    )[valueSymbol];

    return accessorWithValue({
      parts: aVal.parts.concat(
        ['-'],
        bVal.parts.map((part) =>
          typeof part === 'number' ? part + aVal.variables.length : part
        )
      ),
      variables: aVal.variables.concat(bVal.variables),
    });
  };

  universal.prototype.times = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aVal = (this as Accessor)[valueSymbol];
    const bVal = (
      isAccessor(value) ? value : accessorWithValue(primitiveToValue(value))
    )[valueSymbol];

    return accessorWithValue({
      parts: aVal.parts.concat(
        ['\\cdot '],
        bVal.parts.map((part) =>
          typeof part === 'number' ? part + aVal.variables.length : part
        )
      ),
      variables: aVal.variables.concat(bVal.variables),
    });
  };

  universal.prototype.over = function (
    value: Accessor | PrimitiveValue
  ): Accessor {
    const aVal = (this as Accessor)[valueSymbol];
    const bVal = (
      isAccessor(value) ? value : accessorWithValue(primitiveToValue(value))
    )[valueSymbol];

    return accessorWithValue({
      parts: (['\\frac{'] as (string | number)[]).concat(
        aVal.parts,
        ['}{'],
        bVal.parts.map((part) =>
          typeof part === 'number' ? part + aVal.variables.length : part
        ),
        ['}']
      ),
      variables: aVal.variables.concat(bVal.variables),
    });
  };

  return universal;
}
