/* Needed until Prettier supports identifying embedded CSS by block comments */
const css = String.raw;

const styles = css`
  :host {
    --sheet-max-height: calc(100dvh - 24px);
    --sheet-background: rgb(242, 242, 242);
    --sheet-border-radius: 12px;
    /* 
      The --sw-keyboard-height is needed to handle iOS Safari on-screen keyboard
      since iOS Safari pushes content offscreen by keyboard height when it is opened
    */
    --sheet-safe-max-height: calc(
      var(--sheet-max-height) - env(
          keyboard-inset-height,
          var(--sw-keyboard-height, 0px)
        )
    );
    display: block;
    position: fixed;
    right: 0;
    bottom: env(keyboard-inset-height, 0);
    left: 0;
    will-change: scroll-position;
    contain: strict;
    border-top-right-radius: var(--sheet-border-radius);
    border-top-left-radius: var(--sheet-border-radius);
    height: var(--sheet-max-height);
    max-height: var(--sheet-safe-max-height);
    overflow-y: scroll;
    /* Prevent rubberband effect when scrolling to the end of the sheet */
    overscroll-behavior-y: none;
    scroll-snap-type: y mandatory;
    scrollbar-width: none;
    pointer-events: none;
  }

  :host(:focus-visible) {
    outline: none;

    .handle {
      outline: auto;
      outline-offset: 4px;
    }
  }

  .snap,
  ::slotted([slot="snap"]) {
    position: relative;
    top: var(--snap);
  }

  .snap::before,
  ::slotted([slot="snap"])::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 1px; /* Height required for Safari to snap */
    scroll-snap-align: var(--snap-point-align, start);
    content: "";
  }

  .snap.initial,
  ::slotted([slot="snap"].initial) {
    --snap-point-align: start;
  }

  .snap.snap-bottom {
    position: static;
    top: initial;
    height: auto;

    &::after {
      display: block;
      position: static;
      height: var(--sheet-max-height);
      max-height: var(--sheet-safe-max-height);
      content: "";
    }
  }

  :host(:not([swipe-to-dismiss])) .snap.snap-bottom::before {
    scroll-snap-align: none;
  }

  .sentinel {
    position: relative;

    &[data-snap="top"] {
      top: -1px; /** Extra -1px needed for Safari */
    }
    &[data-snap="bottom"] {
      top: 1px;
    }
  }

  .sheet-wrapper {
    border-radius: inherit;
  }

  .sheet {
    display: flex;
    flex-direction: column;
    cursor: row-resize;
    border-radius: inherit;
    background: var(--sheet-background);
    overflow: clip;
    scroll-snap-align: var(--snap-point-align, start);
    pointer-events: all;
  }

  /* 
    Needed for Safari/Firefox to prevent abrupt scroll re-snapping in case the
    sheet DOM content is dynamically changed. Without this, these browsers would
    re-snap to the start of the .sheet element.
    See related spec: https://drafts.csswg.org/css-scroll-snap-1/#re-snap
  */
  .sheet::after {
    display: block;
    position: static;
    scroll-snap-align: var(--snap-point-align, end);
    content: "";
  }

  .sheet-header {
    position: sticky;
    top: 0;
    background: inherit;
    width: 100%;
  }

  .sheet-footer {
    position: sticky;
    bottom: 0;
    background: inherit;
    width: 100%;
  }

  .sheet-content {
    flex: 1 1 auto;
    padding: 0 0.5rem;
  }

  .handle {
    margin: 0.5rem auto;
    border-radius: 5px;
    background: #ccc;
    width: 40px;
    height: 5px;
  }

  :host {
    animation: initial-snap 0.01s both;
  }

  /* Safari overrides */
  @supports (-webkit-touch-callout: none) or (-webkit-hyphens: none) {
    :host {
      /* 
        On Safari, when displaying in a dialog, we must inherit display property
        so that the animation runs each time the dialog is-reopened
        (display toggles between none and block).
      */
      display: inherit;
      /* 
        On Safari the duration must be higher for the initial-snap animation
        to properly snap to the initial target.
      */
      animation: initial-snap 0.1s both;
    }
  }

  /*
    Temporarily disables scroll snapping for all snap points
    except the explicitly marked initial snap point (which overrides
    --snap-point-align) so that the sheet snaps to
    the initial snap point.
  */
  @keyframes initial-snap {
    0% {
      --snap-point-align: none;
    }
    50% {
      /* 
        Needed for the iOS Safari
        See https://stackoverflow.com/q/65653679
      */
      scroll-snap-type: initial;
      --snap-point-align: none;
    }
  }

  /* Temporary workaround for iOS Safari bug https://bugs.webkit.org/show_bug.cgi?id=183870 */
  @supports (-webkit-touch-callout: none) {
    .sheet-content,
    .sheet-header,
    .sheet-footer {
      overflow-x: scroll;
      /* Prevent rubberband effect */
      overscroll-behavior-x: none;
      scrollbar-width: none;

      &::after {
        display: block;
        box-sizing: content-box;
        padding: inherit;
        padding-left: 0;
        width: calc(100% + 1px);
        height: 1px;
        content: "";
      }
    }
    .sheet-content {
      scrollbar-width: auto;
    }
  }

  :host(:not([nested-scroll]):not([content-height])) {
    .sheet-wrapper {
      height: 100%;
    }

    .sheet {
      min-height: 100%;
    }
  }

  :host([nested-scroll]) {
    .sheet-wrapper {
      display: flex;
      position: sticky;
      bottom: 0;
      flex-direction: column;
      justify-content: end;
      /* Fixes scroll-chaining issue on Firefox when sheet content is scrollable */
      contain: strict;
      height: 100%;
    }

    .sheet {
      display: flex;
      position: sticky;
      bottom: 0;
      flex-direction: column;
      height: 100%;
      max-height: 100%;
    }

    .sheet-content {
      will-change: scroll-position;
      overflow-y: auto;
      scrollbar-gutter: stable;
    }

    .sheet-header,
    .sheet-footer {
      /* Prevent shrinking the header and footer */
      flex: 0 0 auto;
    }
  }

  /*
    When expand-to-scroll is enabled, we do not need dynamic sheet height animation
    since sheet content is always fixed size and only scrollable at full height
    so we can simplify the layout and improve performance by disabling height animation.
  */
  :host([nested-scroll][expand-to-scroll]) {
    .sheet-wrapper {
      position: static;
    }

    .sheet {
      position: static;
      animation: none;
      height: 100%;
    }
  }

  /*
    Performance optimization for the nested-scroll mode:
    When the sheet is being actively scrolled, disable sheet height animation and
    switch to transform-based animation for the sheet content to improve performance
    and avoid jank because animating height would cause continuous reflow (layout).

    Follow use of [data-scrolling] for the specific CSS rules applied in this case.
  */
  :host([nested-scroll]:not([expand-to-scroll])[data-scrolling]) {
    .sheet-header {
      z-index: 1;
    }

    .sheet-content {
      /* Hide the scrollbar visually during scrolling */
      scrollbar-color: transparent transparent;
    }
  }

  @supports ((animation-timeline: scroll()) and (animation-range: 0% 100%)) {
    :host {
      scroll-timeline: --sheet-timeline y;
    }

    :host([nested-scroll]) .sheet {
      animation: expand-sheet-height linear forwards;
      animation-timeline: --sheet-timeline;
    }

    @keyframes expand-sheet-height {
      from {
        height: 0;
      }
      to {
        height: 100%;
      }
    }

    :host([nested-scroll][expand-to-scroll]) .sheet-content {
      animation: overflow-y-toggle linear forwards;
      animation-timeline: --sheet-timeline;
    }

    @keyframes overflow-y-toggle {
      0%,
      99.99% {
        overflow-y: hidden;
      }
      100% {
        overflow-y: auto;
      }
    }

    :host([nested-scroll]:not([expand-to-scroll])[data-scrolling]) {
      .sheet {
        /* 
          Safari bug fix: Pre-apply transform to prevent flickering. Safari 26+ has
          a one-frame delay when switching from height-based to transform-based animation,
          causing brief position shift. Setting an initial transform value ensures
          smooth transition.
        */
        transform: translateY(var(--sheet-timeline-at-scroll-start, 0));
        animation: translate-sheet linear forwards;
        animation-timeline: --sheet-timeline;
      }

      .sheet-content {
        animation: translate-sheet-content linear forwards;
        animation-timeline: --sheet-timeline;
      }

      .sheet-footer {
        animation: translate-footer linear forwards;
        animation-timeline: --sheet-timeline;
      }
    }

    @keyframes translate-sheet {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @keyframes translate-sheet-content {
      from {
        transform: translateY(var(--sheet-content-offset-start, 0));
      }
      to {
        transform: translateY(var(--sheet-content-offset-end, 0));
      }
    }

    @keyframes translate-footer {
      from {
        transform: translateY(calc(-1 * var(--sheet-safe-max-height)));
      }
      to {
        transform: translateY(0);
      }
    }
  }

  /* Fallback for browsers that do not yet support scroll-driven animations */
  @supports (
    not ((animation-timeline: scroll()) and (animation-range: 0% 100%))
  ) {
    :host([nested-scroll]) .sheet {
      height: var(--sheet-position);
    }

    :host([nested-scroll][expand-to-scroll]) .sheet-content {
      overflow-y: hidden;
    }

    :host([nested-scroll][expand-to-scroll][data-sheet-state="expanded"])
      .sheet-content {
      overflow-y: auto;
    }

    :host([nested-scroll]:not([expand-to-scroll])[data-scrolling]) {
      .sheet {
        transform: translateY(calc(100% - var(--sheet-position, 0)));
        height: 100%;
      }

      .sheet-content {
        transform: translateY(var(--sheet-content-offset, 0));
      }

      .sheet-footer {
        transform: translateY(
          calc(-1 * var(--sheet-safe-max-height) + var(--sheet-position, 0))
        );
      }
    }
  }
`;

export const template: string = /* HTML */ `
  <style>
    ${styles}
  </style>
  <slot name="snap">
    <div class="snap initial" style="--snap: 100%"></div>
  </slot>
  <div class="sentinel" data-snap="bottom"></div>
  <div class="snap snap-bottom" data-snap="bottom"></div>
  <div class="sentinel" data-snap="top"></div>
  <div class="sheet-wrapper">
    <aside class="sheet" part="sheet" data-snap="top">
      <header class="sheet-header" part="header">
        <div class="handle" part="handle"></div>
        <slot name="header"></slot>
      </header>
      <section class="sheet-content" part="content">
        <slot></slot>
      </section>
      <footer class="sheet-footer" part="footer">
        <slot name="footer"></slot>
      </footer>
    </aside>
  </div>
`;
