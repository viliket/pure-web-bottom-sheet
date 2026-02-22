import type { Options } from "@wdio/types";
import os from "os";
import ManagedProcessService, {
  ManagedProcessConfig,
} from "./test/support/wdio-managed-process-service";

const yn = (value: string | undefined) => value === "true";
const when = <T>(condition: boolean, value: T): T[] =>
  condition ? [value] : [];

declare global {
  namespace WebdriverIO {
    interface Capabilities {
      "webkitgtk:browserOptions"?: {
        binary?: string;
        args?: string[];
      };
      specs?: (string | string[])[];
    }
  }
}

const devServerPort = Number(process.env.DEV_SERVER_PORT) || 4321;
const baseUrl =
  process.env.BASE_URL ||
  `http://localhost:${devServerPort}/pure-web-bottom-sheet/`;
const webkitDriverPort = Number(process.env.WEBKIT_DRIVER_PORT) || 4444;

const browsers = new Set(
  process.env.BROWSERS
    ? process.env.BROWSERS.split(",").map((b) => b.trim().toLowerCase())
    : ["chrome", "firefox", "minibrowser"],
);
const headless = yn(process.env.CI) || yn(process.env.HEADLESS);

if (headless && browsers.has("firefox")) {
  // See https://firefox-source-docs.mozilla.org/remote/Testing.html
  process.env.MOZ_HEADLESS_WIDTH = "1280";
  process.env.MOZ_HEADLESS_HEIGHT = "800";
}

export const config: Options.Testrunner & {
  capabilities: WebdriverIO.Capabilities[];
} = {
  runner: "local",
  specs: ["./test/specs/**/*.ts"],
  exclude: [],
  maxInstances: 10,
  capabilities: [
    ...when<WebdriverIO.Capabilities>(browsers.has("chrome"), {
      browserName: "chrome",
      webSocketUrl: true,
      "goog:chromeOptions": {
        args: [
          ...when(headless, "headless"),
          "disable-gpu",
          "window-size=1280,800",
        ],
      },
    }),
    ...when<WebdriverIO.Capabilities>(browsers.has("firefox"), {
      browserName: "firefox",
      webSocketUrl: true,
      "moz:firefoxOptions": {
        args: [...when(headless, "-headless")],
      },
    }),
    ...when<WebdriverIO.Capabilities>(browsers.has("safari"), {
      browserName: "safari",
      // Safari WebDriver only supports a single session at a time
      // https://developer.apple.com/documentation/webkit/about-webdriver-for-safari#One-Session-at-a-Time-to-Mimic-User-Interaction
      "wdio:maxInstances": 1,
      specs: [
        // Group test specs to run sequentially on Safari since it only supports
        // a single instance to avoid the overhead of restarting the browser between
        // spec files
        ["./test/specs/**/*.ts"],
      ],
    }),
    ...when<WebdriverIO.Capabilities>(browsers.has("minibrowser"), {
      browserName: "MiniBrowser",
      // Enforce WebDriver Classic mode because WebKitGTK's WebDriver BiDi implementation
      // is not complete yet
      "wdio:enforceWebDriverClassic": true,
      hostname: "localhost",
      port: webkitDriverPort,
      // MiniBrowser only supports a single session at a time
      "wdio:maxInstances": 1,
      specs: [
        // Group test specs to run sequentially on MiniBrowser since it only supports
        // a single instance to avoid the overhead of restarting the browser between
        // spec files
        ["./test/specs/**/*.ts"],
      ],
      "webkitgtk:browserOptions": {
        binary: `/usr/lib/${os.machine()}-linux-gnu/webkit2gtk-4.1/MiniBrowser`,
        args: ["--automation"],
      },
    }),
  ],
  logLevel: "info",
  bail: 0,
  baseUrl,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    [
      ManagedProcessService,
      {
        processes: [
          ...when<ManagedProcessConfig>(!process.env.BASE_URL, {
            name: "Dev server",
            command: "npm",
            args: [
              "run",
              "dev",
              "-w",
              "examples/astro",
              "--",
              `--port ${devServerPort}`,
            ],
            port: devServerPort,
            waitResource: baseUrl,
          }),
          ...when<ManagedProcessConfig>(browsers.has("minibrowser"), {
            name: "WebKitWebDriver",
            command: "WebKitWebDriver",
            args: ["-p", `${webkitDriverPort}`],
            port: webkitDriverPort,
            waitResource: `tcp:${webkitDriverPort}`,
          }),
        ],
      },
    ],
  ],
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  async before(_capabilities, _specs, browser) {
    const { addCustomMatchers } = await import("./test/support/matchers");
    addCustomMatchers();
    const { addCustomCommands } = await import("./test/support/commands");
    addCustomCommands();
    const { addBrowserFlags } = await import("./test/support/browser-flags");
    addBrowserFlags();

    browser.setWindowSize(1280, 800);
  },
};
