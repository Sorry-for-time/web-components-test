import { WebComponentBase } from "@/lib/WebComponentBase";
const templateStr: string = `
<style>
  .__container {
    z-index: 333;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: hsla(0, 0%, 0%, 0.726);
    transition: all ease-out 200ms;
  }

  .__container.hide {
    opacity: 0;
    z-index: -23;
    visibility: none;
  }

  .confirm {
    user-select: none;
    min-width: 300px;
    min-height: 200px;
    max-width: 500px;
    max-height: 300px;

    margin: 160px auto auto auto;
    width: 40%;
    height: 30%;
    background: scroll center no-repeat
      linear-gradient(
        23deg,
        hsla(210, 100%, 60%, 0.181),
        rgba(128, 0, 128, 0.133)
      );
    backdrop-filter: blur(12px) brightness(1.2);
    border-radius: 10px;
    box-shadow: 0 6px 10px hsla(0, 0%, 0%, 0.473);
    color: white;
    text-shadow: 0 0 2px hsla(0, 0%, 0%, 0.623);

    display: grid;
    grid-template-rows: 140px calc(100% - 140px);
    justify-content: center;
    align-items: center;
  }

  .confirm h1 {
    font-size: 20px;
    text-align: center;
  }

  .confirm div {
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 20px;
  }

  .confirm div button {
    outline: none;
    border: none;
    width: 80px;
    height: 40px;
    border-radius: 8px;
    box-shadow: 0 0 3px black;
    cursor: pointer;
    transition: all 100ms ease-out;
  }

  .confirm div button:active {
    box-shadow: 0 0 10px white;
    outline: 1px solid wheat;
  }
  </style>

  <div class="__container hide">
  <div class="confirm">
    <h1>您确定关闭?</h1>
    <div>
      <button id="confirm">确认</button>
      <button id="cancel">取消</button>
    </div>
  </div>
  </div>
`;

export class CustomConfirm extends WebComponentBase {
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
    this.attachShadow({ mode: "open" }).innerHTML = templateStr;
    this.container = this.shadowRoot?.querySelector(".__container")!;
    this.titleEl = this.shadowRoot?.querySelector("h1")!;
    this.confirmButton = this.shadowRoot?.querySelector("#confirm")!;
    this.cancelButton = this.shadowRoot?.querySelector("#cancel")!;
  }

  /**
   * @description 确认框
   * @author Shalling <3330689546@qq.com>
   * @date 2022-12-05 23:12:57
   * @param {string} [title="您确定关闭吗?"] 弹窗标题
   * @returns {*}  {Promise<boolean>}
   * @memberof CustomConfirm
   */
  public async confirm(title: string = "您确定关闭吗?"): Promise<boolean> {
    this.titleEl && (this.titleEl.textContent = title); /* 设置标题 */
    this.container?.classList.remove("hide"); /* 移除隐藏样式 */
    const _that: this = this;

    return new Promise((resolve, reject): void => {
      _that.container?.addEventListener(
        "click",
        function clickHandler(ev: MouseEvent): void {
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
        }
      );
    });
  }
}

/**
 * 默认导出实例
 */
export const customConfirm: CustomConfirm = new CustomConfirm();
