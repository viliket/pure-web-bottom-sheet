import {
  BottomSheet,
  type BottomSheetElement,
} from "pure-web-bottom-sheet/react";
import DummyContent from "../components/DummyContent";
import "../app/global.css";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [, setHasMounted] = useState(false);
  const sheetRef = useRef<BottomSheetElement>(null);

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
        ref={sheetRef}
        tabIndex={0}
        onsnap-position-change={(e) =>
          console.log("Snap position changed:", e.detail)
        }
      >
        <div slot="snap" style={{ "--snap": "75%" }} />
        <div slot="snap" style={{ "--snap": "50%" }} className="initial" />
        <div slot="snap" style={{ "--snap": "25%" }} />
        <div slot="header">
          <h2>Custom header</h2>
        </div>
        <div
          slot="footer"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.5rem",
          }}
        >
          <small style={{ flexBasis: "100%", textAlign: "center" }}>
            Snap to point
          </small>
          {[1, 2, 3, 4].map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => sheetRef.current?.snapToPoint(index)}
            >
              {index}
            </button>
          ))}
        </div>

        <DummyContent />
      </BottomSheet>
    </main>
  );
}
