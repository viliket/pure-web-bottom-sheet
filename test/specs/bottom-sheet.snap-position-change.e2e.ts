import type {
  SnapPositionChangeEventDetail,
  SheetState,
} from "pure-web-bottom-sheet";
import DialogPage from "../pageobjects/dialog.page";
import EventsPage from "../pageobjects/events.page";

declare global {
  interface Window {
    __capturedSnapEvents?: SnapPositionChangeEventDetail[];
  }
}

describe("Bottom sheet snap-position-change event", function () {
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

  const getCapturedSnapEvents = async (): Promise<
    SnapPositionChangeEventDetail[]
  > => {
    return browser.execute(() => window.__capturedSnapEvents ?? []);
  };

  const clearCapturedSnapEvents = async () => {
    await browser.execute(() => {
      window.__capturedSnapEvents = [];
    });
  };

  const waitForSnapEvent = async (
    snapIndex: number,
    sheetState: SheetState,
  ) => {
    await browser.waitUntil(
      async () => {
        const last = (await getCapturedSnapEvents()).at(-1);
        return last?.snapIndex === snapIndex && last?.sheetState === sheetState;
      },
      {
        timeoutMsg: `Expected last snap event to be {snapIndex: ${snapIndex}, sheetState: "${sheetState}"}`,
      },
    );
  };

  describe("sheet with explicit top snap point", function () {
    const sheet = EventsPage.bottomSheet;
    const snapPoints = sheet.snapPoints;

    const openDialog = async () => {
      await EventsPage.openDialog();
      await expect(EventsPage.dialog).toBeDisplayed();
      await expect(sheet.host).toBeDisplayed();
    };

    beforeEach(async function () {
      await EventsPage.open();
      await addSnapPositionChangeListener();
    });

    it("should fire with 'partially-expanded' state when sheet opens at initial 50% snap point", async function () {
      // The dialog opens at the 50% snap point (initial, snapIndex 2).
      await openDialog();

      await waitForSnapEvent(2, "partially-expanded");
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([
        { sheetState: "partially-expanded", snapIndex: 2 },
      ]);
    });

    it("should fire with 'expanded' state when sheet snaps to top", async function () {
      await openDialog();
      await waitForSnapEvent(2, "partially-expanded");
      await clearCapturedSnapEvents();

      // Scroll to top (fully expanded)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P100);

      await waitForSnapEvent(4, "expanded");
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([{ sheetState: "expanded", snapIndex: 4 }]);
    });

    it("should fire with 'collapsed' state when sheet snaps to bottom", async function () {
      await openDialog();
      await waitForSnapEvent(2, "partially-expanded");
      await clearCapturedSnapEvents();

      // Scroll to bottom (collapsed)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P0);

      await waitForSnapEvent(0, "collapsed");
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([{ sheetState: "collapsed", snapIndex: 0 }]);
    });

    it("should fire with correct snapIndex for each intermediate snap point", async function () {
      await openDialog();
      await waitForSnapEvent(2, "partially-expanded");
      await clearCapturedSnapEvents();

      // Snap to 75%
      await sheet.setScrollTopRelativeToHeight(snapPoints.P75);
      await waitForSnapEvent(3, "partially-expanded");

      // Snap to 25%
      await sheet.setScrollTopRelativeToHeight(snapPoints.P25);
      await waitForSnapEvent(1, "partially-expanded");

      const events = await getCapturedSnapEvents();
      expect(events).toEqual([
        { sheetState: "partially-expanded", snapIndex: 3 },
        { sheetState: "partially-expanded", snapIndex: 1 },
      ]);
    });

    it("should fire events in sequence when moving through all snap positions", async function () {
      await openDialog();
      await waitForSnapEvent(2, "partially-expanded");

      // Move to top (fully expanded, snapIndex 4)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P100);
      await waitForSnapEvent(4, "expanded");

      // Move to 75% (snapIndex 3)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P75);
      await waitForSnapEvent(3, "partially-expanded");

      // Move to 50% (snapIndex 2)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P50);
      await waitForSnapEvent(2, "partially-expanded");

      // Move to 25% (snapIndex 1)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P25);
      await waitForSnapEvent(1, "partially-expanded");

      // Move to bottom (collapsed, snapIndex 0)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P0);
      await waitForSnapEvent(0, "collapsed");

      // Verify the full sequence
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([
        { sheetState: "partially-expanded", snapIndex: 2 },
        { sheetState: "expanded", snapIndex: 4 },
        { sheetState: "partially-expanded", snapIndex: 3 },
        { sheetState: "partially-expanded", snapIndex: 2 },
        { sheetState: "partially-expanded", snapIndex: 1 },
        { sheetState: "collapsed", snapIndex: 0 },
      ]);
    });
  });

  describe("sheet without explicit top snap point", function () {
    // The dialog page has a single explicit snap point (50%) with no explicit
    // top snap point.
    const sheet = DialogPage.bottomSheet;
    const snapPoints = sheet.snapPoints;

    const openDialog = async () => {
      await DialogPage.openDialog();
      await expect(DialogPage.dialog).toBeDisplayed();
      await expect(sheet.host).toBeDisplayed();
    };

    beforeEach(async function () {
      await DialogPage.open();
      await addSnapPositionChangeListener();
    });

    it("should fire with 'expanded' state when sheet has no explicit top snap point", async function () {
      await openDialog();
      await waitForSnapEvent(1, "partially-expanded");
      await clearCapturedSnapEvents();

      // Scroll to top (fully expanded)
      await sheet.setScrollTopRelativeToHeight(snapPoints.P100);

      await waitForSnapEvent(2, "expanded");
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([{ sheetState: "expanded", snapIndex: 2 }]);
    });
  });
});
