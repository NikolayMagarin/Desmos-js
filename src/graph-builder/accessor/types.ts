export type AccessorType = 'number' | 'point';
export const isAccessorSymbol = Symbol('isAccessor');
export const valueSymbol = Symbol('value');

export function isAccessor(obj: any): obj is Accessor {
  return (
    typeof obj === 'object' && obj !== null && obj[isAccessorSymbol] === true
  );
}

export interface AccessorValue {
  parts: (number | string)[];
  variables: string[];
}

export interface BaseAccessor {
  [isAccessorSymbol]: true;
  [valueSymbol]: AccessorValue;
}

export type PrimitiveNumber = number;
export type PrimitivePoint = {
  x: NumberAccessor | PrimitiveNumber;
  y: NumberAccessor | PrimitiveNumber;
};
export type PrimitiveArray = Array<Accessor | PrimitiveNumber | PrimitivePoint>;
export type PrimitiveValue = PrimitiveNumber | PrimitivePoint | PrimitiveArray;

type NumberArithmeticFunc = (
  value: NumberAccessor | PrimitiveNumber
) => NumberAccessor;

type PointArithmeticFunc = (
  value:
    | PointAccessor
    | {
        x: NumberAccessor | PrimitiveNumber;
        y: NumberAccessor | PrimitiveNumber;
      }
) => PointAccessor;

// Вообще массивы можно складывать c числами и точками...
type ArrayArithmeticFunc = (
  value: ArrayAccessor | PrimitiveArray
) => ArrayAccessor;

export interface NumberAccessor extends BaseAccessor {
  plus: NumberArithmeticFunc;
  minus: NumberArithmeticFunc;
  times: NumberArithmeticFunc;
  over: NumberArithmeticFunc;
}

export interface PointAccessor extends BaseAccessor {
  plus: PointArithmeticFunc;
  minus: PointArithmeticFunc;
  times: PointArithmeticFunc;
  over: PointArithmeticFunc;
  x: NumberAccessor;
  y: NumberAccessor;
}

export interface ArrayAccessor extends BaseAccessor {
  plus: ArrayArithmeticFunc;
  minus: ArrayArithmeticFunc;
  times: ArrayArithmeticFunc;
  over: ArrayArithmeticFunc;
}

export type Accessor = NumberAccessor & PointAccessor & ArrayAccessor;

export type AccessorCollector = {
  [k: string]: Accessor;
};
