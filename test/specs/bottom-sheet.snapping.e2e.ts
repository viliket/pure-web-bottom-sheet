import NonDismissiblePage from "../pageobjects/non-dismissible.page";

describe("Bottom sheet snapping", function () {
  const browserName = browser.capabilities.browserName;
  const sheet = NonDismissiblePage.bottomSheet;
  const snapPoints = sheet.snapPoints;

  beforeEach(async function () {
    await NonDismissiblePage.open();

    if (browserName === "MiniBrowser") {
      // MiniBrowser has issues with page load and initial snap
      await browser.refresh();
    }

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
    if (browserName === "MiniBrowser") {
      // MiniBrowser has issues with wheel actions not triggering the browser's
      // scroll snapping, so we need to skip this test for it.
      this.skip();
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

    if (browserName === "firefox") {
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
    if (browserName !== "chrome") {
      // Chrome is the only browser with a touch emulation.
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
