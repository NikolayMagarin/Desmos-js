export type dType = 'number' | 'point' | 'array';

export type Variable<T extends dType = dType> = {
  number: NumberVariable;
  point: PointVariable;
  array: ArrayVariable;
}[T];

export interface NumberVariable {
  type: 'number'; // Мб сделать `Symbol('type')`?
}

export interface PointVariable {
  type: 'point';
}

export interface ArrayVariable {
  type: 'array';
}

export type VariableDefiner<T extends dType = dType> = {
  [key: string]: any;
  // [key: string]: Variable<T>;
};

export interface ParsedValue {
  parts: (number | string)[];
  variables: string[];
}
