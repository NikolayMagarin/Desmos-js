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
import { init as enableProperties } from './properties';
import { init as enableMethods } from './methods';
import { primitiveToValue } from './primitives';

export const universal = function () {};
universal.prototype[isAccessorSymbol] = true;
universal.prototype[valueSymbol] = {
  parts: [],
  variables: [],
};

enableArithmetics(universal);
enableProperties(universal);
enableMethods(universal);

export function optimizeValueParts(parts: (number | string)[]) {
  const optimized: (number | string)[] = [];
  let lastSequence = '';

  parts.forEach((part) => {
    if (typeof parts === 'number') {
      optimized.push(lastSequence, part);
      lastSequence = '';
    } else {
      lastSequence += part;
    }
  });

  if (lastSequence.length) {
    optimized.push(lastSequence);
  }

  return optimized;
}

export function accessorWithValue(value: AccessorValue): Accessor {
  return Object.create(universal.prototype, {
    [valueSymbol]: {
      value: {
        ...value,
        // parts: optimizeValueParts(value.parts), // уменьшает количество элементов в parts если возможно
      },
    },
  });
}

export function primimtiveToAccessor(
  primimtive: PrimitiveValue | Accessor
): Accessor {
  return isAccessor(primimtive)
    ? primimtive
    : accessorWithValue(primitiveToValue(primimtive));
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
        // TODO: optimize
        // Каждый новый объект, который здесь создается отличается от других только значением value.variables
        // Возможно есть смысл кэшировать эти объекты, чтобы на часто используемые переменные не создавать объекты много раз
        // UPD: Вернувшись в проект через несколько месяцев, я уже не помню, почему решил что Object.create медленный
        return Object.create(universal.prototype, {
          [valueSymbol]: {
            value: { parts: [0], variables: [property] },
          },
        });
      },
    }
  );
}
