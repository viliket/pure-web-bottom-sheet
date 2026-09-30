import type {
  BottomSheet as BottomSheetWebElement,
  BottomSheetHTMLAttributes,
  BottomSheetEvents,
} from "../web/index.client.js";
import { bottomSheetTemplate } from "../web/index.ssr.js";
import Client from "./Client.js";
import { CustomElementProps } from "./custom-element-props.js";
import ShadowRootTemplate from "./ShadowRootTemplate.js";

type BottomSheetProps = CustomElementProps<
  BottomSheetHTMLAttributes,
  BottomSheetEvents,
  BottomSheetWebElement
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
