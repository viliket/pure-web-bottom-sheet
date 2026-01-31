import { test, expect as baseExpect, Locator } from "@playwright/test";

const expect = baseExpect.extend({
  async toBeScrolledToPercentage(
    locator: Locator,
    targetPercent: number,
    options: { tolerance?: number; timeout?: number } = {},
  ) {
    const { tolerance = 1, timeout } = options;
    const assertionName = "toBeScrolledToPercentage";
    let scrollTop = 0;
    let clientHeight = 0;
    let target = 0;

    const pass = await baseExpect
      .poll(
        async () => {
          const result = await locator.evaluate((el) => ({
            scrollTop: el.scrollTop,
            clientHeight: el.clientHeight,
          }));
          scrollTop = result.scrollTop;
          clientHeight = result.clientHeight;
          target = clientHeight * (targetPercent / 100);
          return Math.abs(scrollTop - target) <= tolerance;
        },
        { timeout },
      )
      .toBe(true)
      .then(() => true)
      .catch(() => false);

    const actualPercent =
      clientHeight > 0 ? (scrollTop / clientHeight) * 100 : 0;

    return {
      name: assertionName,
      pass,
      expected: `${targetPercent}% (${target.toFixed(1)}px ±${tolerance}px)`,
      actual: `${actualPercent.toFixed(2)}% (${scrollTop.toFixed(1)}px)`,
      message: () =>
        pass
          ? `Expected scroll position not to be ${targetPercent}%, but it was`
          : `Expected scrollTop: ${target.toFixed(1)}px (${targetPercent}% of ${clientHeight}px)\n` +
            `Received: ${scrollTop.toFixed(1)}px (${actualPercent.toFixed(2)}%)\n` +
            `Tolerance: ±${tolerance}px`,
    };
  },
});

test("scrolling the bottom sheet stops at predefined snap points", async ({
  page,
}) => {
  await page.goto("./non-dismissible");

  const sheet = page.locator("bottom-sheet");
  const sheetHeader = page.getByText("Custom header");

  await expect(sheet).toBeScrolledToPercentage(50);

  await sheetHeader.hover();

  await page.mouse.wheel(0, 100);

  await expect(sheet).toBeScrolledToPercentage(75);

  await page.mouse.wheel(0, 100);

  await expect(sheet).toBeScrolledToPercentage(100);
});
