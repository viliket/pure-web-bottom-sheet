import { FunctionalComponent, h } from "vue";
import ShadowRootTemplate from "./ShadowRootTemplate.vue";
import {
  BottomSheetEvents,
  BottomSheetHTMLAttributes,
} from "../web/bottom-sheet";
import { bottomSheetTemplate } from "../web/index.ssr";
import Client from "./Client.vue";
import { CustomElementProps } from "./custom-element-props";

const VBottomSheet: FunctionalComponent<
  CustomElementProps<BottomSheetHTMLAttributes, BottomSheetEvents>
> = (props, { slots }) => {
  return h("bottom-sheet", props, [
    h(ShadowRootTemplate, { html: bottomSheetTemplate }),
    slots.default?.(),
    h(Client),
  ]);
};

export default VBottomSheet;
