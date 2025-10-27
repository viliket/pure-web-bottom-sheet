/* Needed until Prettier supports identifying embedded CSS by block comments */
const css = String.raw;

const styles = css`
  ::slotted(dialog) {
    position: fixed;
    margin: 0;
    inset: 0;
    top: initial;
    border: none;
    background: unset;
    padding: 0;
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
  }

  ::slotted(dialog:not(:modal)) {
    pointer-events: none;
  }

  ::slotted(dialog[open]) {
    translate: 0 0;
  }

  @starting-style {
    ::slotted(dialog[open]) {
      translate: 0 100vh;
    }
  }

  ::slotted(dialog) {
    translate: 0 100vh;
    transition:
      translate 0.5s ease-out,
      overlay 0.5s ease-out allow-discrete,
      display var(--display-transition-duration, 0.5s) ease-out allow-discrete;
  }

  :host([data-sheet-snap-position="2"]) ::slotted(dialog:not([open])) {
    transition: none;
  }

  /** Safari overrides */
  @supports (-webkit-touch-callout: none) or (-webkit-hyphens: none) {
    ::slotted(dialog) {
      /* 
        For Safari we must user shorter duration for display property or otherwise
        the bottom sheet will not snap properly to the initial target on open.
      */
      --display-transition-duration: 0.1s;
    }
  }
`;

export const template: string = /* HTML */ `
  <style>
    ${styles}
  </style>
  <slot></slot>
`;
