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

  public get headerContainer() {
    return this.host.shadow$(".sheet-header");
  }

  public get headerSlot() {
    return $(`${this.selector} [slot="header"]`);
  }

  public get footerSlot() {
    return $(`${this.selector} [slot="footer"]`);
  }

  public get snapPointsSlot() {
    return $$(`${this.selector} [slot="snap"]`);
  }

  public get sheetSurfaceContainer() {
    return this.host.shadow$(".sheet");
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
