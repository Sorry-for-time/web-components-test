import { ContextMenu } from "../lib/components/ContextMenu";
import { CustomCard } from "../lib/components/CustomCard";
import { CustomConfirm } from "../lib/components/CustomConfirm";

// CustomCard.debugBucket.open = true; /* 打开自定义组件的日志记录输出 */
// 注册自定义组件
customElements.define("custom-card", CustomCard);
customElements.define("context-menu", ContextMenu);
customElements.define("custom-dialog", CustomConfirm);
