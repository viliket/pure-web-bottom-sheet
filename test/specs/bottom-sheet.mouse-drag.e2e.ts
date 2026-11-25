import NonDismissiblePage from "../pageobjects/non-dismissible.page";

declare global {
  interface Window {
    __mouseDraggingDetected?: boolean;
  }
}

describe("Mouse drag", function () {
  const sheet = NonDismissiblePage.bottomSheet;
  const snapPoints = sheet.snapPoints;

  /**
   * Simulates a mouse drag gesture.
   * Uses viewport coordinates so the drag distance is exact regardless of
   * element movement during the drag.
   */
  async function mouseDrag(
    target: ChainablePromiseElement,
    deltaY: number,
    options: {
      numSteps?: number;
      startOffset?: { x?: number; y?: number };
      skipRelease?: boolean;
    } = {},
  ) {
    const { numSteps = 5, startOffset, skipRelease = false } = options;

    const location = await target.getLocation();
    const size = await target.getSize();
    const startX = Math.round(location.x + (startOffset?.x ?? size.width / 2));
    const startY = Math.round(
      Math.max(location.y + (startOffset?.y ?? size.height / 2), 0),
    );

    const action = browser
      .action("pointer", { parameters: { pointerType: "mouse" } })
      .move({ x: startX, y: startY, origin: "viewport" })
      .down();

    for (let i = 1; i <= numSteps; i++) {
      action.move({
        x: startX,
        y: Math.round(startY + (deltaY * i) / numSteps),
        origin: "viewport",
        duration: 50,
      });
    }

    if (!skipRelease) {
      action.up();
    }

    await action.perform(skipRelease);
  }

  beforeEach(async function () {
    await NonDismissiblePage.open();
    await expect(sheet.host).toBeExisting();
    await sheet.waitForSnapPointsToActivate();
    await sheet.host.execute((el) => el.setAttribute("mouse-drag", ""));
  });

  describe("default mode (header + footer)", function () {
    it("should drag up from header to expand sheet", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.header, -150);

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should drag down from header to shrink sheet", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.header, 150);

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P25);
    });

    it("should drag from footer", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.footer, -150);

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should not drag from content area", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.content, -150, { startOffset: { y: 10 } });

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    });
  });

  describe('header mode (mouse-drag="header")', function () {
    beforeEach(async function () {
      await sheet.host.execute((el) => el.setAttribute("mouse-drag", "header"));
    });

    it("should drag from header", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.header, -150);

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should not drag from footer", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.footer, -150);

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);
    });
  });

  describe('sheet mode (mouse-drag="sheet")', function () {
    beforeEach(async function () {
      await sheet.host.execute((el) => el.setAttribute("mouse-drag", "sheet"));
    });

    it("should drag from content area", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.content, -150, { startOffset: { y: 10 } });

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should drag from header", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.header, -150);

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });

    it("should drag from footer", async function () {
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P50);

      await mouseDrag(sheet.footer, -150);

      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);
    });
  });

  describe("click interaction", function () {
    beforeEach(async function () {
      await sheet.host.execute((el) => el.setAttribute("mouse-drag", "sheet"));
      // Expand sheet so the details element is visible and not covered by footer
      await sheet.scrollByRelativeToHeight(0.5);
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P100);
    });

    it("should allow clicking elements inside drag area", async function () {
      const details = $("bottom-sheet.example details");
      // @ts-expect-error - toHaveElementProperty types only accept string values, not boolean
      await expect(details).toHaveElementProperty("open", true);

      await details.$("summary").click();

      // @ts-expect-error - toHaveElementProperty types only accept string values, not boolean
      await expect(details).toHaveElementProperty("open", false);
    });

    it("should suppress click after drag", async function () {
      const details = $("bottom-sheet.example details");
      // @ts-expect-error - toHaveElementProperty types only accept string values, not boolean
      await expect(details).toHaveElementProperty("open", true);

      await mouseDrag(details.$("summary"), -150, { startOffset: { y: 10 } });

      // details.open should remain unchanged since the click was suppressed
      // @ts-expect-error - toHaveElementProperty types only accept string values, not boolean
      await expect(details).toHaveElementProperty("open", true);
    });

    it("should clear dragging state when pointer is canceled before pointerup", async function () {
      await mouseDrag(sheet.header, 40, { skipRelease: true });
      await expect(sheet.host).toHaveAttribute("data-mouse-dragging");

      await sheet.sheetSurface.execute((surface) => {
        surface.dispatchEvent(new Event("pointercancel"));
      });

      await expect(sheet.host).not.toHaveAttribute(
        "data-mouse-dragging",
        undefined,
        { wait: 0 },
      );

      await browser
        .action("pointer", { parameters: { pointerType: "mouse" } })
        .up()
        .perform();
    });
  });

  describe("touch interaction", function () {
    it("should not set data-mouse-dragging during touch scroll", async function () {
      if (!browser.isChromium) {
        // Only Chromium-based browsers support touch emulation.
        this.skip();
      }

      // Track if data-mouse-dragging is ever set via MutationObserver
      await sheet.host.execute((el) => {
        window.__mouseDraggingDetected = false;
        new MutationObserver(() => {
          if ((el as HTMLElement).hasAttribute("data-mouse-dragging")) {
            window.__mouseDraggingDetected = true;
          }
        }).observe(el, {
          attributes: true,
          attributeFilter: ["data-mouse-dragging"],
        });
      });

      await browser.touchFlingInTarget(50, 500, sheet.header, "up");
      await expect(sheet.host).toHaveScrollTopRelativeToHeight(snapPoints.P75);

      const detected = await browser.execute(
        () => window.__mouseDraggingDetected ?? false,
      );
      expect(detected).toBe(false);
    });
  });
});
