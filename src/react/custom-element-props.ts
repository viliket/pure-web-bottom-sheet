type EventMap = {
  [event: string]: Event;
};

type EventsToReactProps<ElementEvents extends EventMap> = {
  [K in keyof ElementEvents as `on${string & K}`]?: (
    event: ElementEvents[K],
  ) => void;
};

/**
 * Utility type to define props for custom elements (and React components wrapping them).
 */
export type CustomElementProps<
  ElementHTMLAttributes = {},
  ElementEvents extends EventMap = {},
> = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
  ElementHTMLAttributes &
  EventsToReactProps<ElementEvents>;
