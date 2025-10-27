<script setup lang="ts">
import { h, Fragment } from "vue";

const props = defineProps({
  html: {
    type: String,
    required: true,
  },
});

const isServer = typeof window === "undefined";

const renderShadowRootTemplate = () => {
  if (!isServer) return h(Fragment, []);

  return h(Fragment, [
    h("template", {
      shadowrootmode: "open",
      innerHTML: props.html,
    }),
  ]);
};
</script>

<template>
  <component :is="{ render: renderShadowRootTemplate }" />
</template>
