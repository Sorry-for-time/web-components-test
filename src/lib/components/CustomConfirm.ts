import { WebComponentBase } from "../WebComponentBase.js";

export class CustomConfirm extends WebComponentBase {
  private container: HTMLDivElement | null = null;
  private confirmButton: HTMLButtonElement | null;
  private cancelButton: HTMLButtonElement | null;
  private titleEl: HTMLParagraphElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      (
        document.querySelector("#dialog") as HTMLTemplateElement
      ).content.cloneNode(true)
    );

    this.container = this.shadowRoot?.querySelector(".__container")!;
    this.titleEl = this.shadowRoot?.querySelector("h1")!;
    this.confirmButton = this.shadowRoot?.querySelector("#confirm")!;
    this.cancelButton = this.shadowRoot?.querySelector("#cancel")!;
  }

  disconnectedCallback(): void {
    this.container!.onclick = null;
  }

  /**
   * 弹窗处处理函数
   * @param ev 鼠标点击事件
   * @param handler
   * @returns
   */
  private handler = async (
    ev: MouseEvent,
    handler: (value: boolean) => void
  ) => {
    return new Promise((resolve, reject) => {
      let value: boolean = false;
      switch (ev.target) {
        case this.confirmButton:
          value = true;
          break;
        case this.cancelButton:
          value = false;
          break;
        default:
          break;
      }
      this.container?.classList.add("hide");
      if (value) {
        resolve(true);
        this.container!.onclick = null;
      } else {
        reject(false);
      }
    })
      .then(async (success) => {
        if (typeof handler === "function") {
          handler(success as boolean);
        }
      })
      .catch((reason) => {
        if (typeof handler === "function") {
          handler(reason);
        }
      });
  };

  /**
   * 调用弹窗函
   * @param title 对话框标题
   * @param handler  处理函数
   */
  public alert(title: string = "", handler: (value: boolean) => void): void {
    this.titleEl!.innerText = title;
    this.container?.classList.remove("hide");
    this.container!.onclick = (ev: MouseEvent): void => {
      this.handler(ev, handler);
    };
  }
}
