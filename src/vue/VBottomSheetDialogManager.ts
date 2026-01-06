import { FunctionalComponent, h } from "vue";
import ShadowRootTemplate from "./ShadowRootTemplate.vue";
import { BottomSheetEvents } from "../web/bottom-sheet";
import { bottomSheetDialogManagerTemplate } from "../web/index.ssr";
import Client from "./Client.vue";
import { CustomElementProps } from "./custom-element-props";

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
