import { BottomSheetHTMLAttributes } from "../web/bottom-sheet";
import { BottomSheetEvents } from "../web/index.client";
import { bottomSheetTemplate } from "../web/index.ssr";
import Client from "./Client";
import { CustomElementProps } from "./custom-element-props";
import ShadowRootTemplate from "./ShadowRootTemplate";

type BottomSheetProps = CustomElementProps<
  BottomSheetHTMLAttributes,
  BottomSheetEvents
>;

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "bottom-sheet": BottomSheetProps;
    }
  }
}

export default function BottomSheet({ children, ...props }: BottomSheetProps) {
  return (
    <>
      <bottom-sheet
        {...props}
        // Need to use `suppressHydrationWarning` to avoid hydration mismatch
        // because the bottom-sheet component updates its `data-sheet-state`
        // attribute during the initial render, which is not reflected in the
        // server-rendered HTML.
        suppressHydrationWarning
      >
        {<ShadowRootTemplate html={bottomSheetTemplate} />}
        {children}
      </bottom-sheet>
      <Client />
    </>
  );
}
