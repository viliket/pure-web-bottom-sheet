import { template } from "./bottom-sheet-dialog-manager.template";

export class BottomSheetDialogManager extends HTMLElement {
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

    this.addEventListener("click", (event) => {
      if (
        event.target instanceof HTMLDialogElement &&
        event.target.matches(":modal")
      ) {
        event.target.close();
      }
    });
    this.addEventListener(
      "snap-position-change",
      (event: CustomEventInit<{ snapPosition: string }> & Event) => {
        if (event.detail) {
          this.dataset.sheetSnapPosition = event.detail.snapPosition;
        }
        if (
          event.detail?.snapPosition == "2" &&
          event.target instanceof HTMLElement &&
          event.target.hasAttribute("swipe-to-dismiss") &&
          event.target.checkVisibility()
        ) {
          const parent = event.target.parentElement;
          if (
            parent instanceof HTMLDialogElement &&
            // Prevent Safari from closing the dialog immediately after opening
            // while the dialog open transition is still running.
            getComputedStyle(parent).getPropertyValue("translate") === "0px"
          ) {
            parent.close();
          }
        }
      },
    );
  }
}

/**
 * Interface for the bottom-sheet-dialog-manager custom element.
 * Provides type definitions for its custom properties.
 *
 * @example
 * // Register in TypeScript for proper type checking:
 * declare global {
 *   interface HTMLElementTagNameMap {
 *     "bottom-sheet-dialog-manager": BottomSheetDialogManager;
 *   }
 * }
 */
export interface BottomSheetDialogManager extends HTMLElement {}
