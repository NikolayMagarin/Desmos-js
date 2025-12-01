import { type primitiveToAccessor, type accessor } from '../accessor/accessor';
import { FunctionCollector } from '../accessor/build-in-functions';
import { Operators } from '../accessor/operators';
import { AdditionalParams } from '../accessor/types';
import { type definer } from '../definer/definer';
import { Utils } from '../utils';

export interface GraphBuilder {
  definer: ReturnType<typeof definer>;
  accessor: ReturnType<typeof accessor>;
  converter: typeof primitiveToAccessor;
  functions: FunctionCollector;
  utils: Utils;
  operators: Operators;
}

export interface Scope {
  parentScope: Scope | null;
  variableId: Map<string, number>; // Порядковый номер переменной во всем приложении по ее имени в данном скоупе
}

export interface ParsedExpression {
  scope: Scope; // ссылка на область видимости
  name: string | null; // Оригинальное имя переменной или null, если в выражении не объявляется переменная а просто выполняется выражение
  parts: (number | string)[]; // Части выражения которые нужно склеить, string - уже в latex форме, number - порядковый номер переменной, использованной в этом выражении
  variables: string[]; // Имя использованной в выражении переменной по ее порядковому номеру в выражении
  params: ExpressionParams & AdditionalParams & ParseExpressionParams;
}

// Всякие дополнительные параметры выражений, типа натсройки слайдера и т.д.
export interface ExpressionParams {}

export interface ParseExpressionParams {
  localScope?: Scope;
}
/** 
export interface Folder {
  id: string;
  name: string;
  children: (Folder | Expression)[];
}

export interface Settings {
  randomSeed: string;
  graph: {
    viewport: {
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
    };
    showGrid: boolean;
    showXAxis: boolean;
    showYAxis: boolean;
    xAxisNumbers: boolean;
    yAxisNumbers: boolean;
    polarNumbers: boolean;
    userLockedViewport: boolean;
    squareAxes: boolean;
  };
  includeFunctionParametersInRandomSeed: boolean;
  doNotMigrateMovablePointStyle: boolean;
}

export interface GraphBuilderState {
  folders: Folder[];
  settings: Settings;
}
*/
