import { formatLog } from "./utils/formatLog.js";
import { CustomCard } from "./utils/CustomCard.js";
customElements.define("custom-card", CustomCard);

window.addEventListener("load", (): void => {
  if (document.body.classList.contains("hidden")) {
    document.body.classList.remove("hidden");
    formatLog();
    document.body.classList.add("dark-theme");
    const themeButtons: NodeListOf<HTMLSpanElement> =
      document.querySelectorAll("#app span");

    const main: HTMLElement = document.querySelector("#app main")!;

    const customTag = new CustomCard();
    customTag.textContent = "somethings you know";
    main.appendChild(customTag);

    themeButtons.forEach((span: HTMLSpanElement): void => {
      span.addEventListener("click", (): void => {
        if (span.id === "normal") {
          document.body.classList.remove("dark-theme");
          if (!document.body.classList.contains("normal-theme")) {
            document.body.classList.add("normal-theme");
          }
        } else {
          document.body.classList.remove("normal-theme");
          if (!document.body.classList.contains("dark-theme"))
            document.body.classList.add("dark-theme");
        }
      });
    });
  }
});
