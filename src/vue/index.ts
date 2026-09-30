export { default as VBottomSheet } from "./VBottomSheet.js";
export { default as VBottomSheetDialogManager } from "./VBottomSheetDialogManager.js";

/**
 * Type alias for the underlying `BottomSheet` web component element. Use this
 * to type a template ref so that public methods like `snapToPoint(index)` are
 * accessible from the ref.
 *
 * @example
 * import { useTemplateRef } from "vue";
 * import { VBottomSheet, type BottomSheetElement } from "pure-web-bottom-sheet/vue";
 *
 * const sheet = useTemplateRef<BottomSheetElement>("sheet");
 * sheet.value?.snapToPoint(2);
 */
export type { BottomSheet as BottomSheetElement } from "../web/index.client.js";

export type {
  SheetState,
  SnapPositionChangeEventDetail,
  BottomSheetEvents,
  SnapToPointOptions,
} from "../web/index.client.js";
