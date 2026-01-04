import { BottomSheet } from "./bottom-sheet";
import { BottomSheetDialogManager } from "./bottom-sheet-dialog-manager";

export { BottomSheet, BottomSheetDialogManager };

export type {
  SnapPositionChangeEventDetail,
  BottomSheetEvents,
} from "./bottom-sheet";

export function registerSheetElements() {
  customElements.define("bottom-sheet", BottomSheet);
  customElements.define(
    "bottom-sheet-dialog-manager",
    BottomSheetDialogManager,
  );
}
