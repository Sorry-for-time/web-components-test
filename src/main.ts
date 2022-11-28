import { CustomCard } from "./lib/CustomCard.js";
import { ContextMenu } from "./lib/ContextMenu.js";
import { useSwitchTheme } from "./dom-operation/switch-theme.js";

window.addEventListener("load", (): void => {
  useSwitchTheme();
  // 注册组件
  customElements.define("custom-card", CustomCard);
  customElements.define("context-menu", ContextMenu);
});
