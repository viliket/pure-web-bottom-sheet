# pure-web-bottom-sheet

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/viliket/pure-web-bottom-sheet/blob/main/LICENSE)
[![Build status](https://img.shields.io/github/actions/workflow/status/viliket/pure-web-bottom-sheet/test.yml?branch=main)](https://github.com/viliket/pure-web-bottom-sheet/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdeno.bundlejs.com%2F%3Fq%3Dpure-web-bottom-sheet&query=%24.size.uncompressedSize&label=bundle%20size)](https://bundlejs.com/?q=pure-web-bottom-sheet)
[![Bundle size (compressed)](<https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdeno.bundlejs.com%2F%3Fq%3Dpure-web-bottom-sheet&query=%24.size.compressedSize&label=bundle%20size%20(compressed)>)](https://bundlejs.com/?q=pure-web-bottom-sheet)
[![Version](https://img.shields.io/npm/v/pure-web-bottom-sheet)](https://www.npmjs.com/package/pure-web-bottom-sheet)

A lightweight, framework-agnostic bottom sheet component leveraging [CSS scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap)
and implemented as a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).
Its key features include:

- **Native scroll-driven sheet movement and snap points** - uses the browser’s own
  scroll mechanics instead of JavaScript-driven animations to adjust the sheet position
  through CSS scroll snapping
- **Near Zero-JavaScript** operation on modern browsers - core functionality is
  pure CSS
- **Framework-agnostic** - works with any framework or vanilla HTML
- **Easy customization** with a simple API
- **Accessibility** through native elements ([Dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
  or [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API))
  supporting touch, keyboard, or mouse scrolling
- **Server-side rendering (SSR) compatible** with declarative Shadow DOM support
- **Cross-browser support** - tested on Chrome, Safari, and Firefox (desktop and
  mobile)

The component uses CSS scroll snap and [CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
for its core functionality. It uses minimal JavaScript for backward compatibility
and optional features, such as swipe-to-dismiss. Relying on browser-driven scrolling
physics ensures a native-like feel across different browsers and a performant implementation
by not relying on JavaScript-driven animation logic.

For server-side rendering or static site generation, the component includes [declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom)
templates to avoid flash of unstyled content (FOUC) when displaying the bottom sheet
initially open on page load.

For technical details behind the implementation, read [Native-like bottom sheets on the web: the power of modern CSS](https://viliket.github.io/posts/native-like-bottom-sheets-on-the-web/).

https://github.com/user-attachments/assets/d25beef6-7256-4b7c-93ca-7605f73045b8

## 📦 Installation

```sh
npm install pure-web-bottom-sheet
```

## 💻 Usage

### Vanilla HTML

<details>
  <summary><strong>#️⃣ Example code - plain non-dismissible bottom sheet</strong></summary>

```html
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanilla HTML example</title>
  </head>
  <body>
    <bottom-sheet tabindex="0">
      <!-- Snap points -->
      <div slot="snap" style="--snap: 25%"></div>
      <div slot="snap" style="--snap: 50%" class="initial"></div>
      <div slot="snap" style="--snap: 75%"></div>

      <div slot="header">
        <h2>Custom header</h2>
      </div>
      <div slot="footer">
        <h2>Custom footer</h2>
      </div>

      <p>Custom content</p>
    </bottom-sheet>

    <script type="module">
      import { BottomSheet } from "https://unpkg.com/pure-web-bottom-sheet/pure-web-bottom-sheet";
      customElements.define("bottom-sheet", BottomSheet);
    </script>
  </body>
</html>
```

</details>

<details>
  <summary><strong>#️⃣ Example code - modal bottom sheet with dialog integration</strong></summary>

```html
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanilla HTML example</title>
  </head>
  <body>
    <bottom-sheet-dialog-manager>
      <dialog id="bottom-sheet-dialog">
        <bottom-sheet swipe-to-dismiss tabindex="0">
          <!-- Snap points -->
          <div slot="snap" style="--snap: 25%"></div>
          <div slot="snap" style="--snap: 50%" class="initial"></div>
          <div slot="snap" style="--snap: 75%"></div>

          <div slot="header">
            <h2>Custom header</h2>
          </div>
          <div slot="footer">
            <h2>Custom footer</h2>
          </div>

          <p>Custom content</p>
        </bottom-sheet>
      </dialog>
    </bottom-sheet-dialog-manager>

    <button id="show-button">Open bottom sheet</button>

    <script type="module">
      import { registerSheetElements } from "https://unpkg.com/pure-web-bottom-sheet/pure-web-bottom-sheet";
      registerSheetElements();

      document.getElementById("show-button").addEventListener("click", () => {
        document.getElementById("bottom-sheet-dialog").showModal();
      });
    </script>
  </body>
</html>
```

</details>

### Astro

<details>
  <summary><strong>#️⃣ Example code  - plain non-dismissible bottom sheet</strong></summary>

```astro
---
import { bottomSheetTemplate } from "pure-web-bottom-sheet/ssr";
---

<bottom-sheet tabindex="0">
  {/* Declarative shadow DOM for SSR support (optional) */}
  <template shadowrootmode="open">
    <Fragment set:html={bottomSheetTemplate} />
  </template>

  {/* Snap points */}
  <div slot="snap" style="--snap: 25%"></div>
  <div slot="snap" style="--snap: 50%" class="initial"></div>
  <div slot="snap" style="--snap: 75%"></div>

  <div slot="header">
    <h2>Custom header</h2>
  </div>
  <div slot="footer">
    <h2>Custom footer</h2>
  </div>

  Custom content
</bottom-sheet>

<script>
  import { BottomSheet } from "pure-web-bottom-sheet";
  customElements.define("bottom-sheet", BottomSheet);
</script>
```

</details>

<details>
  <summary><strong>#️⃣ Example code  - modal bottom sheet with dialog integration</strong></summary>

```astro
---
import { bottomSheetTemplate } from "pure-web-bottom-sheet/ssr";
---

<bottom-sheet-dialog-manager>
  <dialog id="bottom-sheet-dialog">
    <bottom-sheet swipe-to-dismiss tabindex="0">
      {/* Declarative shadow DOM for SSR support (optional) */}
      <template shadowrootmode="open">
        <Fragment set:html={bottomSheetTemplate} />
      </template>

      <!-- Snap points -->
      <div slot="snap" style="--snap: 25%"></div>
      <div slot="snap" style="--snap: 50%" class="initial"></div>
      <div slot="snap" style="--snap: 75%"></div>

      <div slot="header">
        <h2>Custom header</h2>
      </div>
      <div slot="footer">
        <h2>Custom footer</h2>
      </div>

      <p>Custom content</p>
    </bottom-sheet>
  </dialog>
</bottom-sheet-dialog-manager>

<button id="show-button">Open bottom sheet</button>

<script type="module">
  import { registerSheetElements } from "pure-web-bottom-sheet";
  registerSheetElements();

  document.getElementById("show-button").addEventListener("click", () => {
    document.getElementById("bottom-sheet-dialog").showModal();
  });
</script>
```

</details>

### React

For React, the library provides wrapper components to make it easier to use the
component and provide SSR support out of the box.

<details>
  <summary><strong>#️⃣ Example code - plain non-dismissible bottom sheet</strong></summary>

```tsx
import { BottomSheet } from "pure-web-bottom-sheet/react";

function Example() {
  return (
    <BottomSheet tabIndex={0}>
      <div slot="snap" style={{ "--snap": "25%" }} />
      <div slot="snap" style={{ "--snap": "50%" }} className="initial" />
      <div slot="snap" style={{ "--snap": "75%" }} />

      <div slot="header">
        <h2>Custom header</h2>
      </div>
      <div slot="footer">
        <h2>Custom footer</h2>
      </div>

      <p>Custom content</p>
    </BottomSheet>
  );
}
```

</details>

<details>
  <summary><strong>#️⃣ Example code - modal bottom sheet with dialog integration</strong></summary>

```tsx
import {
  BottomSheet,
  BottomSheetDialogManager,
} from "pure-web-bottom-sheet/react";

import { useRef } from "react";

function Example() {
  const dialog = useRef<HTMLDialogElement | null>(null);

  return (
    <section>
      <p>
        <button onClick={() => dialog.current?.showModal()}>
          Open as modal
        </button>
        <button onClick={() => dialog.current?.show()}>
          Open as non-modal
        </button>
      </p>
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
    </section>
  );
}
```

</details>

### Vue

Similarly, for Vue, the library provides wrapper components to make it easier to
use the component and provide SSR support out of the box.

<details>
  <summary><strong>#️⃣ Example code - plain non-dismissible bottom sheet</strong></summary>

```vue
<template>
  <VBottomSheet tabindex="0">
    <div slot="snap" style="--snap: 25%"></div>
    <div slot="snap" style="--snap: 50%" class="initial"></div>
    <div slot="snap" style="--snap: 75%"></div>

    <div slot="header">
      <h2>Custom header</h2>
    </div>
    <div slot="footer">
      <h2>Custom footer</h2>
    </div>

    Custom content
  </VBottomSheet>
</template>
<script setup>
import { VBottomSheet } from "pure-web-bottom-sheet/vue";
</script>
```

</details>

<details>
  <summary><strong>#️⃣ Example code - modal bottom sheet with dialog integration</strong></summary>

```vue
<template>
  <section>
    <p>
      <button @click="dialog.showModal()">Open as modal</button>
      <button @click="dialog.show()">Open as non-modal</button>
    </p>
    <VBottomSheetDialogManager>
      <dialog ref="bottom-sheet-dialog">
        <VBottomSheet class="example" swipe-to-dismiss tabindex="0">
          <div slot="header">
            <h2>Custom header</h2>
          </div>
          <div slot="footer">
            <h2>Custom footer</h2>
          </div>
          <div slot="snap" style="--snap: 25%"></div>
          <div slot="snap" style="--snap: 50%" class="initial"></div>
          <div slot="snap" style="--snap: 75%"></div>
          <DummyContent />
        </VBottomSheet>
      </dialog>
    </VBottomSheetDialogManager>
  </section>
</template>
<script setup>
import {
  VBottomSheet,
  VBottomSheetDialogManager,
} from "pure-web-bottom-sheet/vue";

const dialog = useTemplateRef("bottom-sheet-dialog");
</script>
```

</details>

## ▶️ Demos

See **[live examples and interactive demos](https://viliket.github.io/pure-web-bottom-sheet/)**

## 📄 API reference

### `<bottom-sheet>`: The bottom sheet element

The `<bottom-sheet>` element can be used as a standalone component, optionally
with the HTML Popover API (see the _Examples_ section below), or together with
a dialog element (see `<bottom-sheet-dialog-manager>` element in the following
section). When used without a dialog wrapper element or without the HTML Popover
API, the bottom sheet is non-dismissable. This approach can be useful, e.g., when
using the bottom sheet as an overlay that should always remain visible.

#### Example composition

```html
<bottom-sheet>
  <!-- Snap points -->
  <div slot="snap" style="--snap: 25%"></div>
  <div slot="snap" style="--snap: 50%" class="initial"></div>
  <div slot="snap" style="--snap: 75%"></div>

  <!-- Custom header -->
  <div slot="header">
    <h2>Custom header</h2>
  </div>

  <!-- Custom footer -->
  <div slot="footer">
    <h2>Custom footer</h2>
  </div>

  <!-- Custom content (default slot) -->
  Custom content
</bottom-sheet>
```

#### Attributes

- **`content-height`**  
  Specifies that the sheet's maximum height is based on the height of its contents.
  By default, when this attribute is not set, the sheet's maximum height is based
  on the `--sheet-max-height` property (see below)
  > ℹ️ **Note**: Not applicable when using the `nested-scroll` attribute
- **`nested-scroll`**  
  Specifies whether the bottom sheet acts as a scrollable container that allows
  scrolling its contents independent of the bottom sheet's snap position
- **`nested-scroll-optimization`**  
  Specifies that the bottom sheet uses resize optimization for the nested scroll
  mode to avoid reflows during sheet resizing. Only relevant when `nested-scroll`
  is also true. Not relevant for `expand-to-scroll` mode since it already avoids
  reflows.
  > ℹ️ **Note**: This attribute is experimental.
- **`expand-to-scroll`**  
  Specifies that the content of the bottom sheet can only be scrolled after the
  bottom sheet has been expanded to its full height
  > ℹ️ **Note**: Only applicable when `nested-scroll` attribute is also set
- **`swipe-to-dismiss`**  
  Specifies that the bottom sheet can be swiped down to dismiss, and it will have
  a snap point on the bottom to snap to close it
  > ℹ️ **Note**: Only relevant when either:
  >
  > - the `<bottom-sheet>` is placed inside a `<dialog>` wrapped
  >   in `bottom-sheet-dialog-manager` element
  > - using the Popover API (`popover` attribute on the bottom-sheet).

#### Slots

- **Default slot**  
  Defines the main content of the bottom sheet.
- **`snap`** (optional)  
  Defines snap points for positioning the bottom sheet. If not specified, the bottom
  sheet will have a single snap point `--snap: 100%` (maximum
  height). Note that when the `<bottom-sheet>` has the `swipe-to-dismiss` attribute
  set, it also has a snap point at the bottom of the viewport to allow swiping down
  to dismiss it.
  Each snap point element should:
  - Be assigned to this slot
  - Specify the `--snap` custom property to set to the wanted offset from the viewport
    top. For instance, `<div slot="snap" style="--snap: 50vh"></div>` creates a
    snap point at 50vh from the bottom of the viewport (vertical center), and
    a snap point with `--snap: 25vh` would position the sheet at 25vh from the viewport
    bottom. You may use any CSS length units, such as `px`, `vh` (based on viewport
    height), or `%` (based on sheet max height).
  - Optionally specify the class `initial` to make the bottom sheet
    initially snap to that point each time it is opened. Note that
    only a single snap point should specify this class.
- **`header`** (optional)  
  Optional header content that is displayed at the top of the bottom sheet.
- **`footer`** (optional)  
  Optional content that is displayed at the bottom of the bottom sheet.

#### CSS custom properties

- **`--sheet-max-height`**  
  Controls the maximum height of the bottom sheet.
  E.g., `--sheet-max-height: 50dvh;` means that the dialog max height is half of
  the dynamic viewport height, and `--sheet-max-height: 100dvh;` means that the dialog max height is the full dynamic viewport height
- **`--sheet-background`**  
  Specifies the `background` property of the bottom sheet
- **`--sheet-border-radius`**  
  Specifies the border radius of the bottom sheet

#### Events

- **`snap-position-change`** - type: `CustomEvent<{ sheetState: "collapsed" | "partially-expanded" | "expanded"; snapIndex: number; }>`  
  Notifies that the sheet snap position has changed. Snap index 0 corresponds to
  the collapsed state. The `sheetState` is one of the following:
  - `"collapsed"` - The bottom sheet is collapsed (i.e., snapped to the bottom).
  - `"partially-expanded"` - The bottom sheet is snapped to one of the intermediate
    snap points defined by the user.
  - `"expanded"` - The bottom sheet is fully expanded (i.e., snapped to the full
    height).

### `<bottom-sheet-dialog-manager>`: A utility element for the native `<dialog>` element to use the `<bottom-sheet>` element as a dialog

The `<bottom-sheet-dialog-manager>` element is used when the bottom sheet should
act as a modal that can be opened and closed. This element should have
a single native `dialog` element as its child, which itself should have a single
`bottom-sheet` element as its child. The purpose of the `<bottom-sheet-dialog-manager>`
is to provide additional CSS styles to the native `dialog` element, and to handle
closing the dialog when clicking on the backdrop, and to implement the swipe-to-dismiss
functionality.

Example HTML structure:

```html
<bottom-sheet-dialog-manager>
  <dialog id="my-dialog">
    <!-- 
      Remember to specify `swipe-to-dismiss` attribute to allow the manager to
      close the dialog when the bottom sheet is snapped to bottom of the viewport.
      
      Specify `tabindex="0"` when you want the bottom sheet element itself to be
      focusable. If set, it will appear in the tab order even if it has other focusable
      content.
    -->
    <bottom-sheet swipe-to-dismiss tabindex="0">
      <!-- Bottom sheet contents -->
    </bottom-sheet>
  </dialog>
</bottom-sheet-dialog-manager>

<button>Show the dialog</button>

<script>
  import { registerSheetElements } from "pure-web-bottom-sheet";
  registerSheetElements();

  const dialog = document.getElementById("my-dialog");
  const showButton = document.querySelector(
    "bottom-sheet-dialog-manager + button",
  );
  showButton.addEventListener("click", () => {
    dialog.showModal();
  });
</script>
```

## 🎨 Customization

The bottom sheet exposes all its relevant parts to allow adding custom styles or
overriding the default styles.

Here are the relevant CSS selectors for the sheet customization:

- **`bottom-sheet`**
- **`bottom-sheet::part(sheet)`**
- **`bottom-sheet::part(handle)`**
- **`bottom-sheet::part(content)`**
- **`bottom-sheet::part(header)`**
- **`bottom-sheet::part(footer)`**

## 🤝 Contributing

Contributions are welcome! Check out the [contributing guide](CONTRIBUTING.md) to get started.
