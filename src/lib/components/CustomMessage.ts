import { WebComponentBase } from "../WebComponentBase";

export type MessageType = "info" | "danger" | "warning" | "success";

export class CustomMessage extends WebComponentBase {
  private container: HTMLDivElement | null = null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const template: HTMLTemplateElement = document.querySelector(
      "#custom-message"
    ) as HTMLTemplateElement;
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
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
