<template>
  <section>
    <h1>Non-dismissible bottom sheet</h1>
    <DummyContent />
    <VBottomSheet
      class="example"
      tabindex="0"
      @snap-position-change="callback"
      expand-to-scroll
      nested-scroll
    >
      <div slot="header">
        <h2>Custom header</h2>
      </div>
      <div slot="footer">
        <h2>Custom footer</h2>
      </div>
      <div slot="snap" style="--snap: 75%"></div>
      <div slot="snap" style="--snap: 50%" class="initial"></div>
      <div slot="snap" style="--snap: 25%"></div>
      <DummyContent />
    </VBottomSheet>
  </section>
</template>
<script setup lang="ts">
import { VBottomSheet } from "pure-web-bottom-sheet/vue";
import type { SnapPositionChangeEventDetail } from "pure-web-bottom-sheet";

const callback = (event: CustomEvent<SnapPositionChangeEventDetail>) => {
  console.log("Snap position changed:", event.detail);
};
</script>

<style>
bottom-sheet.example h2 {
  margin: 0.5em 0;
  text-align: center;
}
</style>
