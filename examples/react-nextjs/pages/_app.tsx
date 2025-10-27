import Head from "next/head";
import "../app/global.css";

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content"
        />
        <meta charSet="UTF-8" />
        <title>Examples (React / Next.js) - pure-web-bottom-sheet</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
