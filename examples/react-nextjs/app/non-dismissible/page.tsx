import { BottomSheet } from "pure-web-bottom-sheet/react";

import DummyContent from "../../components/DummyContent";

export default function Page() {
  return (
    <main>
      <section>
        <h1>Non-dismissible bottom sheet</h1>
      </section>
      <DummyContent />
      <BottomSheet tabIndex={0}>
        <div slot="snap" style={{ "--snap": "75%" }} />
        <div slot="snap" style={{ "--snap": "50%" }} className="initial" />
        <div slot="snap" style={{ "--snap": "25%" }} />
        <div slot="header">
          <h2>Custom header</h2>
        </div>
        <div slot="footer">
          <h2>Custom footer</h2>
        </div>

        <DummyContent />
      </BottomSheet>
    </main>
  );
}
