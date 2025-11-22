import { exit } from 'process';

export class ParseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'Parse Error';

    // TODO: delete this shit
    console.error(`ERROR: ${this.name}: ${this.message}`);
    exit(1);
  }
}

export class CompileError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'Compile Error';

    // TODO: delete this shit
    console.error(`ERROR: ${this.name}: ${this.message}`);
    exit(1);
  }
}
