import type { BottomSheetEvents } from "../web/index.client.js";
import { bottomSheetDialogManagerTemplate } from "../web/index.ssr.js";
import Client from "./Client.js";
import { CustomElementProps } from "./custom-element-props.js";
import ShadowRootTemplate from "./ShadowRootTemplate.js";

type BottomSheetDialogManagerProps = CustomElementProps<{}, BottomSheetEvents>;

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "bottom-sheet-dialog-manager": BottomSheetDialogManagerProps;
    }
  }
}

export default function BottomSheetDialogManager({
  children,
  ...props
}: BottomSheetDialogManagerProps) {
  return (
    <>
      <bottom-sheet-dialog-manager {...props}>
        {<ShadowRootTemplate html={bottomSheetDialogManagerTemplate} />}
        {children}
      </bottom-sheet-dialog-manager>
      <Client />
    </>
  );
}
