import BottomSheet from "./BottomSheet";
import BottomSheetDialogManager from "./BottomSheetDialogManager";

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
export type { BottomSheet as BottomSheetElement } from "../web/bottom-sheet";

export type {
  SheetState,
  SnapPositionChangeEventDetail,
  BottomSheetEvents,
  SnapToPointOptions,
} from "../web/bottom-sheet";
