import NonDismissiblePage from "../pageobjects/non-dismissible.page";

describe("Non-dismissible bottom sheet", function () {
  const sheet = NonDismissiblePage.bottomSheet;
  const snapPoints = sheet.snapPoints;

  beforeEach(async function () {
    await NonDismissiblePage.open();
    await expect(sheet.host).toBeExisting();
  });

  it("should remain visible when scrolled to minimum snap point", async function () {
    await sheet.waitForSnapPointsToActivate();

    await sheet.setScrollTopRelativeToHeight(snapPoints.P25);

    await expect(sheet.host).toBeDisplayed();
  });

  it("should remain visible when scrolled past minimum snap point", async function () {
    await sheet.waitForSnapPointsToActivate();

    await sheet.setScrollTopRelativeToHeight(0);

    await expect(sheet.host).toBeDisplayed();
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);
  });

  it("should not close when clicking outside the sheet", async function () {
    const sheetSurface = sheet.sheetSurfaceContainer;

    const sheetSurfaceY = await sheetSurface.getLocation("y");
    const sheetSurfaceHalfWidth = (await sheetSurface.getSize("width")) / 2;

    // Click just on the top edge of the sheet surface (should focus on the sheet)
    await browser.clickAt({ x: sheetSurfaceHalfWidth, y: sheetSurfaceY });

    await expect(sheet.host).toBeFocused();

    // Click just past the top edge of the sheet surface (should focus on the body,
    // but sheet should remain open)
    await browser.clickAt({ x: sheetSurfaceHalfWidth, y: sheetSurfaceY - 1 });

    await expect(sheet.host).not.toBeFocused({ wait: 1000 });

    await expect(sheet.host).toBeDisplayed();
  });

  it("should not block scroll interaction with the page behind the sheet", async function () {
    if (browser.isWebKit) {
      // Webkit WebDriver seems to have issues with the wheel actions not working
      // properly, so skipping this test for now.
      this.skip();
    }

    const scrollBefore = await browser.execute(() => window.scrollY);
    expect(scrollBefore).toBe(0);

    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

    const wheelDeltaY = 100;

    // Move mouse to just above the sheet surface by 1px, which is within the
    // bottom-sheet host element but has pointer-events: none, so the
    // scroll should pass through to the body.
    await browser
      .action("pointer")
      .move({
        x: (await sheet.sheetSurfaceContainer.getSize("width")) / 2,
        y: (await sheet.sheetSurfaceContainer.getLocation("y")) - 1,
      })
      .perform();

    await browser
      .action("wheel")
      .scroll({
        deltaX: 0,
        deltaY: wheelDeltaY,
      })
      .perform();

    await browser.waitUntil(
      async () => (await browser.execute(() => window.scrollY)) === wheelDeltaY,
      {
        timeoutMsg: `Expected window.scrollY to be ${wheelDeltaY} after wheel scroll`,
        timeout: 1000,
      },
    );
    await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    await expect(sheet.host).toBeDisplayed();
  });
});
