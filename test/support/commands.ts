type Direction = "up" | "down" | "left" | "right";

declare global {
  namespace WebdriverIO {
    interface Browser {
      /**
       * Performs a click at the specified viewport coordinates.
       * @param options - Viewport coordinates
       */
      clickAt(options: { x?: number; y?: number }): Promise<void>;

      /**
       * Performs a touch swipe gesture on the target element.
       * @param pixelsToScroll - Total distance to swipe in pixels
       * @param target - Element to swipe within
       * @param direction - Swipe direction
       * @param numSteps - Number of intermediate pointer moves
       * @param durationInMs - Total swipe duration in ms
       * @param releasePauseTimeInMs - Pause before pointer release in ms. Use `0` for a fling (momentum scroll).
       */
      touchSwipeInTarget(
        pixelsToScroll: number,
        target: ChainablePromiseElement | WebdriverIO.Element,
        direction: Direction,
        numSteps?: number,
        durationInMs?: number,
        releasePauseTimeInMs?: number,
      ): Promise<void>;

      /**
       * Performs a touch fling (swipe with no pause, allowing momentum scroll) on the target element.
       * @param pixelsToScroll - Total distance to fling in pixels
       * @param durationInMs - Total fling duration in ms
       * @param target - Element to fling within
       * @param direction - Fling direction
       */
      touchFlingInTarget(
        pixelsToScroll: number,
        durationInMs: number,
        target: ChainablePromiseElement | WebdriverIO.Element,
        direction: Direction,
      ): Promise<void>;
    }

    interface Element {
      /**
       * Scrolls the element by the given vertical delta.
       * @param deltaY - Vertical scroll offset in pixels (positive = down)
       */
      scrollBy(deltaY: number): Promise<void>;

      /**
       * Waits for all animations on the element to finish.
       * Uses the standard Element.getAnimations() API.
       * Note: Resolves instantly if no animations exist on the element.
       */
      waitForAnimationsToFinish(): Promise<void>;
    }
  }
}

function clickAt(
  this: WebdriverIO.Browser,
  { x = 0, y = 0 }: Parameters<WebdriverIO.Browser["clickAt"]>[0],
) {
  return this.action("pointer")
    .move({ x, y, origin: "viewport" })
    .down()
    .up()
    .perform();
}

function touchSwipeInTarget(
  this: WebdriverIO.Browser,
  ...[
    pixelsToScroll,
    target,
    direction,
    numSteps = 10,
    durationInMs = 500,
    releasePauseTimeInMs = 100,
  ]: Parameters<WebdriverIO.Browser["touchSwipeInTarget"]>
) {
  const signs: Record<Direction, [number, number]> = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };
  const [xSign, ySign] = signs[direction];
  const xDelta = (xSign * pixelsToScroll) / numSteps;
  const yDelta = (ySign * pixelsToScroll) / numSteps;
  const pointerAction = this.action("pointer", {
    parameters: { pointerType: "touch" },
  })
    .move({ x: 0, y: 0, origin: target })
    .down();

  const stepDurationInMs = durationInMs / numSteps;
  for (let i = 1; i <= numSteps; i++) {
    pointerAction.move({
      duration: stepDurationInMs,
      x: xDelta * i,
      y: yDelta * i,
      origin: target,
    });
  }

  return pointerAction.pause(releasePauseTimeInMs).up().perform();
}

function touchFlingInTarget(
  this: WebdriverIO.Browser,
  ...[pixelsToScroll, durationInMs, target, direction]: Parameters<
    WebdriverIO.Browser["touchFlingInTarget"]
  >
) {
  return this.touchSwipeInTarget(
    pixelsToScroll,
    target,
    direction,
    10,
    durationInMs,
    0,
  );
}

function scrollBy(
  this: WebdriverIO.Element,
  deltaY: Parameters<WebdriverIO.Element["scrollBy"]>[0],
) {
  return this.execute(
    // Note: Using scrollTo instead of scrollBy for better compatibility across
    // browsers. Particularly MiniBrowser has issues with scrollBy when controlled
    // by the WebDriver protocol (does not properly handle scroll snapping).
    (el, delta) => el.scrollTo({ top: el.scrollTop + delta }),
    deltaY,
  );
}

function waitForAnimationsToFinish(this: WebdriverIO.Element) {
  return this.waitUntil(() => {
    return this.execute((el: HTMLElement) => {
      return el.getAnimations().every((a) => a.playState === "finished");
    });
  });
}

export function addCustomCommands() {
  browser.addCommand("clickAt", clickAt);
  browser.addCommand("touchSwipeInTarget", touchSwipeInTarget);
  browser.addCommand("touchFlingInTarget", touchFlingInTarget);
  browser.addCommand("scrollBy", scrollBy, { attachToElement: true });
  browser.addCommand("waitForAnimationsToFinish", waitForAnimationsToFinish, {
    attachToElement: true,
  });
}
