import { formatLog } from "./utils/formatLog.js";
import { CustomCard } from "./lib/CustomCard.js";
import { ContextMenu } from "./lib/ContextMenu.js";

import { switchTheme } from "./dom-operation/switch-theme.js";

window.addEventListener("load", (): void => {
  switchTheme();
  // 注册组件
  customElements.define("custom-card", CustomCard);
  customElements.define("context-menu", ContextMenu);

  if (document.body.classList.contains("hidden")) {
    document.body.classList.remove("hidden");
    formatLog();
    document.body.classList.add("dark-theme");
  }
});
