import { FunctionalComponent, h } from "vue";
import ShadowRootTemplate from "./ShadowRootTemplate.vue";
import type { BottomSheetEvents } from "../web/index.client.js";
import { bottomSheetDialogManagerTemplate } from "../web/index.ssr.js";
import Client from "./Client.vue";
import { CustomElementProps } from "./custom-element-props.js";

const VBottomSheetDialogManager: FunctionalComponent<
  CustomElementProps<{}, BottomSheetEvents>
> = (props, { slots }) => {
  return h("bottom-sheet-dialog-manager", props, [
    h(ShadowRootTemplate, { html: bottomSheetDialogManagerTemplate }),
    slots?.default?.(),
    h(Client),
  ]);
};

export default VBottomSheetDialogManager;
