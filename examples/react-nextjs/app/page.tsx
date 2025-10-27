import Link from "next/link";

export default function Page() {
  return (
    <main>
      <section>
        <h1>React / Next.js examples</h1>
        <p>The examples on this website are built with React and Next.js.</p>
        <section id="links">
          <ul>
            <li>
              <Link href="/non-dismissible/">
                Non-dismissible bottom sheet (with multiple snap points)
              </Link>
            </li>
            <li>
              <Link href="/dialog/">Modal bottom sheet (using dialog)</Link>
            </li>
            <li>
              <Link href="/non-dismissible-with-pages-router/">
                Non-dismissible bottom sheet (with multiple snap points) using
                Next.js Pages Router
              </Link>
            </li>
          </ul>
        </section>
      </section>
    </main>
  );
}
