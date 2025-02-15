import {
  PrimitiveValue,
  PrimitiveArray,
  isAccessor,
  AccessorValue,
  valueSymbol,
  PrimitivePoint,
} from './types';

export function primitiveToValue(primitive: PrimitiveValue): AccessorValue {
  // определить из вида примитива значение для аксессора

  if (typeof primitive === 'number') {
    return convertNumber(primitive);
  }

  if (Array.isArray(primitive)) {
    return convertArray(primitive);
  }

  if (isPrimitivePoint(primitive)) {
    return convertPoint(primitive);
  }

  return { parts: [], variables: [] };
}

export function isPrimitivePoint(
  primitive: PrimitiveValue
): primitive is PrimitivePoint {
  return primitive.hasOwnProperty('x');
  // && primimtive.hasOwnProperty('y')
}

// convert number to string avoiding using exponential notation
export function convertNumber(value: number): AccessorValue {
  const decimalsPart = value?.toString()?.split('.')?.[1] || '';
  const eDecimals = Number(decimalsPart?.split('e-')?.[1]) || 0;
  const countOfDecimals = decimalsPart.length + eDecimals;
  return { parts: [Number(value).toFixed(countOfDecimals)], variables: [] };
}

export function convertArray(value: PrimitiveArray): AccessorValue {
  const parts: (number | string)[] = ['\\left['];
  const variables: string[] = [];

  value.forEach((el) => {
    const val = isAccessor(el) ? el[valueSymbol] : primitiveToValue(el);

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

  parts.push('\\right]');

  return { parts, variables };
}

export function convertPoint(value: PrimitivePoint) {
  const xVal = isAccessor(value.x)
    ? value.x[valueSymbol]
    : primitiveToValue(value.x);
  const yVal = isAccessor(value.y)
    ? value.y[valueSymbol]
    : primitiveToValue(value.y);

  return {
    parts: (['\\left('] as (string | number)[]).concat(
      xVal.parts,
      [','],
      yVal.parts.map((part) =>
        typeof part === 'number' ? part + xVal.variables.length : part
      ),
      ['\\right)']
    ),
    variables: xVal.variables.concat(yVal.variables),
  };
}
