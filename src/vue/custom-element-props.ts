import { HTMLAttributes } from "vue";

type CamelCase<S extends string> =
  S extends `${infer P1}-${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K];
};

type EventMap = {
  [event: string]: Event;
};

type EventsToVueProps<ElementEvents extends EventMap> = {
  [K in keyof ElementEvents as `on${Capitalize<CamelCase<string & K>>}`]?: (
    value: ElementEvents[K],
  ) => void;
};

/**
 * Utility type to define props for Vue component wrapping a custom element.
 *
 * Note that attribute names should be provided in kebab-case when using the component
 * in templates to match the custom element's expected attributes and ensure SSR
 * compatibility.
 *
 * @see https://github.com/vuejs/rfcs/discussions/479
 */
export type CustomElementProps<
  ElementHTMLAttributes = {},
  ElementEvents extends EventMap = {},
> = KeysToCamelCase<ElementHTMLAttributes> &
  HTMLAttributes &
  EventsToVueProps<ElementEvents>;
