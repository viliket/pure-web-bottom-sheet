import type { Options, Services } from "@wdio/types";
import { ChildProcess, spawn } from "child_process";
import waitOn from "wait-on";
import net from "net";

export interface ManagedProcessConfig {
  name: string;
  command: string;
  args: string[];
  port: number;
  waitResource: string;
}

export interface ManagedProcessServiceOptions extends Services.ServiceOption {
  processes?: ManagedProcessConfig[];
  waitTimeout?: number;
  waitInterval?: number;
}

export default class ManagedProcessService implements Services.ServiceInstance {
  #runningProcesses = new Map<string, ChildProcess>();
  #options: Required<ManagedProcessServiceOptions>;

  constructor(
    options: ManagedProcessServiceOptions,
    _capabilities: WebdriverIO.Capabilities,
    _config: Options.Testrunner,
  ) {
    this.#options = {
      processes: options.processes ?? [],
      waitTimeout: options.waitTimeout ?? 30000,
      waitInterval: options.waitInterval ?? 500,
    };

    process.once("exit", () => {
      this.stopAllProcesses();
    });
  }

  async onPrepare(): Promise<void> {
    try {
      const startedProcesses = await Promise.all(
        this.#options.processes.map(async (config) => ({
          config,
          started: await this.startProcess(config),
        })),
      );

      const resourcesToWait = startedProcesses
        .filter((s) => s.started)
        .map((s) => s.config.waitResource);

      if (resourcesToWait.length > 0) {
        console.log("Waiting for managed processes to be ready...");
        await waitOn({
          resources: resourcesToWait,
          timeout: this.#options.waitTimeout,
          interval: this.#options.waitInterval,
          validateStatus: (status) => status >= 200 && status < 400,
        });
        console.log("All managed processes are ready!");
      }
    } catch (err) {
      console.error("Managed processes failed to start:", err);
      this.stopAllProcesses();
      throw err;
    }
  }

  onComplete(): void {
    this.stopAllProcesses();
  }

  private async startProcess(config: ManagedProcessConfig): Promise<boolean> {
    if (await this.isPortInUse(config.port)) {
      console.log(
        `${config.name} already running on port ${config.port}, skipping...`,
      );
      return false;
    }

    console.log(`Starting ${config.name}...`);

    const proc = spawn(config.command, config.args, {
      stdio: "pipe",
      detached: true,
    });

    proc.stdout?.on("data", (data) => console.log(`[${config.name}]: ${data}`));
    proc.stderr?.on("data", (data) =>
      console.error(`[${config.name} error]: ${data}`),
    );

    this.#runningProcesses.set(config.name, proc);
    return true;
  }

  private stopAllProcesses(): void {
    if (this.#runningProcesses.size === 0) return;

    console.log("Stopping managed processes...");
    this.#runningProcesses.forEach((proc, name) => {
      if (proc.pid === undefined) return;

      try {
        process.kill(-proc.pid, "SIGTERM");
        console.log(`${name} stopped.`);
      } catch {
        try {
          process.kill(-proc.pid, "SIGKILL");
        } catch {}
      }
    });
    this.#runningProcesses.clear();
  }

  private isPortInUse(port: number, host = "localhost"): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = net
        .connect(port, host)
        .once("connect", () => {
          socket.destroy();
          resolve(true);
        })
        .once("error", () => {
          socket.destroy();
          resolve(false);
        });
    });
  }
}
