/**
 * @description 自定义菜单
 * @author Shalling <3330689546@qq.com>
 * @date 2022-11-27 21:11:23
 * @export
 * @class ContextMenu
 * @extends {HTMLElement}
 */
export class ContextMenu extends HTMLElement {
  private container: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      (
        document.querySelector("#context-menu") as HTMLTemplateElement
      ).content.cloneNode(true)
    );

    this.container = this.shadowRoot?.querySelector(".wrapper")!;
    console.log(this.container);
  }

  public connectedCallback(): void {
    this.container.style.setProperty("--x", "0px");
    this.container.style.setProperty("--y", "0px");
    this.container.style.willChange = "transform";
    this.container.style.transform = "translate(var(--x), var(--y))";

    document.addEventListener("contextmenu", (ev): void => {
      ev.preventDefault();
      ev.stopPropagation();
      this.container.style.setProperty("--x", `${ev.clientX}px`);
      this.container.style.setProperty("--y", `${ev.clientY}px`);
      if (this.container.classList.contains("hide")) {
        this.container.classList.remove("hide");
      }
    });

    document.addEventListener("click", (ev: MouseEvent): void => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!this.container.classList.contains("hide")) {
        this.container.classList.add("hide");
      }
    });
  }
}
