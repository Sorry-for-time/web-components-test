import { formatLog } from "./utils/formatLog.js";

window.addEventListener("load", (): void => {
  if (document.body.classList.contains("hidden")) {
    document.body.classList.remove("hidden");
    formatLog();
  }
});
