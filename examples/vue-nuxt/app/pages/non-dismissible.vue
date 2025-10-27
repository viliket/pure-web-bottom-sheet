<template>
  <section>
    <h1>Non-dismissible bottom sheet</h1>
    <DummyContent />
    <VBottomSheet class="example" tabindex="0">
      <div slot="header">
        <h2>Custom header</h2>
      </div>
      <div slot="footer">
        <h2>Custom footer</h2>
      </div>
      <div slot="snap" style="--snap: 25%"></div>
      <div slot="snap" style="--snap: 50%" class="initial"></div>
      <div slot="snap" style="--snap: 75%"></div>
      <DummyContent />
    </VBottomSheet>
  </section>
</template>
<script setup>
import { VBottomSheet } from "pure-web-bottom-sheet/vue";
</script>

<style>
bottom-sheet.example h2 {
  margin: 0.5em 0;
  text-align: center;
}
</style>
