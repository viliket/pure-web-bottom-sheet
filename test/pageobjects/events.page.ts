import BottomSheetComponent from "./bottom-sheet.component";
import Page from "./page";

class EventsPage extends Page {
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

  open() {
    return super.open("events");
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
}

export default new EventsPage();
