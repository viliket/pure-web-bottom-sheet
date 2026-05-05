<template>
  <section>
    <h1>Non-dismissible bottom sheet</h1>
    <DummyContent />
    <VBottomSheet
      ref="sheet"
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
        <small>Snap to point</small>
        <button
          v-for="index in [1, 2, 3, 4]"
          :key="index"
          type="button"
          @click="sheet?.snapToPoint(index)"
        >
          {{ index }}
        </button>
      </div>
      <div slot="snap" style="--snap: 75%"></div>
      <div slot="snap" style="--snap: 50%" class="initial"></div>
      <div slot="snap" style="--snap: 25%"></div>
      <DummyContent />
    </VBottomSheet>
  </section>
</template>
<script setup lang="ts">
import { useTemplateRef } from "vue";
import {
  VBottomSheet,
  type BottomSheetElement,
  type SnapPositionChangeEventDetail,
} from "pure-web-bottom-sheet/vue";

const sheet = useTemplateRef<BottomSheetElement>("sheet");

const callback = (event: CustomEvent<SnapPositionChangeEventDetail>) => {
  console.log("Snap position changed:", event.detail);
};
</script>

<style>
bottom-sheet.example h2 {
  margin: 0.5em 0;
  text-align: center;
}

bottom-sheet.example [slot="footer"] {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;

  small {
    flex-basis: 100%;
    text-align: center;
  }
}
</style>
