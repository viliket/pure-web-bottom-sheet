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

export class BottomSheet extends HTMLElement {
  static observedAttributes = ["nested-scroll-optimization"];
  #observer: IntersectionObserver | null = null;
  #handleViewportResize = () => {
    this.style.setProperty(
      "--sw-keyboard-height",
      `${window.visualViewport?.offsetTop ?? 0}px`,
    );
  };
  #shadow: ShadowRoot;
  #cleanupNestedScrollResizeOptimization: (() => void) | null = null;

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
    this.#observer = new IntersectionObserver(
      (entries) => {
        let lowestIntersectingSnap = Infinity;
        let highestNonIntersectingSnap = -Infinity;
        let hasIntersectingElement = false;

        for (const entry of entries) {
          if (
            !(entry.target instanceof HTMLElement) ||
            entry.target.dataset.snap == null
          ) {
            continue;
          }

          const snap = Number.parseInt(entry.target.dataset.snap);

          if (entry.isIntersecting) {
            hasIntersectingElement = true;
            lowestIntersectingSnap = Math.min(lowestIntersectingSnap, snap);
          } else {
            highestNonIntersectingSnap = Math.max(
              highestNonIntersectingSnap,
              snap,
            );
          }
        }

        const newSnapPosition = hasIntersectingElement
          ? lowestIntersectingSnap
          : highestNonIntersectingSnap + 1;

        this.#updateSnapPosition(newSnapPosition.toString());
      },
      {
        root: this,
        threshold: 0,
        rootMargin: "1000% 0px -100% 0px",
      },
    );

    const sentinels = this.#shadow.querySelectorAll(".sentinel");
    Array.from(sentinels).forEach((sentinel) => {
      this.#observer?.observe(sentinel);
    });
  }

  #handleScrollSnapChange(event: Event) {
    const snapEvent = event as SnapEvent;
    if (!(snapEvent.snapTargetBlock instanceof HTMLElement)) {
      return;
    }
    const newSnapPosition = snapEvent.snapTargetBlock.dataset.snap ?? "1";
    this.#updateSnapPosition(newSnapPosition);
  }

  #updateSnapPosition(position: string) {
    this.dataset.sheetSnapPosition = position;
    this.dispatchEvent(
      new CustomEvent<{ snapPosition: string }>("snap-position-change", {
        detail: {
          snapPosition: position,
        },
        bubbles: true,
        composed: true,
      }),
    );
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
      requestAnimationFrame(() => {
        content.scrollTop = yOffset + content.scrollTop;
      });
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
      default:
        console.warn(`Unhandled attribute: ${name}`);
    }
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    window.visualViewport?.removeEventListener(
      "resize",
      this.#handleViewportResize,
    );
  }
}

/**
 * Interface for the bottom-sheet custom element.
 * Provides type definitions for its custom properties.
 *
 * @example
 * // Register in TypeScript for proper type checking:
 * declare global {
 *   interface HTMLElementTagNameMap {
 *     "bottom-sheet": BottomSheet;
 *   }
 * }
 */
export interface BottomSheet extends HTMLElement {
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
