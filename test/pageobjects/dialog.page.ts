import BottomSheetComponent from "./bottom-sheet.component";
import Page from "./page";

class DialogPage extends Page {
  public bottomSheet = new BottomSheetComponent("bottom-sheet.example", {
    P0: 0,
    P50: 0.5,
    P100: 1,
  });

  public get dialog() {
    return $("#bottom-sheet-dialog");
  }

  public get openButton() {
    return $("#open-modal");
  }

  public open() {
    return super.open("dialog");
  }

  public async openDialog() {
    await this.openButton.waitForClickable();
    await this.openButton.click();
    // Wait for the initial-snap animation on the bottom sheet to finish so all
    // snap points are active
    await this.bottomSheet.waitForSnapPointsToActivate();
    // Wait for the dialog open transition to complete to ensure the sheet is fully
    // open before interacting with it
    await this.dialog.waitForAnimationsToFinish();
  }
}

export default new DialogPage();
