import { ChildProcess, exec } from 'child_process';
import fs, { existsSync } from 'fs';
import { stdout } from 'process';

export class Watcher {
  private entryPoint: string;
  private subprocess: ChildProcess | null = null;
  private useTypescript: boolean = false;

  constructor({
    watchDirectory,
    entryPoint,
    graphPath,
    useTypescript,
    compileCallback,
  }: {
    watchDirectory?: string;
    entryPoint: string;
    graphPath: string;
    useTypescript?: boolean;
    compileCallback: () => void;
  }) {
    this.entryPoint = entryPoint;
    this.useTypescript = !!useTypescript;

    if (watchDirectory) {
      if (existsSync(watchDirectory)) {
        fs.watch(
          watchDirectory,
          { persistent: true, recursive: true },
          (eventType, filename) => {
            this.compile(graphPath, compileCallback);
          }
        );
      } else {
        console.error(
          new Error(`Cannot find watch directory: "${watchDirectory}"`)
        );
      }
    }

    this.compile(graphPath, compileCallback);
  }

  public compile(graphPath: string, callback: () => void) {
    if (fs.existsSync(this.entryPoint)) {
      if (this.subprocess) {
        this.subprocess.stdout?.unpipe(stdout);
        this.subprocess.kill('SIGINT');
        this.subprocess = null;
      } else {
        // console.log('Compilling...');
      }

      const startTime = performance.now();
      this.subprocess = exec(
        `${this.useTypescript ? 'npx ts-node' : 'node'} ${this.entryPoint}${
          this.useTypescript ? ' --' : ''
        } ${graphPath}`,
        (error) => {
          if (error === null) {
            console.log(
              `Recompilled in ${Math.round(performance.now() - startTime)} ms`
            );
            callback();
          } else if (error.signal !== 'SIGINT') {
            console.error(error);
          }

          this.subprocess = null;
        }
      );

      this.subprocess.stdout?.pipe(stdout);
    } else {
      console.error(new Error(`Cannot find entry point: "${this.entryPoint}"`));
    }
  }
}

export function createWatcher(
  watchDirectory: string,
  entryPoint: string,
  graphPath: string,
  useTypescript: boolean,
  compileCallback: () => void
) {
  return new Watcher({
    watchDirectory,
    entryPoint,
    graphPath,
    useTypescript,
    compileCallback,
  });
}
