<template>
  <BottomSheet>
    <ShadowRootTemplate :html="bottomSheetTemplate"></ShadowRootTemplate>
    <slot></slot>
  </BottomSheet>
</template>

<script setup lang="ts">
import { defineComponent, h, onMounted } from "vue";
import { bottomSheetTemplate } from "../web/index.ssr";
import ShadowRootTemplate from "./ShadowRootTemplate.vue";

// Vue wrapper component for the BottomSheet web component so that
// the library users do not need to define bottom-sheet as a custom element
const BottomSheet = defineComponent({
  name: "bottom-sheet",
  setup(_, { attrs, slots }) {
    return () => h("bottom-sheet", attrs, slots);
  },
});

onMounted(() => {
  import("../web/index.client").then(({ BottomSheet }) => {
    if (!customElements.get("bottom-sheet")) {
      customElements.define("bottom-sheet", BottomSheet);
    }
  });
});
</script>
