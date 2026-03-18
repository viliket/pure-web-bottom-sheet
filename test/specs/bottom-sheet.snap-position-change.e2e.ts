import type {
  SnapPositionChangeEventDetail,
  SheetState,
} from "pure-web-bottom-sheet";
import DialogPage from "../pageobjects/dialog.page";
import EventsPage from "../pageobjects/events.page";
import NonDismissiblePage from "../pageobjects/non-dismissible.page";

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
    let lastEvent: SnapPositionChangeEventDetail | undefined;
    await browser.waitUntil(
      async () => {
        lastEvent = (await getCapturedSnapEvents()).at(-1);
        return (
          lastEvent?.snapIndex === snapIndex &&
          lastEvent?.sheetState === sheetState
        );
      },
      {
        timeoutMsg:
          `Expected last snap event to be ` +
          `{snapIndex: ${snapIndex}, ` +
          `sheetState: "${sheetState}"}, ` +
          `but was ${JSON.stringify(lastEvent)}`,
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

    it("should recalculate snap indices after snap points are dynamically changed", async function () {
      await openDialog();
      await waitForSnapEvent(2, "partially-expanded");

      // Remove the 25% and 75% snap points, leaving only 100% (.top) and 50%
      await browser.execute(() => {
        const sheet = document.querySelector("bottom-sheet.example");
        sheet?.querySelectorAll('[slot="snap"]').forEach((el) => {
          const snap = (el as HTMLElement).style.getPropertyValue("--snap");
          if (snap === "25%" || snap === "75%") {
            el.remove();
          }
        });
      });
      await clearCapturedSnapEvents();

      // Scroll to top. With only 2 snap points remaining, the top snap point
      // (100%) should now be snapIndex 2 instead of 4.
      await sheet.setScrollTopRelativeToHeight(snapPoints.P100);
      await waitForSnapEvent(2, "expanded");

      // Scroll back to 50%. This should now be snapIndex 1 instead of 2.
      await sheet.setScrollTopRelativeToHeight(snapPoints.P50);
      await waitForSnapEvent(1, "partially-expanded");

      const events = await getCapturedSnapEvents();
      expect(events).toEqual([
        { sheetState: "expanded", snapIndex: 2 },
        { sheetState: "partially-expanded", snapIndex: 1 },
      ]);
    });

    it("should not fire duplicate event when dialog is reopened at the same snap position", async function () {
      await openDialog();
      await waitForSnapEvent(2, "partially-expanded");

      // Close and reopen without changing snap position
      await EventsPage.dialog.execute((el) =>
        (el as HTMLDialogElement).close(),
      );
      await EventsPage.dialog.waitForAnimationsToFinish();
      await expect(EventsPage.dialog).not.toBeDisplayed();
      await clearCapturedSnapEvents();
      await openDialog();

      // No event should fire because the snap index is still 2
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([]);
    });

    it("should fire initial snap event when dialog is reopened after a position change", async function () {
      await openDialog();
      await waitForSnapEvent(2, "partially-expanded");

      // Scroll to expanded before closing
      await sheet.setScrollTopRelativeToHeight(snapPoints.P100);
      await waitForSnapEvent(4, "expanded");

      // Close and reopen the dialog
      await EventsPage.dialog.execute((el) =>
        (el as HTMLDialogElement).close(),
      );
      await EventsPage.dialog.waitForAnimationsToFinish();
      await expect(EventsPage.dialog).not.toBeDisplayed();
      await clearCapturedSnapEvents();
      await openDialog();

      // The sheet snaps back to the initial 50% position and fires
      // because the snap index changed from 4 to 2.
      await waitForSnapEvent(2, "partially-expanded");
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([
        { sheetState: "partially-expanded", snapIndex: 2 },
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

  describe("sheet without swipe-to-dismiss", function () {
    const sheet = NonDismissiblePage.bottomSheet;
    const snapPoints = sheet.snapPoints;

    beforeEach(async function () {
      await NonDismissiblePage.open();
      await addSnapPositionChangeListener();
    });

    it("should not fire 'collapsed' event when scrolling to the bottom", async function () {
      // Wait for the initial snap animation to finish so all snap points
      // are active before proceeding.
      await sheet.waitForSnapPointsToActivate();

      // The non-dismissible sheet is already visible on page load, so the
      // initial snap event fires before the listener is registered.
      const initialEvents = await getCapturedSnapEvents();
      expect(initialEvents).toEqual([]);

      // Scroll to full height to establish a known position
      await sheet.setScrollTopRelativeToHeight(snapPoints.P100);
      await waitForSnapEvent(4, "expanded");
      await clearCapturedSnapEvents();

      // Scroll to the lowest position. Without swipe-to-dismiss, the bottom
      // snap point is disabled, so the sheet snaps to the lowest user-defined
      // snap point (25%) instead of collapsing.
      await sheet.setScrollTopRelativeToHeight(0);

      await waitForSnapEvent(1, "partially-expanded");
      const events = await getCapturedSnapEvents();
      expect(events).toEqual([
        { sheetState: "partially-expanded", snapIndex: 1 },
      ]);
    });
  });
});
