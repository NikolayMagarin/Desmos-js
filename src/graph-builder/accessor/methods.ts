import { ParseError } from '../erorrs';
import { accessorWithValue, parseValue } from './accessor';
import { operatorPriority } from './arithmetics';
import { primitiveToValue } from './primitives';
import {
  Accessor,
  AccessorValue,
  ArrayAccessor,
  isAccessor,
  NumberAccessor,
  PrimitiveArray,
  PrimitiveNumber,
  PrimitiveValue,
  valueSymbol,
} from './types';

export function init(universal = function () {}) {
  universal.prototype.call = function (
    ...args: (Accessor | PrimitiveValue)[]
  ): Accessor {
    const thisVal = (this as Accessor)[valueSymbol];

    if (
      thisVal.parts.length !== 1 ||
      thisVal.parts[0] !== 0 ||
      thisVal.variables.length !== 1
    ) {
      throw new ParseError('Inline function call is not supported');
    }

    const parts: (number | string)[] = [0, '\\left('];
    const variables: string[] = [(this as Accessor)[valueSymbol].variables[0]];

    args.forEach((el) => {
      const val = isAccessor(el) ? el[valueSymbol] : primitiveToValue(el);

      val.parts.forEach((part) => {
        if (typeof part === 'number') {
          parts.push(variables.length);
          variables.push(val.variables[part]);
        } else {
          parts.push(part);
        }
      });
      parts.push(',');
    });

    if (parts[parts.length - 1] === ',') {
      parts.pop();
    }

    parts.push('\\right)');

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.to = function (
    newVal: Accessor | PrimitiveValue
  ): Accessor {
    const thisValue = (this as Accessor)[valueSymbol];

    if (
      thisValue.parts.length !== 1 ||
      thisValue.parts[0] !== 0 ||
      thisValue.variables.length !== 1
    ) {
      throw new ParseError('Only variables can be changed, not expressions');
    }

    const newValue = isAccessor(newVal)
      ? newVal[valueSymbol]
      : primitiveToValue(newVal);

    const parts: (number | string)[] = [0, '\\to '];
    const variables: string[] = [thisValue.variables[0]];

    newValue.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisValue.variables.length : part
      )
    );

    newValue.variables.forEach((variable) => variables.push(variable));

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.get = function (...index: (Accessor | PrimitiveValue)[]) {
    const thisValue = (this as Accessor)[valueSymbol];

    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
    };

    const needBrackets =
      thisValue.lastOperator !== undefined &&
      operatorPriority[thisValue.lastOperator] < 2;

    if (needBrackets) resultValue.parts.push('\\left(');
    thisValue.parts.forEach((part) => resultValue.parts.push(part));
    if (needBrackets) resultValue.parts.push('\\right)');

    thisValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    resultValue.parts.push('\\left[');

    index.forEach((el) => {
      const val = isAccessor(el) ? el[valueSymbol] : primitiveToValue(el);

      val.parts.forEach((part) => {
        if (typeof part === 'number') {
          resultValue.parts.push(resultValue.variables.length);
          resultValue.variables.push(val.variables[part]);
        } else {
          resultValue.parts.push(part);
        }
      });
      resultValue.parts.push(',');
    });

    if (resultValue.parts[resultValue.parts.length - 1] === ',') {
      resultValue.parts.pop();
    }

    resultValue.parts.push('\\right]');

    return accessorWithValue(resultValue);
  };

  universal.prototype.join = function (
    ...values: (Accessor | PrimitiveValue)[]
  ) {
    const thisValue = (this as Accessor)[valueSymbol];

    const parts: (number | string)[] = ['\\operatorname{join}\\left('];
    const variables: string[] = [];

    thisValue.parts.forEach((part) => {
      if (typeof part === 'number') {
        parts.push(variables.length);
        variables.push(thisValue.variables[part]);
      } else {
        parts.push(part);
      }
    });
    parts.push(',');

    values.forEach((el) => {
      const val = isAccessor(el) ? el[valueSymbol] : primitiveToValue(el);

      val.parts.forEach((part) => {
        if (typeof part === 'number') {
          parts.push(variables.length);
          variables.push(val.variables[part]);
        } else {
          parts.push(part);
        }
      });
      parts.push(',');
    });

    if (parts[parts.length - 1] === ',') {
      parts.pop();
    }

    parts.push('\\right)');

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.random = function (
    size?: NumberAccessor | PrimitiveNumber
  ) {
    const thisValue = (this as Accessor)[valueSymbol];

    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
    };

    const needBrackets =
      thisValue.lastOperator !== undefined &&
      operatorPriority[thisValue.lastOperator] < 2;

    if (needBrackets) resultValue.parts.push('\\left(');
    thisValue.parts.forEach((part) => resultValue.parts.push(part));
    if (needBrackets) resultValue.parts.push('\\right)');

    thisValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    resultValue.parts.push('.\\operatorname{random}\\left(');

    if (size) {
      const sizeValue = isAccessor(size)
        ? size[valueSymbol]
        : primitiveToValue(size as PrimitiveNumber);

      sizeValue.parts.forEach((part) => {
        if (typeof part === 'number') {
          resultValue.parts.push(resultValue.variables.length);
          resultValue.variables.push(sizeValue.variables[part]);
        } else {
          resultValue.parts.push(part);
        }
      });
    }

    resultValue.parts.push('\\right)');

    return accessorWithValue(resultValue);
  };

  universal.prototype.sort = function (
    features?: ArrayAccessor | PrimitiveArray
  ) {
    const thisValue = (this as Accessor)[valueSymbol];

    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
    };

    const needBrackets =
      thisValue.lastOperator !== undefined &&
      operatorPriority[thisValue.lastOperator] < 2;

    if (needBrackets) resultValue.parts.push('\\left(');
    thisValue.parts.forEach((part) => resultValue.parts.push(part));
    if (needBrackets) resultValue.parts.push('\\right)');

    thisValue.variables.forEach((variable) =>
      resultValue.variables.push(variable)
    );

    resultValue.parts.push('.\\operatorname{sort}\\left(');

    if (features) {
      const featuresValue = isAccessor(features)
        ? features[valueSymbol]
        : primitiveToValue(features as PrimitiveArray);

      featuresValue.parts.forEach((part) => {
        if (typeof part === 'number') {
          resultValue.parts.push(resultValue.variables.length);
          resultValue.variables.push(featuresValue.variables[part]);
        } else {
          resultValue.parts.push(part);
        }
      });
    }

    resultValue.parts.push('\\right)');

    return accessorWithValue(resultValue);
  };

  universal.prototype.unique = function () {
    const value = (this as Accessor)[valueSymbol];
    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
    };
    if (value.lastOperator !== undefined) resultValue.parts.push('\\left(');
    value.parts.forEach((part) => resultValue.parts.push(part));
    if (value.lastOperator !== undefined) resultValue.parts.push('\\right)');
    resultValue.parts.push('.\\operatorname{unique}');

    value.variables.forEach((variable) => resultValue.variables.push(variable));

    return accessorWithValue(resultValue);
  };

  universal.prototype.shuffle = function () {
    const value = (this as Accessor)[valueSymbol];
    const resultValue: AccessorValue = {
      parts: [],
      variables: [],
    };
    if (value.lastOperator !== undefined) resultValue.parts.push('\\left(');
    value.parts.forEach((part) => resultValue.parts.push(part));
    if (value.lastOperator !== undefined) resultValue.parts.push('\\right)');
    resultValue.parts.push('.\\operatorname{shuffle}');

    value.variables.forEach((variable) => resultValue.variables.push(variable));

    return accessorWithValue(resultValue);
  };

  universal.prototype.elif = function (
    condition: Accessor,
    value?: Accessor | PrimitiveValue
  ) {
    const thisVal = (this as Accessor)[valueSymbol];
    const condVal = condition[valueSymbol];

    if (!thisVal.ifStatement) {
      throw new ParseError(
        'Elif statement must be used after the If statement'
      );
    }

    const parts = [...thisVal.parts];
    const variables = [...thisVal.variables];

    if (
      typeof parts[parts.length - 1] === 'string' &&
      (parts[parts.length - 1] as string).endsWith('\\right\\}')
    ) {
      if (parts[parts.length - 1] === '\\right\\}') {
        parts.pop();
      } else {
        parts[parts.length - 1] = (parts[parts.length - 1] as string).slice(
          0,
          -'\\right\\}'.length
        );
      }
    } else {
      throw new ParseError(
        'Elif statement must be used after the If statement'
      );
    }

    parts.push(',');

    condVal.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisVal.variables.length : part
      )
    );
    condVal.variables.forEach((variable) => variables.push(variable));

    if (value) {
      const val = parseValue(value);

      parts.push(':');

      val.parts.forEach((part) =>
        parts.push(typeof part === 'number' ? part + variables.length : part)
      );
      val.variables.forEach((variable) => variables.push(variable));
    }

    parts.push('\\right\\}');

    return accessorWithValue({ parts, variables, ifStatement: true });
  };

  universal.prototype.else = function (value: Accessor | PrimitiveValue) {
    const thisVal = (this as Accessor)[valueSymbol];

    if (!thisVal.ifStatement) {
      throw new ParseError(
        'Elif statement must be used after the If statement'
      );
    }

    const parts = [...thisVal.parts];
    const variables = [...thisVal.variables];

    if (
      typeof parts[parts.length - 1] === 'string' &&
      (parts[parts.length - 1] as string).endsWith('\\right\\}')
    ) {
      if (parts[parts.length - 1] === '\\right\\}') {
        parts.pop();
      } else {
        parts[parts.length - 1] = (parts[parts.length - 1] as string).slice(
          0,
          -'\\right\\}'.length
        );
      }
    } else {
      throw new ParseError(
        'Elif statement must be used after the If statement'
      );
    }

    parts.push(',');

    const val = parseValue(value);

    val.parts.forEach((part) =>
      parts.push(typeof part === 'number' ? part + variables.length : part)
    );
    val.variables.forEach((variable) => variables.push(variable));

    parts.push('\\right\\}');

    return accessorWithValue({ parts, variables });
  };
}
