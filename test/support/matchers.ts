declare global {
  namespace ExpectWebdriverIO {
    interface Matchers<R, T> {
      toHaveScrollTopRelativeToHeight(
        expectedFraction: number,
        options?: { tolerance?: number; timeout?: number },
      ): Promise<R>;
    }
  }
}

type WdioElementMaybePromise = WebdriverIO.Element | ChainablePromiseElement;

export function addCustomMatchers() {
  expect.extend({
    async toHaveScrollTopRelativeToHeight(
      received: WdioElementMaybePromise,
      expectedFraction: number,
      options: { tolerance?: number; timeout?: number } = {},
    ) {
      const { tolerance = 1, timeout = 5000 } = options;
      let scrollTop = 0;
      let clientHeight = 0;
      let expectedScrollTop = 0;

      const element = await received?.getElement();

      const pass = await browser
        .waitUntil(
          async () => {
            scrollTop = (await element.getProperty("scrollTop")) as number;
            clientHeight = (await element.getProperty(
              "clientHeight",
            )) as number;
            expectedScrollTop = clientHeight * expectedFraction;
            return Math.abs(scrollTop - expectedScrollTop) <= tolerance;
          },
          { timeout, interval: 100 },
        )
        .catch(() => false);

      const actualFraction = clientHeight > 0 ? scrollTop / clientHeight : 0;
      const not = this.isNot ? "not " : "";

      return {
        pass,
        message: () =>
          `Expected scrollTop ${not}to be ${expectedFraction} of clientHeight (${expectedScrollTop.toFixed(1)}px of ${clientHeight}px)\n` +
          `Received: ${scrollTop.toFixed(1)}px (${actualFraction.toFixed(2)})\n` +
          `Tolerance: ±${tolerance}px`,
      };
    },
  });
}
