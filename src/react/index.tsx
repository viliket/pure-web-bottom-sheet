import BottomSheet from "./BottomSheet.js";
import BottomSheetDialogManager from "./BottomSheetDialogManager.js";

export { BottomSheet, BottomSheetDialogManager };

/**
 * Type alias for the underlying `BottomSheet` web component element. Use this
 * to type a `ref` so that public methods like `snapToPoint(index)` are
 * accessible from the ref.
 *
 * @example
 * import { useRef } from "react";
 * import { BottomSheet, type BottomSheetElement } from "pure-web-bottom-sheet/react";
 *
 * const ref = useRef<BottomSheetElement>(null);
 * ref.current?.snapToPoint(2);
 */
export type { BottomSheet as BottomSheetElement } from "../web/index.client.js";

export type {
  SheetState,
  SnapPositionChangeEventDetail,
  BottomSheetEvents,
  SnapToPointOptions,
} from "../web/index.client.js";
