declare global {
  namespace WebdriverIO {
    interface Browser {
      /**
       * Flag indicating whether the current browser is a WebKit-based browser
       * (e.g., Safari or WebkitGTK MiniBrowser).
       */
      isWebKit: boolean;
    }
  }
}

export function addBrowserFlags() {
  const browserName = (browser.capabilities.browserName ?? "").toLowerCase();
  browser.isWebKit = ["safari", "minibrowser"].includes(browserName);
}
