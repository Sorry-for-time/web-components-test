import { WebComponentBase } from "../WebComponentBase";
export type MessageType = "info" | "danger" | "warning" | "success";

const templateStr = `
<style>
  .__wrapper {
    --info: hsl(220, 4%, 58%);
    --success: hsl(100, 54%, 49%);
    --waning: hsl(36, 77%, 57%);
    --danger: hsl(0, 87%, 69%);

    --info-bgc: hsla(180, 3%, 13%, 0.808);
    --success-bgc: hsla(102, 21%, 12%, 0.808);
    --waning-bgc: hsla(35, 25%, 13%, 0.808);
    --danger-bgc: hsla(0, 18%, 14%, 0.808);

    position: absolute;
    width: 400px;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    user-select: none;
  }

  .message {
    margin-top: 10px;
    width: 100%;
    height: 45px;
    border-radius: 8px;
    box-shadow: 0 0 3px hsla(0, 0%, 0%, 0.233);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade-in 300ms ease-out forwards;
    transform-origin: top center;
    backdrop-filter: blur(12px);
  }

  @keyframes fade-in {
    0% {
      transform: scaleY(0);
      opacity: 0.6;
    }
    40% {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  .message.info {
    color: var(--info);
    border: 1px solid var(--info);
    background: var(--info-bgc);
  }
  .message.success {
    color: var(--success);
    border: 1px solid var(--success);
    background: var(--success-bgc);
  }
  .message.warning {
    color: var(--waning);
    border: 1px solid var(--waning);
    background: var(--waning-bgc);
  }
  .message.danger {
    color: var(--danger);
    border: 1px solid var(--danger);
    background: var(--danger-bgc);
  }
  .message .title {
    color: hsl(0, 0%, 23%);
    font-size: 18px;
  }
  .message.hide {
    transform-origin: top center;
    animation: fade-leave 580ms ease-in forwards 1200ms;
  }

  @keyframes fade-leave {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0.2;
      transform: scale(0.3);
    }
  }
</style>
<div class="__wrapper"></div>
`;
export class CustomMessage extends WebComponentBase {
  private container: HTMLDivElement | null = null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.innerHTML = templateStr;
    this.container = this.shadowRoot?.querySelector(".__wrapper")!;
  }

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
