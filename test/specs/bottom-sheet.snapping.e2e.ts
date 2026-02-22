import NonDismissiblePage from "../pageobjects/non-dismissible.page";

describe("Bottom sheet snapping", function () {
  const sheet = NonDismissiblePage.bottomSheet;
  const snapPoints = sheet.snapPoints;

  beforeEach(async function () {
    await NonDismissiblePage.open();
    await expect(sheet.host).toBeExisting();
  });

  it("should start at the initial snap position", async function () {
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
  });

  it("should snap to minimum when scrolling up", async function () {
    await sheet.waitForSnapPointsToActivate();

    await sheet.host.scrollBy(-100);
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);
  });

  it("should stay at minimum when scrolling up from minimum", async function () {
    await sheet.waitForSnapPointsToActivate();

    // First scroll to minimum
    await sheet.host.scrollBy(-100);
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);

    // Scroll up again - should stay at minimum
    await sheet.host.scrollBy(-100);
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);
  });

  it("should snap through all points when scrolling down", async function () {
    await sheet.waitForSnapPointsToActivate();

    // Start from minimum
    await sheet.host.scrollBy(-100);
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);

    // Scroll down through each snap point
    const expectedSnapPoints = [
      snapPoints.P50,
      snapPoints.P75,
      snapPoints.P100,
    ];

    for (const snapPoint of expectedSnapPoints) {
      await sheet.host.scrollBy(100);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoint);
    }
  });

  it("should snap correctly using wheel action", async function () {
    if (browser.isWebKit) {
      // Webkit WebDriver seems to have issues with the wheel actions not triggering
      // the browser's scroll snapping, so we need to skip this test for them.
      this.skip();
    }
    if (browser.isChromium) {
      // Chromium-based browsers seem to occasionally fail to register the wheel action.
      // Retry few times if needed.
      this.retries(3);
    }

    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    await sheet.waitForSnapPointsToActivate();

    await browser
      .action("wheel")
      .scroll({
        deltaX: 0,
        deltaY: 200,
        origin: sheet.headerSlot,
      })
      .perform();

    if (browser.isFirefox) {
      // Firefox's WebDriver implementation has issues with wheel actions
      // and scroll snapping, so we need to perform a manual tap to
      // "release" the scroll for scroll snapping to take action.
      await browser
        .action("pointer")
        .move({ origin: sheet.headerSlot })
        .down()
        .up()
        .perform();
    }

    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
  });

  it("should snap correctly using touch flick gesture", async function () {
    if (!browser.isChromium) {
      // Only Chromium-based browsers seem to currently support touch emulation.
      this.skip();
    }

    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    await sheet.waitForSnapPointsToActivate();

    await browser.touchFlingInTarget(50, 500, sheet.headerSlot, "up");

    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);

    await browser.touchFlingInTarget(50, 500, sheet.headerSlot, "up");
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P100);

    await browser.touchFlingInTarget(100, 500, sheet.headerSlot, "down");

    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);
  });
});
