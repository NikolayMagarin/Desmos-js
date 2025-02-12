import { PrimitiveValue, Accessor } from '../accessor/types';
import { VariableDefiner } from './types';

export function definer(
  onDefine: (name: string, val: Accessor | PrimitiveValue) => void
) {
  return defaultDefiner(onDefine);
}

export function defaultDefiner(
  onDefine: (name: string, val: Accessor | PrimitiveValue) => void
): VariableDefiner {
  return new Proxy(
    {},
    {
      set(target, name, val) {
        onDefine(name as string, val);
        return true;
      },
    }
  );
}
