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
  additionalParams?: AdditionalParams;
}

export enum ArithmeticOperator {
  PLUS,
  MINUS,
  TIMES,
  OVER,
  POW,
}

export interface AdditionalParams {
  functionArgumentNames?: string[];
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
export type PrimitiveFunction = (
  ...args: Accessor[]
) => Accessor | PrimitiveValue;
export type PrimitiveAction = 2;

export type PrimitiveValue =
  | PrimitiveNumber
  | PrimitivePoint
  | PrimitiveArray
  | PrimitiveFunction;

type ArithmeticFunc = (value: Accessor | PrimitiveValue) => Accessor;
type UpdateFunc = (value: Accessor | PrimitiveValue) => Accessor;

type ArrayGetValueFunc = (
  ...indexes: (Accessor | PrimitiveValue)[]
) => NumberAccessor | PointAccessor;
type ArrayJoinFunc = (
  ...values: (Accessor | PrimitiveValue)[]
) => ArrayAccessor;
type ArrayRandomFunc = (
  size?: NumberAccessor | PrimitiveNumber
) => ArrayAccessor;
type ArraySortFunc = (
  features?: ArrayAccessor | PrimitiveArray
) => ArrayAccessor;
type ArrayUniqueFunc = () => ArrayAccessor;
type ArrayShuffleFunc = () => ArrayAccessor;

export interface NumberAccessor extends BaseAccessor {
  plus: ArithmeticFunc;
  minus: ArithmeticFunc;
  times: ArithmeticFunc;
  over: ArithmeticFunc;
  pow: ArithmeticFunc;
  to: UpdateFunc;
}

export interface PointAccessor extends BaseAccessor {
  plus: ArithmeticFunc;
  minus: ArithmeticFunc;
  times: ArithmeticFunc;
  over: ArithmeticFunc;
  pow: ArithmeticFunc;
  x: NumberAccessor | ArrayAccessor;
  y: NumberAccessor | ArrayAccessor;
  to: UpdateFunc;
}

export interface ArrayAccessor extends BaseAccessor {
  plus: ArithmeticFunc;
  minus: ArithmeticFunc;
  times: ArithmeticFunc;
  over: ArithmeticFunc;
  pow: ArithmeticFunc;
  length: NumberAccessor;
  to: UpdateFunc;
  get: ArrayGetValueFunc;
  join: ArrayJoinFunc;
  random: ArrayRandomFunc;
  sort: ArraySortFunc;
  unique: ArrayUniqueFunc;
  shuffle: ArrayShuffleFunc;
}

export interface FunctionAccessor extends BaseAccessor {
  call: (...args: (Accessor | PrimitiveValue)[]) => Accessor;
}

export interface ActionAccessor extends BaseAccessor {
  //
}

export type Accessor = NumberAccessor &
  PointAccessor &
  ArrayAccessor &
  FunctionAccessor;

export type AccessorCollector = {
  [k: string]: Accessor;
};

// TODO
// Добавить типы: Polygon, Color, Distribution ...
// Также добавить условия а значит методы для isEqual isGreater и тд, которые будут возвращать новый тип Condition,
// который можно закидывать в условие типа: Record<ConditionAccessor | 'default', Accessor>
