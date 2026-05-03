import type { BottomSheet } from "pure-web-bottom-sheet";

export default class BottomSheetComponent<
  T extends Record<string, number> = Record<string, number>,
> {
  #selector: string;
  #snapPoints: T;

  constructor(selector: string, snapPoints: T) {
    this.#selector = selector;
    this.#snapPoints = snapPoints;
  }

  get snapPoints() {
    return this.#snapPoints;
  }

  get host() {
    return $(this.#selector);
  }

  get header() {
    return this.host.shadow$('[part="header"]');
  }

  get sheetSurface() {
    return this.host.shadow$('[part="sheet"]');
  }

  async scrollByRelativeToHeight(fraction: number) {
    const clientHeight = (await this.host.getProperty(
      "clientHeight",
    )) as number;
    await this.host.scrollBy(clientHeight * fraction);
  }

  async setScrollTopRelativeToHeight(fraction: number) {
    const clientHeight = (await this.host.getProperty(
      "clientHeight",
    )) as number;
    const targetScrollTop = clientHeight * fraction;

    await this.host.execute((el, scrollTop) => {
      el.scrollTop = scrollTop as number;
    }, targetScrollTop);
  }

  /** Calls `snapToPoint(index, { behavior })` on the bottom sheet host element. */
  async callSnapToPoint(index: number, behavior?: ScrollBehavior) {
    const host = await this.host.getElement();
    return host.execute(
      (el, i, b) => {
        (el as BottomSheet).snapToPoint(i, b ? { behavior: b } : undefined);
      },
      index,
      behavior,
    );
  }

  /** Waits for all snap points to become active after the initial snap animation. */
  async waitForSnapPointsToActivate(): Promise<void> {
    await this.host.waitForAnimationsToFinish();
  }
}
