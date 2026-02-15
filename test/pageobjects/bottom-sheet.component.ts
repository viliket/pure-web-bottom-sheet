export default class BottomSheetComponent<
  T extends Record<string, number> = Record<string, number>,
> {
  constructor(
    private selector: string,
    public readonly snapPoints: T,
  ) {}

  public get host() {
    return $(this.selector);
  }

  public get header() {
    return this.host.shadow$('[part="header"]');
  }

  public get sheetSurface() {
    return this.host.shadow$('[part="sheet"]');
  }

  public async scrollByRelativeToHeight(fraction: number) {
    const clientHeight = (await this.host.getProperty(
      "clientHeight",
    )) as number;
    await this.host.scrollBy(clientHeight * fraction);
  }

  public async setScrollTopRelativeToHeight(fraction: number) {
    const clientHeight = (await this.host.getProperty(
      "clientHeight",
    )) as number;
    const targetScrollTop = clientHeight * fraction;

    await this.host.execute((el, scrollTop) => {
      el.scrollTop = scrollTop as number;
    }, targetScrollTop);
  }

  /** Waits for all snap points to become active after the initial snap animation. */
  public async waitForSnapPointsToActivate(): Promise<void> {
    await this.host.waitForAnimationsToFinish();
  }
}
