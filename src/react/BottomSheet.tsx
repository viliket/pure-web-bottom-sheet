import type { JSX } from "react/jsx-runtime";
import { SnapPositionChangeEventDetail } from "../web/index.client";
import {
  bottomSheetTemplate,
  BottomSheet as BottomSheetElement,
} from "../web/index.ssr";
import Client from "./Client";
import ShadowRootTemplate from "./ShadowRootTemplate";

type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;
export type WebComponentProps<I extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  ElementProps<I>;

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "bottom-sheet": WebComponentProps<BottomSheetElement> & {
        "onsnap-position-change"?: (
          event: CustomEvent<SnapPositionChangeEventDetail>,
        ) => void;
      };
    }
  }
}

export default function BottomSheet({
  children,
  onSnapPositionChange,
  ...props
}: WebComponentProps<BottomSheetElement> & {
  onSnapPositionChange: JSX.IntrinsicElements["bottom-sheet"]["onsnap-position-change"];
}) {
  return (
    <>
      <bottom-sheet
        onsnap-position-change={onSnapPositionChange}
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
