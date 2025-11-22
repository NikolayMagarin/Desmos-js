import { PrimitiveValue, Accessor } from '../accessor/types';
import { onVariableDefine } from './onDefine';
import { VariableDefiner } from './types';

export function definer() {
  return defaultDefiner(onVariableDefine);
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
