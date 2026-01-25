<template>
  <section>
    <h1>Modal bottom sheet (using dialog)</h1>
    <button @click="dialog?.showModal()">Open as modal</button>
    <button @click="dialog?.show()">Open as non-modal</button>
    <DummyContent />
    <VBottomSheetDialogManager>
      <dialog ref="bottom-sheet-dialog">
        <VBottomSheet class="example" swipe-to-dismiss tabindex="0">
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
      </dialog>
    </VBottomSheetDialogManager>
  </section>
</template>
<script setup lang="ts">
import {
  VBottomSheet,
  VBottomSheetDialogManager,
} from "pure-web-bottom-sheet/vue";

const dialog = useTemplateRef("bottom-sheet-dialog");
</script>

<style>
bottom-sheet.example h2 {
  margin: 0.5em 0;
  text-align: center;
}
</style>
