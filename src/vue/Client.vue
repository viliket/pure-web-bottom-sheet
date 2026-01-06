<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  import("../web/index.client").then(
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
});
</script>
