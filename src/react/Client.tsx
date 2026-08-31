"use client";

import { useEffect } from "react";

export default function Client() {
  useEffect(() => {
    import("../web/index.client.js").then(
      ({ BottomSheet, BottomSheetDialogManager }) => {
        if (!customElements.get("bottom-sheet")) {
          customElements.define("bottom-sheet", BottomSheet);
        }
        if (!customElements.get("bottom-sheet-dialog-manager")) {
          customElements.define(
            "bottom-sheet-dialog-manager",
            BottomSheetDialogManager,
          );
        }
      },
    );
  }, []);
  return null;
}
