import { BottomSheetEvents } from "../web/bottom-sheet";
import { bottomSheetDialogManagerTemplate } from "../web/index.ssr";
import Client from "./Client";
import { CustomElementProps } from "./custom-element-props";
import ShadowRootTemplate from "./ShadowRootTemplate";

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
