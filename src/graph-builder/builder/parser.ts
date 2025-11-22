import { ParsedExpression, Scope } from './types';

export const parser: {
  currentScope: Scope;
  variableCounter: number;
  expressions: {
    general: ParsedExpression[];
  };
} = {
  currentScope: { parentScope: null, variableId: new Map() },
  variableCounter: 0,
  expressions: {
    general: [],
    // А какие еще есть кроме general? Я забыл. Мб Ticker
  },
};
