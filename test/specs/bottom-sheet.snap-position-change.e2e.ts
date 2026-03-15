import type { SnapPositionChangeEventDetail } from "pure-web-bottom-sheet";
import DialogPage from "../pageobjects/dialog.page";

declare global {
  interface Window {
    __capturedSnapEvents?: SnapPositionChangeEventDetail[];
  }
}

describe("Bottom sheet snap-position-change event", function () {
  const sheet = DialogPage.bottomSheet;
  const snapPoints = sheet.snapPoints;

  const openDialog = async () => {
    await DialogPage.openDialog();
    await expect(DialogPage.dialog).toBeDisplayed();
    await expect(sheet.host).toBeDisplayed();
  };

  const addSnapPositionChangeListener = async () => {
    await browser.execute(() => {
      window.__capturedSnapEvents = [];
      document.addEventListener(
        "snap-position-change",
        (event: CustomEventInit<SnapPositionChangeEventDetail> & Event) => {
          if (event.detail) {
            window.__capturedSnapEvents?.push(event.detail);
          }
        },
      );
    });
  };

  const getCapturedSnapEvents =
    async (): Promise<SnapPositionChangeEventDetail[]> => {
      return browser.execute(() => window.__capturedSnapEvents ?? []);
    };

  const clearCapturedSnapEvents = async () => {
    await browser.execute(() => {
      window.__capturedSnapEvents = [];
    });
  };

  const waitForSheetState = async (sheetState: string) => {
    await browser.waitUntil(
      async () => {
        const events = await getCapturedSnapEvents();
        return events.some((e) => e.sheetState === sheetState);
      },
      {
        timeoutMsg: `Expected sheetState "${sheetState}" to be captured`,
      },
    );
  };

  beforeEach(async function () {
    await DialogPage.open();
    await addSnapPositionChangeListener();
  });

  it("should fire with 'partially-expanded' state when sheet snaps to intermediate point", async function () {
    if (browser.isWebKit) {
      // TODO: WebKit-based browsers may fire multiple "snap-position-change" events
      // on dialog open (related to fallback that uses IntersectionObserver)
      this.skip();
    }

    // The dialog opens at the 50% snap point (intermediate, snapIndex 1).
    await openDialog();

    await waitForSheetState("partially-expanded");
    const events = await getCapturedSnapEvents();
    expect(events).toEqual([
      { sheetState: "partially-expanded", snapIndex: 1 },
    ]);
  });

  it("should fire with 'expanded' state when sheet snaps to top", async function () {
    await openDialog();
    await waitForSheetState("partially-expanded");
    await clearCapturedSnapEvents();

    // Scroll to top (fully expanded)
    await sheet.setScrollTopRelativeToHeight(snapPoints.P100);

    await waitForSheetState("expanded");
    const events = await getCapturedSnapEvents();
    expect(events).toEqual([{ sheetState: "expanded", snapIndex: 2 }]);
  });

  it("should fire with 'collapsed' state when sheet snaps to bottom", async function () {
    await openDialog();
    await waitForSheetState("partially-expanded");
    await clearCapturedSnapEvents();

    // Scroll to bottom (collapsed)
    await sheet.setScrollTopRelativeToHeight(snapPoints.P0);

    await waitForSheetState("collapsed");
    const events = await getCapturedSnapEvents();
    expect(events).toEqual([{ sheetState: "collapsed", snapIndex: 0 }]);
  });

  it("should fire events in sequence when moving through all snap positions", async function () {
    await openDialog();
    await waitForSheetState("partially-expanded");
    await clearCapturedSnapEvents();

    // Move to top (fully expanded)
    await sheet.setScrollTopRelativeToHeight(snapPoints.P100);
    await waitForSheetState("expanded");

    // Move to intermediate
    await sheet.setScrollTopRelativeToHeight(snapPoints.P50);
    await waitForSheetState("partially-expanded");

    // Move to bottom (collapsed)
    await sheet.setScrollTopRelativeToHeight(snapPoints.P0);
    await waitForSheetState("collapsed");

    // Verify the sequence of captured events
    const events = await getCapturedSnapEvents();
    expect(events).toEqual([
      { sheetState: "expanded", snapIndex: 2 },
      { sheetState: "partially-expanded", snapIndex: 1 },
      { sheetState: "collapsed", snapIndex: 0 },
    ]);
  });
});
