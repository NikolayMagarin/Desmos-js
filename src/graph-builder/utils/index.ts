import { withScope, openScope, closeScope } from '../builder/scoping';

export interface Utils {
  withScope: (expressions: () => void) => void;
  openScope: (expressions: () => void) => void;
  closeScope: (expressions: () => void) => void;
}

export const utils: Utils = {
  withScope,
  openScope,
  closeScope,
};
