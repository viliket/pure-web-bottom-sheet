"use client";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      template: React.HTMLAttributes<HTMLTemplateElement> & {
        shadowrootmode?: ShadowRootMode;
        shadowrootdelegatesfocus?: string;
      };
    }
  }
}

const isServer = typeof window === "undefined";

export default function Template({ html }: { html: string }) {
  if (isServer) {
    return (
      <template
        shadowrootmode="open"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    );
  }
  return null;
}
