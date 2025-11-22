import { CompileError } from '../erorrs';
import { parser } from './parser';
import { Scope } from './types';

export function registerVariable(varName: string) {
  parser.currentScope.variableId.set(varName, parser.variableCounter);
  parser.variableCounter++;
}

export function openScope() {
  parser.currentScope = {
    parentScope: parser.currentScope,
    variableId: new Map(),
  };
}

export function closeScope() {
  if (parser.currentScope.parentScope !== null) {
    parser.currentScope = parser.currentScope.parentScope;
  } else {
    // Нельзя закрыть корневой скоуп
    throw new CompileError('The root scope cannot be closed');
  }
}

export function withScope(expressions: () => void) {
  const scope = {
    parentScope: parser.currentScope,
    variableId: new Map(),
  };
  parser.currentScope = scope;

  expressions();

  parser.currentScope = scope.parentScope;
}

export function getVariableIdRecursively(
  scope: Scope,
  varName: string
): number | undefined {
  let curScope = scope;
  let result = curScope.variableId.get(varName);

  while (typeof result === 'undefined' && curScope.parentScope !== null) {
    curScope = curScope.parentScope;
    result = curScope.variableId.get(varName);
  }

  if (typeof result === 'undefined') {
    // Переменная не найдена
    throw new CompileError(`${varName} is not defined`);
  }

  return result;
}
