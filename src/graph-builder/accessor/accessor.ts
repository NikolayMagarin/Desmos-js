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
import { primitiveToValue } from './primitives';

export const universal = function () {};
universal.prototype[isAccessorSymbol] = true;
universal.prototype[valueSymbol] = {
  parts: [],
  variables: [],
};

enableArithmetics(universal);

export function accessorWithValue(value: AccessorValue): Accessor {
  return Object.create(universal.prototype, {
    [valueSymbol]: {
      value: value,
    },
  });
}

export function primimtiveToAccessor(primimtive: PrimitiveValue): Accessor {
  return accessorWithValue(primitiveToValue(primimtive));
}

export function parseValue(value: Accessor | PrimitiveValue): AccessorValue {
  if (isAccessor(value)) {
    return value[valueSymbol];
  } else {
    return primitiveToValue(value);
  }
}

export function accessor(): AccessorCollector {
  return new Proxy(
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
}
