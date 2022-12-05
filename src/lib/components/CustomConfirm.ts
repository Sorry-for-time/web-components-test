import { WebComponentBase } from "../WebComponentBase.js";

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
  }

  .__container.hide {
    transition: all ease-out 200ms;
    opacity: 0;
    z-index: -1;
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
        hsla(180, 100%, 50%, 0.281),
        rgba(128, 0, 128, 0.233)
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

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = templateStr;

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
