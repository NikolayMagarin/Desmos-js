import { ParseError } from '../erorrs';
import { accessorWithValue } from './accessor';
import {
  PrimitiveValue,
  PrimitiveArray,
  isAccessor,
  AccessorValue,
  valueSymbol,
  PrimitivePoint,
  PrimitiveFunction,
  PrimitiveAction,
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

  if (isPrimitiveFunction(primitive)) {
    return convertFunction(primitive);
  }

  throw new ParseError(
    `Got unknown primitive: ${`${primitive as any}`.slice(0, 50)}`
  );
}

export function isPrimitivePoint(
  primitive: PrimitiveValue
): primitive is PrimitivePoint {
  return (
    typeof primitive === 'object' &&
    primitive.hasOwnProperty('x') &&
    primitive.hasOwnProperty('y')
  );
}

export function isPrimitiveFunction(
  primitive: PrimitiveValue
): primitive is PrimitiveFunction {
  if (typeof primitive === 'function') {
    const funStr = primitive.toString().trim();
    // must be an arrow function with simple parameters and without body
    // like `(arg1, arg2, arg3...) => result`
    if (
      /^([a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\)|\(\s*\))\s*=>\s*[^\s\{}]/m.test(
        funStr
      )
    ) {
      return true;
    } else {
      // Primitive function must be (arg1, arg2, arg3...) => result
      throw new ParseError(
        `Invalid function primitive: ${(primitive as any)
          .toString()
          .slice(0, 50)}`
      );
    }
  } else {
    return false;
  }
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

export function convertPoint(value: PrimitivePoint): AccessorValue {
  const xVal = isAccessor(value.x)
    ? value.x[valueSymbol]
    : primitiveToValue(value.x as PrimitiveValue);
  const yVal = isAccessor(value.y)
    ? value.y[valueSymbol]
    : primitiveToValue(value.y as PrimitiveValue);

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

export function convertFunction(value: PrimitiveFunction): AccessorValue {
  const funStr = value.toString().trim();
  const match = funStr.match(
    /^([a-zA-Z]\w*|\([a-zA-Z]\w*(,\s*[a-zA-Z]\w*)*\)|\(\s*\))/m
  )!; // Should always match because we know value is PrimitiveFunction

  const argNames = match[0]
    .slice(1, -1)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const result = value(
    ...argNames.map((argName) =>
      accessorWithValue({ parts: [0], variables: [argName] })
    )
  );
  const val = isAccessor(result)
    ? result[valueSymbol]
    : primitiveToValue(result);

  return {
    ...val,
    additionalParams: {
      functionArgumentNames: argNames,
    },
  };
}
