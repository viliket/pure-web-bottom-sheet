import { FunctionalComponent, h } from "vue";
import ShadowRootTemplate from "./ShadowRootTemplate.vue";
import type {
  BottomSheetEvents,
  BottomSheetHTMLAttributes,
} from "../web/index.client.js";
import { bottomSheetTemplate } from "../web/index.ssr.js";
import Client from "./Client.vue";
import { CustomElementProps } from "./custom-element-props.js";

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
