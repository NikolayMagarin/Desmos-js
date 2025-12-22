import { accessorWithValue } from './accessor';
import { Accessor } from './types';

export interface Constants {
  X: Accessor;
  Y: Accessor;
  PI: Accessor;
  E: Accessor;
}

export const constants: Constants = {
  X: accessorWithValue({ parts: ['x'], variables: [] }),
  Y: accessorWithValue({ parts: ['y'], variables: [] }),
  PI: accessorWithValue({ parts: ['\\pi'], variables: [] }),
  E: accessorWithValue({ parts: ['e'], variables: [] }),
};
