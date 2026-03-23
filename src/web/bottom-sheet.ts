import { template } from "./bottom-sheet.template";

/**
 * @see https://drafts.csswg.org/css-scroll-snap-2/#snapevent-interface
 */
interface SnapEvent extends Event {
  snapTargetBlock: Element;
}

/**
 * @see https://drafts.csswg.org/scroll-animations/#scrolltimeline-interface
 */
interface ScrollTimeline extends AnimationTimeline {
  readonly source: Element | null;
  readonly axis: string;
}
declare var ScrollTimeline: {
  prototype: ScrollTimeline;
  new ({ source, axis }: { source: Element; axis: string }): ScrollTimeline;
};

/**
 * BottomSheet custom element.
 *
 * @example
 * // Register in TypeScript for proper type checking:
 * declare global {
 *   interface HTMLElementTagNameMap {
 *     "bottom-sheet": BottomSheet;
 *   }
 * }
 */
export class BottomSheet extends HTMLElement {
  static observedAttributes = ["nested-scroll-optimization", "content-height"];
  #handleViewportResize = () => {
    this.style.setProperty(
      "--sw-keyboard-height",
      `${window.visualViewport?.offsetTop ?? 0}px`,
    );
  };
  #shadow: ShadowRoot;
  #cleanupIntersectionObserver: (() => void) | null = null;
  #cleanupSheetSizeObserver: (() => void) | null = null;
  #cleanupNestedScrollResizeOptimization: (() => void) | null = null;
  #currentSnapState: {
    snapIndex: number;
    sheetState: SheetState;
    snapTarget: Element;
  } | null = null;

  constructor() {
    super();

    const supportsDeclarative =
      HTMLElement.prototype.hasOwnProperty("attachInternals");
    const internals = supportsDeclarative ? this.attachInternals() : undefined;

    // Use existing declarative shadow root if present, otherwise create one
    let shadow = internals?.shadowRoot;
    if (!shadow) {
      shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = template;
    }
    this.#shadow = shadow;

    const supportsScrollSnapChange = "onscrollsnapchange" in window;
    if (supportsScrollSnapChange) {
      this.addEventListener("scrollsnapchange", this.#handleScrollSnapChange);
    }

    if (
      !CSS.supports(
        "(animation-timeline: scroll()) and (animation-range: 0% 100%)",
      )
    ) {
      this.addEventListener("scroll", this.#handleScroll);
      this.#handleScroll();
    }
  }

  connectedCallback() {
    const supportsScrollSnapChange = "onscrollsnapchange" in window;
    if (!supportsScrollSnapChange) {
      this.#setupIntersectionObserver();
    }

    window.visualViewport?.addEventListener(
      "resize",
      this.#handleViewportResize,
    );
  }

  #setupIntersectionObserver() {
    const snapSlot =
      this.#shadow.querySelector<HTMLSlotElement>('slot[name="snap"]');
    const bottomSnapTarget = this.#shadow.querySelector(
      '.sentinel[data-snap="bottom"]',
    );
    const contentHeightTarget = this.#shadow.querySelector(
      '.sentinel[data-snap="content-height"]',
    );

    if (!snapSlot || !bottomSnapTarget || !contentHeightTarget) return;

    const intersectingTargets = new Set<Element>();
    let previousSnapTarget: Element | null = null;

    const getDistanceToSnapLine = (entry: IntersectionObserverEntry) =>
      Math.abs(entry.intersectionRect.top - (entry.rootBounds?.bottom ?? 0));

    const observer = new IntersectionObserver(
      (entries) => {
        // Add intersecting entries to the set sorted by proximity to the host's top
        // which is the point where snapping occurs because we use `scroll-snap-align: start`
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            return getDistanceToSnapLine(b) - getDistanceToSnapLine(a);
          })
          .forEach((entry) => {
            intersectingTargets.add(entry.target);
          });

        entries
          .filter((entry) => !entry.isIntersecting)
          .forEach((entry) => {
            intersectingTargets.delete(entry.target);
          });

        // Skip when the root has no dimensions (e.g., inside a closed dialog)
        if (!entries[0]?.rootBounds?.height) {
          return;
        }

        // Skip bottom snap target (handled separately for collapsed state detection)
        // and content height target if content-height attribute is unset
        const skipContentHeightTarget = !this.hasAttribute("content-height");
        const currentTarget = Array.from(intersectingTargets).findLast(
          (target) =>
            target !== bottomSnapTarget &&
            (!skipContentHeightTarget || target !== contentHeightTarget),
        );

        if (currentTarget === previousSnapTarget) {
          return;
        }

        // Handle case where none of the targets intersect (fully collapsed state)
        if (!currentTarget) {
          if (
            intersectingTargets.has(bottomSnapTarget) ||
            !this.hasAttribute("swipe-to-dismiss")
          ) {
            return;
          }
          // Use bottom target when nothing intersects and swipe-to-dismiss is enabled
          previousSnapTarget = bottomSnapTarget;
          this.#updateSnapPosition(bottomSnapTarget);
          return;
        }

        previousSnapTarget = currentTarget;
        this.#updateSnapPosition(currentTarget);
      },
      {
        root: this,
        rootMargin: "1000% 0px -100% 0px",
      },
    );

    const sentinels = this.#shadow.querySelectorAll(".sentinel");
    Array.from(sentinels).forEach((sentinel) => {
      observer.observe(sentinel);
    });

    let observedSnapPoints = new Set<Element>();
    const observeSnapPoints = () => {
      const snapPoints = new Set(snapSlot.assignedElements());

      // Unobserve elements no longer assigned to the slot
      observedSnapPoints.forEach((el) => {
        if (!snapPoints.has(el)) {
          observer.unobserve(el);
        }
      });

      snapPoints.forEach((el) => observer.observe(el));

      observedSnapPoints = snapPoints;
    };
    snapSlot.addEventListener("slotchange", observeSnapPoints);
    observeSnapPoints();

    this.#cleanupIntersectionObserver = () => {
      snapSlot.removeEventListener("slotchange", observeSnapPoints);
      observer.disconnect();
      this.#cleanupIntersectionObserver = null;
    };
  }

  #handleScrollSnapChange(event: Event) {
    const snapEvent = event as SnapEvent;
    if (!(snapEvent.snapTargetBlock instanceof HTMLElement)) {
      return;
    }
    this.#updateSnapPosition(snapEvent.snapTargetBlock);
  }

  #updateSnapPosition(newSnapTarget: Element) {
    const snapState = this.#calculateSnapState(newSnapTarget);
    if (!snapState) return;

    const { snapIndex, sheetState } = snapState;

    if (
      this.#currentSnapState?.snapIndex === snapIndex &&
      this.#currentSnapState?.sheetState === sheetState
    ) {
      return;
    }

    this.#currentSnapState = { ...snapState, snapTarget: newSnapTarget };
    this.dataset.sheetState = sheetState;

    this.dispatchEvent(
      new CustomEvent<SnapPositionChangeEventDetail>("snap-position-change", {
        detail: snapState,
        bubbles: true,
        composed: true,
      }),
    );
  }

  #calculateSnapState(
    snapTarget: Element,
  ): { snapIndex: number; sheetState: SheetState } | null {
    const snapSlot =
      this.#shadow.querySelector<HTMLSlotElement>('slot[name="snap"]');
    if (!snapSlot) return null;

    const assignedSnapPoints = snapSlot.assignedElements();

    const hasTopSnapPoint =
      assignedSnapPoints.at(0)?.classList.contains("top") ?? false;

    // Snapped on the .snap.snap-bottom element
    if (
      snapTarget instanceof HTMLElement &&
      snapTarget.dataset.snap === "bottom"
    ) {
      return { snapIndex: 0, sheetState: "collapsed" };
    }

    // When content-height attribute is set, we must check if the sheet has reached
    // maximum scroll top (i.e. the content height) and consider that as snapped
    // to the expanded state and choose the snap index based on the closest snap
    // point above the content height.
    if (this.hasAttribute("content-height")) {
      const maxScroll = this.scrollHeight - this.offsetHeight;
      const hasReachedContentHeight = this.scrollTop >= maxScroll;
      if (hasReachedContentHeight && assignedSnapPoints.length > 0) {
        let closestUnreachedSnapIndex = -1;
        let closestDistance = Infinity;

        for (let i = 0; i < assignedSnapPoints.length; i++) {
          const snapPosition = (assignedSnapPoints[i] as HTMLElement).offsetTop;
          const distance = snapPosition - this.scrollTop;
          if (distance >= 0 && distance < closestDistance) {
            closestDistance = distance;
            closestUnreachedSnapIndex = i;
          }
        }

        if (closestUnreachedSnapIndex !== -1) {
          const snapIndex =
            assignedSnapPoints.length - closestUnreachedSnapIndex;
          return { snapIndex, sheetState: "expanded" };
        }
      } else if (
        snapTarget instanceof HTMLElement &&
        snapTarget.dataset.snap === "content-height"
      ) {
        // The "content-height" sentinel cannot be used for snap state calculation
        // when the content height has not been reached.
        return null;
      }
    }

    // Snapped on one of the snap points assigned to the "snap" slot
    if (snapTarget.matches('[slot="snap"]')) {
      const position = assignedSnapPoints.indexOf(snapTarget);
      const snapIndex = assignedSnapPoints.length - position;
      const isTopSnapPoint = snapTarget.classList.contains("top");
      const sheetState = isTopSnapPoint ? "expanded" : "partially-expanded";
      return { snapIndex, sheetState };
    }

    // Snapped either on the .sheet element or on the "snap" slot fallback element
    const snapIndex = assignedSnapPoints.length + (hasTopSnapPoint ? 0 : 1);
    return { snapIndex, sheetState: "expanded" };
  }

  #handleScroll() {
    this.#shadow
      .querySelector<HTMLElement>(".sheet-wrapper")
      ?.style.setProperty("--sheet-position", `${this.scrollTop}px`);
  }

  #setupNestedScrollResizeOptimization() {
    const wrapper = this.#shadow.querySelector<HTMLElement>(".sheet-wrapper");
    const sheet = this.#shadow.querySelector<HTMLElement>(".sheet");
    const content = this.#shadow.querySelector<HTMLElement>(".sheet-content");

    if (!wrapper || !sheet || !content) {
      return;
    }

    const SCROLL_END_TIMEOUT_MS = 100;
    const supportsScrollAnimations = CSS.supports(
      "scroll-timeline: --sheet-timeline y",
    );
    // Use scrollend event if available to detect end of scrolling
    // (exclude Firefox for now which has inconsistencies with scrollend
    // implementation with scroll chaining from nested scrollable elements)
    const supportScrollEnd =
      "onscrollend" in window && !CSS.supports("-moz-appearance", "none");
    let contentYOffsetStart: number,
      contentYOffsetEnd: number,
      scrollTimeout: number;

    // If CSS scroll-timeline is not supported, we need to manually update
    // the y offset of the sheet content during scrolling
    const updateContentYOffset = () => {
      const t = this.scrollTop / (this.scrollHeight - this.offsetHeight);
      const contentTranslateY =
        (1 - t) * contentYOffsetStart + t * contentYOffsetEnd;
      wrapper.style.setProperty(
        "--sheet-content-offset",
        `${contentTranslateY}px`,
      );
    };

    const cleanupStyleProperties = () => {
      delete this.dataset.scrolling;
      [
        "--sheet-content-offset",
        "--sheet-content-offset-start",
        "--sheet-content-offset-end",
      ].forEach((p) => wrapper.style.removeProperty(p));
    };

    const updateOffsetProperties = () => {
      wrapper.style.setProperty(
        "--sheet-content-offset-start",
        `${contentYOffsetStart}px`,
      );
      wrapper.style.setProperty(
        "--sheet-content-offset-end",
        `${contentYOffsetEnd}px`,
      );
    };

    const handleScrollEnd = () => {
      const style = getComputedStyle(content);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const yOffset = -matrix.m42;
      cleanupStyleProperties();
      // Pin the sheet height inline so the content scrollTop update below is based
      // on the correct scroll height. Removing [data-scrolling] reactivates the
      // scroll-timeline-driven "expand-sheet-height" animation, which will not
      // produce a current time until the next layout pass, leaving the sheet height
      // (and content scroll height) stale for the scrollTop assignment that follows.
      sheet.style.height = `${(this.scrollTop / (this.scrollHeight - this.offsetHeight)) * 100}%`;
      content.scrollTop = yOffset + content.scrollTop;
      // Clear the temporary inline override now that the scrollTop is set
      sheet.style.height = "";
    };

    const handleScroll = () => {
      if (!("scrolling" in this.dataset)) {
        const contentMaxOffsetHeight =
          wrapper.offsetHeight - (sheet.offsetHeight - content.offsetHeight);
        // Threshold after which resizing sheet content anchors the inner
        // content to the bottom of the scrollport instead of top
        const scrollBottomAnchorThreshold =
          content.scrollHeight - contentMaxOffsetHeight;
        if (Math.floor(content.scrollTop) > scrollBottomAnchorThreshold) {
          const contentScrollBottom =
            content.scrollHeight - content.offsetHeight - content.scrollTop;

          // Size factor based on the current height of the bottom sheet
          const sheetSizeFactor =
            wrapper.offsetHeight / (wrapper.offsetHeight - sheet.offsetHeight);

          contentYOffsetStart =
            -(
              content.scrollHeight +
              (sheet.offsetHeight - content.offsetHeight)
            ) +
            contentScrollBottom * sheetSizeFactor;
          contentYOffsetEnd = -scrollBottomAnchorThreshold;

          // Toggle scrolling state on
          this.dataset.scrolling = "";

          // Readjust sheet content offset range based on current scroll position
          // of the sheet content after the layout change caused by toggling the
          // data-scrolling attribute
          contentYOffsetStart += content.scrollTop;
          contentYOffsetEnd += content.scrollTop;

          updateOffsetProperties();
        } else {
          contentYOffsetStart = 0;
          contentYOffsetEnd = 0;
          updateOffsetProperties();
          this.dataset.scrolling = "";
        }

        if (!supportsScrollAnimations) {
          updateContentYOffset();
        }

        if ("ScrollTimeline" in window) {
          // Needed for Safari 26+ to prevent flash of sheet position when toggling data-scrolling
          // before the scroll timeline is applied by the browser
          const timeline = new ScrollTimeline({
            source: this,
            axis: "y",
          });
          wrapper.style.setProperty(
            "--sheet-timeline-at-scroll-start",
            `${timeline.currentTime}`,
          );
        }
      } else if (!supportsScrollAnimations) {
        updateContentYOffset();
      }
    };

    const handleFallbackScrollEnd = () => {
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(handleScrollEnd, SCROLL_END_TIMEOUT_MS);
    };

    this.addEventListener("scroll", handleScroll);
    if (supportScrollEnd) {
      this.addEventListener("scrollend", handleScrollEnd);
    } else {
      this.addEventListener("scroll", handleFallbackScrollEnd);
    }

    this.#cleanupNestedScrollResizeOptimization = () => {
      this.removeEventListener("scroll", handleScroll);
      if (supportScrollEnd) {
        this.removeEventListener("scrollend", handleScrollEnd);
      } else {
        this.removeEventListener("scroll", handleFallbackScrollEnd);
        window.clearTimeout(scrollTimeout);
      }

      cleanupStyleProperties();
      this.#cleanupNestedScrollResizeOptimization = null;
    };
  }

  #setupSheetSizeObserver() {
    // We need to observe size changes of the sheet to re-dispatch snap-position-change
    // event in case the content height changes and causes a different snap point
    // to be the closest one to the sheet top.
    const resizeObserver = new ResizeObserver(() => {
      if (this.#currentSnapState) {
        this.#updateSnapPosition(this.#currentSnapState.snapTarget);
      }
    });

    const sheet = this.#shadow.querySelector<HTMLElement>(".sheet");
    if (sheet) {
      resizeObserver.observe(sheet);
    }

    this.#cleanupSheetSizeObserver = () => {
      resizeObserver.disconnect();
      this.#cleanupSheetSizeObserver = null;
    };
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;

    switch (name) {
      case "nested-scroll-optimization":
        if (newValue !== null) {
          if (!this.#cleanupNestedScrollResizeOptimization) {
            // Only setup if not already setup
            this.#setupNestedScrollResizeOptimization();
          }
        } else if (this.#cleanupNestedScrollResizeOptimization) {
          this.#cleanupNestedScrollResizeOptimization();
        }
        break;
      case "content-height":
        if (newValue !== null) {
          if (!this.#cleanupSheetSizeObserver) {
            // Only setup if not already setup
            this.#setupSheetSizeObserver();
          }
        } else if (this.#cleanupSheetSizeObserver) {
          this.#cleanupSheetSizeObserver();
        }
        break;
      default:
        console.warn(`Unhandled attribute: ${name}`);
    }
  }

  disconnectedCallback() {
    this.#cleanupIntersectionObserver?.();
    window.visualViewport?.removeEventListener(
      "resize",
      this.#handleViewportResize,
    );
  }
}

