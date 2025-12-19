import { accessorWithValue, parseValue } from './accessor';
import { Accessor, PrimitiveValue, valueSymbol } from './types';

export function init(universal = function () {}) {
  universal.prototype.eq = function (value: Accessor | PrimitiveValue) {
    const thisVal = (this as Accessor)[valueSymbol];
    const val = parseValue(value);

    const parts: (string | number)[] = [];
    const variables: string[] = [];

    thisVal.parts.forEach((part) => parts.push(part));
    parts.push('=');
    val.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisVal.variables.length : part
      )
    );
    thisVal.variables.forEach((variable) => variables.push(variable));
    val.variables.forEach((variable) => variables.push(variable));

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.ne = function (value: Accessor | PrimitiveValue) {
    const thisVal = (this as Accessor)[valueSymbol];
    const val = parseValue(value);

    const parts: (string | number)[] = ['\\left\\{'];
    const variables: string[] = [];

    thisVal.parts.forEach((part) => parts.push(part));
    parts.push('=');
    val.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisVal.variables.length : part
      )
    );
    parts.push(',0\\right\\}=0');
    thisVal.variables.forEach((variable) => variables.push(variable));
    val.variables.forEach((variable) => variables.push(variable));

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.lt = function (value: Accessor | PrimitiveValue) {
    const thisVal = (this as Accessor)[valueSymbol];
    const val = parseValue(value);

    const parts: (string | number)[] = [];
    const variables: string[] = [];

    thisVal.parts.forEach((part) => parts.push(part));
    parts.push('<');
    val.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisVal.variables.length : part
      )
    );
    thisVal.variables.forEach((variable) => variables.push(variable));
    val.variables.forEach((variable) => variables.push(variable));

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.gt = function (value: Accessor | PrimitiveValue) {
    const thisVal = (this as Accessor)[valueSymbol];
    const val = parseValue(value);

    const parts: (string | number)[] = [];
    const variables: string[] = [];

    thisVal.parts.forEach((part) => parts.push(part));
    parts.push('>');
    val.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisVal.variables.length : part
      )
    );
    thisVal.variables.forEach((variable) => variables.push(variable));
    val.variables.forEach((variable) => variables.push(variable));

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.le = function (value: Accessor | PrimitiveValue) {
    const thisVal = (this as Accessor)[valueSymbol];
    const val = parseValue(value);

    const parts: (string | number)[] = [];
    const variables: string[] = [];

    thisVal.parts.forEach((part) => parts.push(part));
    parts.push('\\le ');
    val.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisVal.variables.length : part
      )
    );
    thisVal.variables.forEach((variable) => variables.push(variable));
    val.variables.forEach((variable) => variables.push(variable));

    return accessorWithValue({ parts, variables });
  };

  universal.prototype.ge = function (value: Accessor | PrimitiveValue) {
    const thisVal = (this as Accessor)[valueSymbol];
    const val = parseValue(value);

    const parts: (string | number)[] = [];
    const variables: string[] = [];

    thisVal.parts.forEach((part) => parts.push(part));
    parts.push('\\ge ');
    val.parts.forEach((part) =>
      parts.push(
        typeof part === 'number' ? part + thisVal.variables.length : part
      )
    );
    thisVal.variables.forEach((variable) => variables.push(variable));
    val.variables.forEach((variable) => variables.push(variable));

    return accessorWithValue({ parts, variables });
  };
}
