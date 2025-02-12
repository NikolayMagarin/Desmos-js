export type LatexExpression = string;

export interface GeneralExpression {
  type: 'expression';
  id: string;
  folderId?: string; // if defined, expression must follow right after folder
  color?: string;
  colorLatex?: LatexExpression;
  latex?: LatexExpression;
  hidden?: true;

  // =, <, >, >=, <=, polygon
  lines?: boolean;
  lineStyle?: 'SOLID' | 'DASHED' | 'DOTTED';
  lineOpacity?: LatexExpression;
  lineWidth?: LatexExpression;

  // polygon
  fill?: boolean;
  fillOpacity?: LatexExpression;

  // point
  pointStyle?: 'OPEN' | 'CROSS';
  pointOpacity?: LatexExpression;
  pointSize?: LatexExpression;
  movableSize?: LatexExpression; // always equals `pointSize`?
  dragMode?: 'NONE' | 'X' | 'Y' | 'XY';
  showLabel?: true;
  label?: string;
  labelSize?: LatexExpression;
  labelAngle?: LatexExpression;
  labelOrientation?:
    | 'right'
    | 'above_right'
    | 'above'
    | 'above_left'
    | 'left'
    | 'below_left'
    | 'below'
    | 'below_right';

  clickableInfo?: {
    enabled: true;
    latex?: LatexExpression;
  };

  // regression
  residualVariable?: LatexExpression;
  regressionParameters?: Record<LatexExpression, number>;

  // data visualizators
  vizProps?: {
    // boxplot
    breadth?: LatexExpression;
    axisOffset?: LatexExpression;
    showBoxplotOutliers?: false;

    // dotplot
    dotplotXMode?: 'bin';

    // histogram
    histogramMode?: 'relative' | 'density'; // 'number' by default?

    // histogram, dotplot
    binAligment?: 'left'; // 'center' by default?
  };

  // parametric
  parametricDomain?: {
    min: LatexExpression;
    max: LatexExpression;
  };
  // idk whats difference between parametricDomain and domain
  domain?: {
    min: LatexExpression;
    max: LatexExpression;
  };

  slider?: Slider;
}

export interface FolderExpression {
  type: 'folder';
  id: string;
  title?: string;
  hidden?: true;
  collapsed?: true;
}

export interface TextExpression {
  type: 'text';
  id: string;
  text?: string;
  folderId?: string; // if defined, expression must follow right after folder
}

export interface TableExpression {
  type: 'table';
  id: string;
  folderId?: string; // if defined, expression must follow right after folder
  columns: (GeneralExpression & { values: LatexExpression[] })[];
}

export interface ImageExpression {
  type: 'image';
  id: string;
  folderId?: string; // if defined, expression must follow right after folder,
  image_url: string;
  name: string;

  center?: LatexExpression;
  angle?: LatexExpression;
  width?: LatexExpression;
  height?: LatexExpression;
  opacity?: LatexExpression;

  foreground?: true;
  draggable?: true;

  clickableInfo?: {
    enabled: true;
    latex?: LatexExpression;
    hoveredImage?: string;
    depressedImage?: string;
  };
}

export type Expression =
  | GeneralExpression
  | FolderExpression
  | TextExpression
  | TableExpression
  | ImageExpression;

export interface Ticker {
  handlerLatex: LatexExpression;
  minStepLatex: LatexExpression;
  playing: boolean;
  open: true;
}

export interface Slider {
  hardMin: boolean;
  hardMax: boolean;
  min: LatexExpression;
  max: LatexExpression;
  step: LatexExpression;
  loopMode?: 'LOOP_FORWARD' | 'PLAY_ONCE' | 'PLAY_INDEFINITELY'; // 'LOOP_FORWARD_BACKWARD' by default?
  animationPeriod?:
    | 80_000
    | 40_000
    | 26_666.6666666666666666
    | 20_000
    | 11_428.57142857143
    | 8_000
    | 5_333.3333333333333333
    | 2_666.6666666666666666
    | 2_000
    | 1_142.857142857143
    | 800
    | 533.3333333333333333
    | 400
    | 266.6666666666666666
    | 200;
  playDirection?: -1;
  isPlaying?: true;
}

export interface State {
  version: 11;
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
  expressions: {
    list: Expression[];
    ticker?: Ticker;
  };
  includeFunctionParametersInRandomSeed: boolean;
  doNotMigrateMovablePointStyle: boolean;
}
