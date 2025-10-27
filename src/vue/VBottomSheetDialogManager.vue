<template>
  <BottomSheetDialogManager>
    <ShadowRootTemplate
      :html="bottomSheetDialogManagerTemplate"
    ></ShadowRootTemplate>
    <slot></slot>
  </BottomSheetDialogManager>
</template>

<script setup lang="ts">
import { defineComponent, h, onMounted } from "vue";
import { bottomSheetDialogManagerTemplate } from "../web/index.ssr";
import ShadowRootTemplate from "./ShadowRootTemplate.vue";

// Vue wrapper component for the BottomSheetDialogManager web component so that
// the library users do not need to define bottom-sheet-dialog-manager as a custom element
const BottomSheetDialogManager = defineComponent({
  name: "bottom-sheet-dialog-manager",
  setup(_, { attrs, slots }) {
    return () => h("bottom-sheet-dialog-manager", attrs, slots);
  },
});

onMounted(() => {
  import("../web/index.client").then(({ BottomSheetDialogManager }) => {
    if (!customElements.get("bottom-sheet-dialog-manager")) {
      customElements.define(
        "bottom-sheet-dialog-manager",
        BottomSheetDialogManager,
      );
    }
  });
});
</script>
