import { parseValue } from '../accessor/accessor';
import { Accessor, PrimitiveValue } from '../accessor/types';
import { parser } from '../builder/parser';
import { closeScope, openScope, registerVariable } from '../builder/scoping';
import { ParsedExpression, Scope } from '../builder/types';
import { CompileError } from '../erorrs';

export function onVariableDefine(name: string, val: Accessor | PrimitiveValue) {
  if (parser.currentScope.variableId.has(name)) {
    // Дублирование переменной в скоупе
    throw new CompileError(`Variable ${name} has already been defined`);
  } else {
    registerVariable(name);

    const { parts, variables, additionalParams } = parseValue(val);

    // Объявление локальных переменных для функций
    let localScope: Scope | undefined;
    if (additionalParams?.functionArgumentNames?.length) {
      openScope();

      additionalParams.functionArgumentNames.forEach((argName) =>
        registerVariable(argName)
      );

      localScope = parser.currentScope;

      closeScope();
    }

    const expression: ParsedExpression = {
      scope: parser.currentScope,
      name: name,
      parts: parts,
      variables: variables,
      params: { ...additionalParams, ...{ localScope } },
    };

    parser.expressions.general.push(expression);
  }
}
