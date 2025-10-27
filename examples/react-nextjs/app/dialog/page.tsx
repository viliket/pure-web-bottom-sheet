"use client";

import {
  BottomSheet,
  BottomSheetDialogManager,
} from "pure-web-bottom-sheet/react";

import { useRef } from "react";
import DummyContent from "../../components/DummyContent";

export default function Page() {
  const dialog = useRef<HTMLDialogElement | null>(null);

  return (
    <main>
      <section>
        <h1>Modal bottom sheet (using dialog)</h1>
        <button onClick={() => dialog.current?.showModal()}>
          Open as modal
        </button>
        <button onClick={() => dialog.current?.show()}>
          Open as non-modal
        </button>
      </section>
      <DummyContent />
      <BottomSheetDialogManager>
        <dialog ref={dialog}>
          <BottomSheet swipe-to-dismiss tabIndex={0}>
            <div slot="snap" style={{ "--snap": "25%" }} />
            <div slot="snap" style={{ "--snap": "50%" }} className="initial" />
            <div slot="snap" style={{ "--snap": "75%" }} />
            <div slot="header">
              <h2>Custom header</h2>
            </div>
            <div slot="footer">
              <h2>Custom footer</h2>
            </div>
            <DummyContent />
          </BottomSheet>
        </dialog>
      </BottomSheetDialogManager>
    </main>
  );
}