export interface BottomSheetHTMLAttributes {
  /**
   * When set, the bottom sheet maximum height is based on the the height of its
   * contents.
   */
  ["content-height"]?: boolean;
  /**
   * When set, enables scrolling the sheet inner content independently of the sheet.
   */
  ["nested-scroll"]?: boolean;
  /**
   * When set, enables resize optimization for the nested scroll mode to avoid reflows
   * during sheet resizing. Only relevant when `nested-scroll` is also true. Not relevant
   * for `expand-to-scroll` mode since it already avoids reflows.
   */
  ["nested-scroll-optimization"]?: boolean;
  /**
   * When set, content becomes scrollable only after full expansion. Only relevant
   * when `nested-scroll` is also true.
   */
  ["expand-to-scroll"]?: boolean;
  /**
   * When set, allows swiping down to dismiss the bottom sheet when used together
   * with the `bottom-sheet-dialog-manager` or with the Popover API.
   */
  ["swipe-to-dismiss"]?: boolean;
}

/**
 * Represents the current state of the bottom sheet.
 * - `collapsed`: Sheet is fully collapsed (closed/minimized)
 * - `partially-expanded`: Sheet is at an intermediate snap point
 * - `expanded`: Sheet is fully expanded to its maximum height
 */
export type SheetState = "collapsed" | "partially-expanded" | "expanded";

/**
 * Detail object for the `snap-position-change` custom event.
 */
export interface SnapPositionChangeEventDetail {
  /** The semantic state of the sheet */
  sheetState: SheetState;
  /**
   * The index of the current snap point (0 = collapsed,
   * higher values = more expanded, with the highest being fully expanded)
   */
  snapIndex: number;
}

export type BottomSheetEvents = {
  "snap-position-change": CustomEvent<SnapPositionChangeEventDetail>;
};
