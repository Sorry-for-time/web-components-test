const template: string = import.meta.glob("/src/templates/CustomConfirm.html", {
  eager: true,
  as: "raw",
  import: "default"
})["/src/templates/CustomConfirm.html"];

export class CustomConfirm extends HTMLElement {
  private static componentStr: string = template;

  private container: HTMLDivElement | null = null;

  private confirmButton: HTMLButtonElement | null;

  private cancelButton: HTMLButtonElement | null;

  private titleEl: HTMLParagraphElement | null = null;

  static {
    // 设置自动注册
    customElements.define("custom-confirm", CustomConfirm);
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = CustomConfirm.componentStr;
    this.container = this.shadowRoot?.querySelector(".__container")!;
    this.titleEl = this.shadowRoot?.querySelector("h1")!;
    this.confirmButton = this.shadowRoot?.querySelector("#confirm")!;
    this.cancelButton = this.shadowRoot?.querySelector("#cancel")!;
  }

  /**
   * 自定义弹窗确认框
   */
  public async confirm(title: string = "您确定关闭吗?"): Promise<boolean> {
    this.titleEl && (this.titleEl.textContent = title); /* 设置标题 */
    this.container?.classList.remove("hide"); /* 移除隐藏样式 */
    const _that: this = this;

    return new Promise((resolve, reject): void => {
      _that.container?.addEventListener("click", function clickHandler(ev: MouseEvent): void {
        // 移除监听器
        _that.container?.removeEventListener("click", clickHandler);

        let value: boolean = false;
        switch (ev.target) {
          case _that.confirmButton:
            value = true;
            break;
          case _that.cancelButton:
          default:
            value = false;
            break;
        }

        _that.container?.classList.add("hide"); // 恢复隐藏样式
        // 处理值
        if (value) {
          resolve(value);
        } else {
          reject(value);
        }
      });
    });
  }
}

/**
 * 默认导出实例
 */
export const customConfirm: CustomConfirm = new CustomConfirm();
