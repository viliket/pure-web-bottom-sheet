import DialogPage from "../pageobjects/dialog.page";

declare global {
  interface Window {
    __capturedSnapPositions?: (string | undefined)[];
  }
}

describe("Bottom sheet snap-position-change event", function () {
  const sheet = DialogPage.bottomSheet;

  const openDialog = async () => {
    await DialogPage.openDialog();
    await expect(DialogPage.dialog).toBeDisplayed();
    await expect(sheet.host).toBeDisplayed();
  };

  const addSnapPositionChangeListener = async () => {
    await browser.execute(() => {
      window.__capturedSnapPositions = [];
      document.addEventListener(
        "snap-position-change",
        (event: CustomEventInit<{ snapPosition: string }> & Event) => {
          window.__capturedSnapPositions?.push(event.detail?.snapPosition);
        },
      );
    });
  };

  const getCapturedSnapPositions = async (): Promise<
    (string | undefined)[]
  > => {
    return browser.execute(() => window.__capturedSnapPositions ?? []);
  };

  const clearCapturedSnapPositions = async () => {
    await browser.execute(() => {
      window.__capturedSnapPositions = [];
    });
  };

  const waitForSnapPosition = async (position: string) => {
    await browser.waitUntil(
      async () => {
        const positions = await getCapturedSnapPositions();
        return positions.includes(position);
      },
      { timeoutMsg: `Expected snap position "${position}" to be captured` },
    );
  };

  beforeEach(async function () {
    await DialogPage.open();
    await addSnapPositionChangeListener();
  });

  it("should fire with snapPosition '1' when sheet snaps to intermediate point", async function () {
    if (browser.isWebKit) {
      // TODO: WebKit-based browsers may fire multiple "snap-position-change" events
      // on dialog open (related to fallback that uses IntersectionObserver)
      this.skip();
    }

    // The dialog opens at the 50% snap point (intermediate, position 1).
    await openDialog();

    await waitForSnapPosition("1");
    const capturedPositions = await getCapturedSnapPositions();
    expect(capturedPositions).toEqual(["1"]);
  });

  it("should fire with snapPosition '0' when sheet snaps to top", async function () {
    await openDialog();
    await waitForSnapPosition("1");
    await clearCapturedSnapPositions();

    // Scroll to top (fully expanded)
    await sheet.setScrollTopRelativeToHeight(sheet.snapPoints.P100);

    await waitForSnapPosition("0");
    const capturedPositions = await getCapturedSnapPositions();
    expect(capturedPositions).toEqual(["0"]);
  });

  it("should fire with snapPosition '2' when sheet snaps to bottom (collapsed)", async function () {
    await openDialog();
    await waitForSnapPosition("1");
    await clearCapturedSnapPositions();

    // Scroll to bottom (collapsed)
    await sheet.setScrollTopRelativeToHeight(sheet.snapPoints.P0);

    await waitForSnapPosition("2");
    const capturedPositions = await getCapturedSnapPositions();
    expect(capturedPositions).toEqual(["2"]);
  });

  it("should fire events in sequence when moving through all snap positions", async function () {
    await openDialog();
    await waitForSnapPosition("1");
    await clearCapturedSnapPositions();

    // Move to top (fully expanded, position 0)
    await sheet.setScrollTopRelativeToHeight(sheet.snapPoints.P100);
    await waitForSnapPosition("0");

    // Move to intermediate (position 1)
    await sheet.setScrollTopRelativeToHeight(sheet.snapPoints.P50);
    await waitForSnapPosition("1");

    // Move to bottom (collapsed, position 2)
    await sheet.setScrollTopRelativeToHeight(sheet.snapPoints.P0);
    await waitForSnapPosition("2");

    // Verify the sequence of captured positions
    const capturedPositions = await getCapturedSnapPositions();
    expect(capturedPositions).toEqual(["0", "1", "2"]);
  });
});
