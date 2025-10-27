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
      "bottom-sheet": WebComponentProps<BottomSheetElement>;
    }
  }
}

export default function BottomSheet({
  children,
  ...props
}: WebComponentProps<BottomSheetElement>) {
  return (
    <>
      <bottom-sheet
        {...props}
        // Need to use `suppressHydrationWarning` to avoid hydration mismatch
        // because the bottom-sheet component updates its `data-sheet-snap-position`
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
