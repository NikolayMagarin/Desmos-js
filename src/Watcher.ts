import { ChildProcess, exec } from 'child_process';
import fs, { existsSync } from 'fs';
import { stderr, stdout } from 'process';
import chokidar from 'chokidar';
import kill from 'tree-kill';

export class Watcher {
  private entryPoint: string;
  private subprocess: ChildProcess | null = null;
  private useTypescript: boolean = false;
  private isKilling: boolean = false;
  private restartPending: boolean = false;
  private graphPath: string = '';
  private compileCallback: () => void = () => {};

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
    this.graphPath = graphPath;
    this.compileCallback = compileCallback;

    if (watchDirectory) {
      if (existsSync(watchDirectory)) {
        chokidar
          .watch(watchDirectory, { persistent: true, ignoreInitial: true })
          .on('all', () => {
            this.compile(graphPath, compileCallback);
          });
      } else {
        console.error(
          new Error(`Cannot find watch directory: "${watchDirectory}"`)
        );
      }
    }

    this.compile(graphPath, compileCallback);
  }

  public async compile(graphPath: string, callback: () => void) {
    if (!fs.existsSync(this.entryPoint)) {
      console.error(new Error(`Cannot find entry point: "${this.entryPoint}"`));
      return;
    }

    if (this.isKilling) {
      this.restartPending = true;
      return;
    }

    if (this.subprocess) {
      await this.killSubprocess();
    }

    this.startSubprocess(graphPath, callback);
  }

  private async killSubprocess(): Promise<void> {
    if (!this.subprocess || !this.subprocess.pid) return;

    return new Promise((resolve) => {
      this.isKilling = true;
      const pid = this.subprocess!.pid!;

      this.subprocess!.stdout?.unpipe(stdout);
      this.subprocess!.stderr?.unpipe(stderr);

      kill(pid, 'SIGINT', (err) => {
        if (err) {
          console.error('Error killing process:', err);

          kill(pid, 'SIGKILL', (killErr) => {
            if (killErr) {
              console.error('Error force killing process:', killErr);
            }
            this.cleanupSubprocess();
            resolve();
          });
        } else {
          this.cleanupSubprocess();
          resolve();
        }
      });
    });
  }

  private cleanupSubprocess() {
    this.subprocess = null;
    this.isKilling = false;

    if (this.restartPending) {
      this.restartPending = false;

      this.compile(this.graphPath, this.compileCallback);
    }
  }

  private startSubprocess(graphPath: string, callback: () => void) {
    const startTime = performance.now();

    this.subprocess = exec(
      `${this.useTypescript ? 'npx ts-node' : 'node'} ${this.entryPoint}${
        this.useTypescript ? ' --' : ''
      } ${graphPath}`,
      (error) => {
        if (this.isKilling) {
          return;
        }
        if (error === null) {
          console.log(
            `Recompiled in ${Math.round(performance.now() - startTime)} ms`
          );
          callback();
        } else if (error.signal !== 'SIGINT') {
          console.error('Process error:', error);
        }

        if (this.subprocess && this.subprocess.exitCode !== null) {
          this.cleanupSubprocess();
        }
      }
    );

    this.subprocess.stdout?.pipe(stdout);
    this.subprocess.stderr?.pipe(stderr);
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
