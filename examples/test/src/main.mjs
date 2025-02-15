import { graphBuilder as gb } from '../../../dist/graph-builder/graphBuilder.js';
// import { value } from './expr.mjs';

const { definer: def, accessor: _, converter: $ } = gb;

// def.a = [_.b.plus(_.c)];
def.a = [1, _.b.over(_.c.plus($(3).times(_.c))), 2, 3, _.c.plus(_.b), 1534];

def.b = $(2).over(_.c.plus(3));

def.c = 100;

def.point = { x: 0, y: 0 };
