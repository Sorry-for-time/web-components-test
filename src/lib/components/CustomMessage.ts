const template: string = import.meta.glob("/src/templates/CustomMessage.html", {
  eager: true,
  as: "raw",
  import: "default"
})["/src/templates/CustomMessage.html"];

/**
 * 弹窗消息类型
 */
export type MessageType = "info" | "danger" | "warning" | "success";

export class CustomMessage extends HTMLElement {
  private static readonly componentStr: string = template;

  static {
    customElements.define("custom-message", CustomMessage);
  }

  private container: HTMLDivElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.innerHTML = CustomMessage.componentStr;
    this.container = this.shadowRoot!.querySelector(".__wrapper")!;
  }

  /**
   * 自定义消息提示
   * @param title 标题
   * @param type 提示类型
   */
  public message(title: string = "", type: MessageType = "info"): void {
    const elMessage: HTMLDivElement = document.createElement("div");
    elMessage.setAttribute("class", "message");
    const titleEl: HTMLDivElement = document.createElement("div");
    titleEl.textContent = title;
    elMessage.appendChild(titleEl);
    elMessage.classList.add(type);

    new Promise((resolve): void => {
      this.container?.appendChild(elMessage);
      elMessage.onanimationend = (): void => {
        elMessage.classList.add("hide");
        resolve(null);
      };
    }).then((): void => {
      elMessage.onanimationend = (): void => {
        this.container?.removeChild(elMessage);
        elMessage.onanimationend = null;
      };
    });
  }
}

/**
 * 默认导出实例
 */
export const customMessage: CustomMessage = new CustomMessage();
