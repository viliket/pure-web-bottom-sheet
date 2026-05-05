import DialogPage from "../pageobjects/dialog.page";
import DynamicHeightPage from "../pageobjects/dynamic-height.page";
import SnapToPointPage from "../pageobjects/snap-to-point.page";

describe("Bottom sheet snapToPoint()", function () {
  describe("non-dismissible sheet", function () {
    const sheet = SnapToPointPage.bottomSheet;
    const snapPoints = sheet.snapPoints;

    beforeEach(async function () {
      await SnapToPointPage.open();
      await expect(sheet.host).toBeExisting();
      // Wait for the initial-snap animation to finish before invoking the API
      await sheet.waitForSnapPointsToActivate();
    });

    it("should start at the initial 50% snap point", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    });

    it("should snap to each user-defined snap point by index", async function () {
      await sheet.callSnapToPoint(1);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);

      await sheet.callSnapToPoint(2);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await sheet.callSnapToPoint(3);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should snap to fully expanded state at the maximum index", async function () {
      // With 3 user-defined snap points and no `.top` snap point, the maximum
      // expanded index is 4, which internally scrolls the `.sheet` element into
      // view rather than any assigned snap point.
      await sheet.callSnapToPoint(4);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P100);
    });

    it("should silently no-op for out-of-bounds index", async function () {
      // Stays at the initial 50% snap point
      await sheet.callSnapToPoint(-1);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
      await sheet.callSnapToPoint(5);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    });

    it("should silently no-op for non-integer index", async function () {
      await sheet.callSnapToPoint(1.5);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
      await sheet.callSnapToPoint(NaN);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    });

    it("should reach the target snap position when behavior is 'instant'", async function () {
      await sheet.callSnapToPoint(3, "instant");
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should reach the target snap position when behavior is 'smooth'", async function () {
      await sheet.callSnapToPoint(3, "smooth");
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should resolve index 0 to the bottommost reachable snap point", async function () {
      // The non-dismissible sheet has no `swipe-to-dismiss`, so index 0
      // (collapsed) is not actually a point the sheet can snap to. Instead,
      // the browser snaps the sheet to the bottommost reachable snap point,
      // which is the 25% snap in this case.
      await sheet.callSnapToPoint(0);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);
    });
  });

  describe("modal dialog sheet (swipe-to-dismiss)", function () {
    const sheet = DialogPage.bottomSheet;

    beforeEach(async function () {
      await DialogPage.open();
      await DialogPage.openDialog();
    });

    it("should close the dialog when called with index 0", async function () {
      await sheet.callSnapToPoint(0);
      // The bottom-sheet-dialog-manager closes the dialog when the sheet snaps
      // to the bottom (snapIndex 0), so no close animation here.
      // @ts-expect-error - toHaveElementProperty types only accept string values, not boolean
      await expect(DialogPage.dialog).toHaveElementProperty("open", false);
    });
  });

  describe("content-height sheet", function () {
    const sheet = DynamicHeightPage.bottomSheet;
    const snapPoints = sheet.snapPoints;

    beforeEach(async function () {
      await DynamicHeightPage.open();
      await DynamicHeightPage.openDialog();
    });

    it("should resolve indices beyond the content-limited max to the topmost reachable snap point", async function () {
      // 4 content blocks (50vh) cap the maximum reachable scroll position
      // at the 50% snap point.
      await DynamicHeightPage.addBlocks(4);

      await sheet.callSnapToPoint(1);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);

      // callSnapToPoint(4) targets the .top user snap (100%) which is
      // beyond the content-height limit. The browser snaps the sheet to
      // the topmost reachable snap point, which is the 50% snap in this case.
      await sheet.callSnapToPoint(4);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    });
  });
});
