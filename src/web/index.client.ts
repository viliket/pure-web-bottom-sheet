import { BottomSheet } from "./bottom-sheet.js";
import { BottomSheetDialogManager } from "./bottom-sheet-dialog-manager.js";

export { BottomSheet, BottomSheetDialogManager };

export type {
  SheetState,
  SnapPositionChangeEventDetail,
  BottomSheetEvents,
  BottomSheetHTMLAttributes,
  SnapToPointOptions,
} from "./bottom-sheet.js";

export function registerSheetElements() {
  customElements.define("bottom-sheet", BottomSheet);
  customElements.define(
    "bottom-sheet-dialog-manager",
    BottomSheetDialogManager,
  );
}
