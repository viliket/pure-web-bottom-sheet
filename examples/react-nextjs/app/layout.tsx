import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content"
        />
        <title>Examples (React / Next.js) - pure-web-bottom-sheet</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
