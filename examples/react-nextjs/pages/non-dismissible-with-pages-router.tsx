import { BottomSheet } from "pure-web-bottom-sheet/react";
import DummyContent from "../components/DummyContent";
import "../app/global.css";
import { useEffect, useState } from "react";

export default function Page() {
  const [, setHasMounted] = useState(false);

  useEffect(() => {
    // Workaround for React 19 hydration bug: Forces a re-render after mount to ensure
    // event listeners on web components (like onsnap-position-change) are properly
    // attached. Without this, custom events from web components do not fire on
    // server-side rendered pages. See: https://github.com/facebook/react/issues/35446
    // TODO: Remove this workaround once React 19 fixes the web component hydration issue
    setHasMounted(true);
  }, []);

  return (
    <main>
      <section>
        <h1>Non-dismissible bottom sheet (Next.js Pages Router)</h1>
      </section>
      <DummyContent />
      <BottomSheet
        tabIndex={0}
        onsnap-position-change={(e) =>
          console.log("Snap position changed:", e.detail)
        }
      >
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
    </main>
  );
}
