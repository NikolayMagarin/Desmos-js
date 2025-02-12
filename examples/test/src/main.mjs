import { graphBuilder as gb } from '../../../dist/graph-builder/graphBuilder.js';
// import { value } from './expr.mjs';

const { definer: def, accessor: _, converter: $ } = gb;

def.b = 7;
def.res = _.b.times($(1).over(_.a));
def.a = 1000;

//

// number.b = $.a.plus(1);

// number.a = 1;

// point.B = { x: 4, y: 2 };

// point.A = { x: -4, y: $(-3).plus($.a) }; // Вызов $(-3) означает преобразование -3 в аксессор (возможно для этого лучше сделать отдельную функцию а не перегружать $)

// point.C = $.B.plus($({ x: 0, y: 1 }).plus($.A));
