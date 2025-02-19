export type AccessorType = 'number' | 'point';
export const isAccessorSymbol = Symbol('isAccessor');
export const valueSymbol = Symbol('value');
export const lastOperatorSymbol = Symbol('lastOperator');

export function isAccessor(obj: any): obj is Accessor {
  return (
    typeof obj === 'object' && obj !== null && obj[isAccessorSymbol] === true
  );
}

export interface AccessorValue {
  parts: (number | string)[];
  variables: string[];
  lastOperator?: ArithmeticOperator;
}

export enum ArithmeticOperator {
  PLUS,
  MINUS,
  TIMES,
  OVER,
  POW,
}

export interface BaseAccessor {
  [isAccessorSymbol]: true;
  [valueSymbol]: AccessorValue;
}

export type PrimitiveNumber = number;
export type PrimitivePoint = {
  x: NumberAccessor | ArrayAccessor | PrimitiveNumber | PrimitiveArray;
  y: NumberAccessor | ArrayAccessor | PrimitiveNumber | PrimitiveArray;
};
export type PrimitiveArray = Array<Accessor | PrimitiveNumber | PrimitivePoint>;
export type PrimitiveValue = PrimitiveNumber | PrimitivePoint | PrimitiveArray;

type ArithmeticFunc = (value: Accessor | PrimitiveValue) => Accessor;

export interface NumberAccessor extends BaseAccessor {
  plus: ArithmeticFunc;
  minus: ArithmeticFunc;
  times: ArithmeticFunc;
  over: ArithmeticFunc;
  pow: ArithmeticFunc;
}

export interface PointAccessor extends BaseAccessor {
  plus: ArithmeticFunc;
  minus: ArithmeticFunc;
  times: ArithmeticFunc;
  over: ArithmeticFunc;
  pow: ArithmeticFunc;
  x: NumberAccessor | ArrayAccessor;
  y: NumberAccessor | ArrayAccessor;
}

export interface ArrayAccessor extends BaseAccessor {
  plus: ArithmeticFunc;
  minus: ArithmeticFunc;
  times: ArithmeticFunc;
  over: ArithmeticFunc;
  pow: ArithmeticFunc;
  length: NumberAccessor;
}

export type Accessor = NumberAccessor & PointAccessor & ArrayAccessor;

export type AccessorCollector = {
  [k: string]: Accessor;
};
