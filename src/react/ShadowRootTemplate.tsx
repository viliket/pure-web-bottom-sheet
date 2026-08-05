"use client";

const isServer = typeof window === "undefined";

export default function Template({ html }: { html: string }) {
  if (isServer) {
    return (
      <template
        // React's <template> types do not yet include Declarative Shadow DOM attributes.
        {...{ shadowrootmode: "open" }}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    );
  }
  return null;
}
