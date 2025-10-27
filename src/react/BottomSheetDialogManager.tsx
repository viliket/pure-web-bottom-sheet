import {
  bottomSheetDialogManagerTemplate,
  BottomSheetDialogManager as BottomSheetDialogManagerElement,
} from "../web/index.ssr";
import Client from "./Client";
import ShadowRootTemplate from "./ShadowRootTemplate";

type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;
export type WebComponentProps<I extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<I>,
  I
> &
  ElementProps<I>;

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "bottom-sheet-dialog-manager": WebComponentProps<BottomSheetDialogManagerElement>;
    }
  }
}

export default function BottomSheetDialogManager({
  children,
  ...props
}: WebComponentProps<BottomSheetDialogManagerElement>) {
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
