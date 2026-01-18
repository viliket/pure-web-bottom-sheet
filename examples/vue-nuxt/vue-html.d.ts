import "@vue/runtime-dom";

declare module "@vue/runtime-dom" {
  interface HTMLAttributes {
    slot?: string | undefined;
  }
}
