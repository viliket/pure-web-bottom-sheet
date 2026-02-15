import BottomSheetComponent from "./bottom-sheet.component";
import Page from "./page";

class NonDismissiblePage extends Page {
  public bottomSheet = new BottomSheetComponent("bottom-sheet.example", {
    P25: 0.25,
    P50: 0.5,
    P75: 0.75,
    P100: 1,
  });

  public open() {
    return super.open("non-dismissible");
  }
}

export default new NonDismissiblePage();
