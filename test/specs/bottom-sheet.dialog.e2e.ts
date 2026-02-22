import DialogPage from "../pageobjects/dialog.page";

describe("Modal bottom sheet (dialog)", function () {
  const expectDialogToBeClosed = async () => {
    // @ts-expect-error - toHaveElementProperty types only accept string values, not boolean
    await expect(DialogPage.dialog).toHaveElementProperty("open", false);
  };

  const openDialog = async () => {
    await DialogPage.openDialog();
    // @ts-expect-error - toHaveElementProperty types only accept string values, not boolean
    await expect(DialogPage.dialog).toHaveElementProperty("open", true);
    await expect(DialogPage.bottomSheet.host).toBeDisplayed();
  };

  beforeEach(async function () {
    await DialogPage.open();
    if (browser.capabilities.browserName === "MiniBrowser") {
      // MiniBrowser has occasional flakiness with the initial snap on dialog open,
      // adjust the initial snap duration higher for this test suite to mitigate
      await DialogPage.bottomSheet.host.execute((el: HTMLElement) => {
        el.style.setProperty("--initial-snap-duration", "3s");
      });
    }
  });

  it("should open by button click and delegate focus to sheet element", async function () {
    await openDialog();
    await expect(DialogPage.bottomSheet.host).toBeFocused();
  });

  it("should start at the initial snap position when opened", async function () {
    await openDialog();
    await expect(DialogPage.bottomSheet.host).toHaveScrollTopRelativeToHeight(
      DialogPage.bottomSheet.snapPoints.P50,
    );
  });

  it("should close when clicking the backdrop", async function () {
    await openDialog();

    const sheetSurface = DialogPage.bottomSheet.sheetSurfaceContainer;

    const sheetSurfaceY = await sheetSurface.getLocation("y");
    const sheetSurfaceHalfWidth = (await sheetSurface.getSize("width")) / 2;

    // Click just past the top edge of the sheet surface (should close it)
    await browser.clickAt({ x: sheetSurfaceHalfWidth, y: sheetSurfaceY - 1 });

    // Wait for close animation to complete
    await DialogPage.dialog.waitForAnimationsToFinish();

    await expectDialogToBeClosed();
  });

  it("should close on pressing escape key", async function () {
    await openDialog();

    await browser.keys(["Escape"]);

    // Wait for close animation to complete
    await DialogPage.dialog.waitForAnimationsToFinish();

    await expectDialogToBeClosed();
  });

  it("should close when scrolling to the bottom snap", async function () {
    await openDialog();

    await DialogPage.bottomSheet.setScrollTopRelativeToHeight(0);

    await expectDialogToBeClosed();
  });
});
