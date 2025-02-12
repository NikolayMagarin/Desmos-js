import {
  AccessorCollector,
  Accessor,
  isAccessorSymbol,
  isAccessor,
  valueSymbol,
  PrimitiveValue,
  AccessorValue,
} from './types';

import { init as enableArithmetics } from './arithmetics';
import { convertScientificNotationNumber } from '../../utils/c';

export const universal = function () {};
universal.prototype[isAccessorSymbol] = true;
universal.prototype[valueSymbol] = {
  parts: [],
  variables: [],
};

enableArithmetics(universal);

export function accessorWithValue(
  parts: AccessorValue['parts'],
  variables?: AccessorValue['variables']
): Accessor {
  return Object.create(universal.prototype, {
    [valueSymbol]: {
      value: { parts: parts, variables: variables || [] },
    },
  });
}

export function primitiveToValue(primimtive: PrimitiveValue): string {
  // определить из вида примитива значение для аксессора (только parts[0])

  if (typeof primimtive === 'number') {
    return convertScientificNotationNumber(primimtive);
  }

  return '';
}

export function primimtiveToAccessor(primimtive: PrimitiveValue): Accessor {
  return accessorWithValue([primitiveToValue(primimtive)]);
}

export function parseValue(value: Accessor | PrimitiveValue): AccessorValue {
  if (isAccessor(value)) {
    return value[valueSymbol];
  } else {
    return { parts: [primitiveToValue(value)], variables: [] };
  }
}

export function accessor(): AccessorCollector {
  const accProxy = new Proxy(
    {},
    {
      get(target, property) {
        return Object.create(universal.prototype, {
          [valueSymbol]: {
            value: { parts: [0], variables: [property] },
          },
        });
      },
    }
  );

  return accProxy;
}
