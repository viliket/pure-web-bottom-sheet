import BottomSheetComponent from "./bottom-sheet.component";
import Page from "./page";

class DynamicHeightPage extends Page {
  bottomSheet = new BottomSheetComponent("bottom-sheet.example", {
    P0: 0,
    P25: 0.25,
    P50: 0.5,
    P75: 0.75,
    P100: 1,
  });

  get dialog() {
    return $("#bottom-sheet-dialog");
  }

  get openButton() {
    return $("#open-modal");
  }

  get addBlockButton() {
    return $("#add-block");
  }

  get removeBlockButton() {
    return $("#remove-block");
  }

  open() {
    return super.open("dynamic-height");
  }

  async openDialog() {
    await this.openButton.waitForClickable();
    await this.openButton.click();
    // Wait for the initial-snap animation on the bottom sheet to finish so all
    // snap points are active
    await this.bottomSheet.waitForSnapPointsToActivate();
    // Wait for the dialog open transition to complete to ensure the sheet is fully
    // open before interacting with it
    await this.dialog.waitForAnimationsToFinish();
  }

  async addBlocks(count: number) {
    for (let i = 0; i < count; i++) {
      await this.addBlockButton.click();
    }
  }

  async removeBlocks(count: number) {
    for (let i = 0; i < count; i++) {
      await this.removeBlockButton.click();
    }
  }
}

export default new DynamicHeightPage();
