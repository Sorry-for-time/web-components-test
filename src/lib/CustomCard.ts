/**
 * 鼠标相关回调事件类型定义
 */
type MOUSE_OPERATION = (ev: MouseEvent) => void;

/**
 * @description 自定义卡片组件
 * @author Shalling <3330689546@qq.com>
 * @date 2022-11-27 00:11:08
 * @export
 * @class CustomCard
 * @extends {HTMLElement}
 */
export class CustomCard extends HTMLElement {
  private titleEl: HTMLElement;
  private container: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      (
        document.querySelector("#template") as HTMLTemplateElement
      ).content.cloneNode(true)
    );

    this.titleEl = this.shadowRoot?.querySelector(".title")!;
    this.container = this.shadowRoot?.querySelector(".container")!;
  }

  /**
   * 在 webComponent 挂载到页面上时绑定组件内部的监听器
   */
  public connectedCallback(): void {
    this.container.style.setProperty("--x", "0px");
    this.container.style.setProperty("--y", "0px");
    // this.container.style.transform = "translate(var(--x), var(--y))";
    // this.container.style.willChange = "transform";
    this.container.style.left = "var(--x)";
    this.container.style.top = "var(--y)";
    this.titleEl.addEventListener("mousedown", this.mouseDownHandler);
  }

  /**
   * 在 webComponent 实例从真实页面上卸载时解绑内部的监听器
   */
  public disconnectedCallback(): void {
    document.removeEventListener("mousedown", this.mouseDownHandler);
    document.removeEventListener("mouseup", () => {});
  }

  /**
   * 鼠标主键按下操作
   * @param ev 鼠标主键按下事件
   */
  private mouseDownHandler: MOUSE_OPERATION = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();

    if (!this.container.classList.contains("active")) {
      this.container.classList.add("active");
    }

    Array.from(this.parentElement!.children).forEach((el: Element): void => {
      (
        (el as CustomCard).shadowRoot?.lastElementChild as HTMLDivElement
      ).style.removeProperty("z-index");
    });

    this.container.style.setProperty("z-index", "333");

    const substrateX: number = ev.clientX - this.container.offsetLeft;
    const substrateY: number = ev.clientY - this.container.offsetTop;

    const mouseMove: MOUSE_OPERATION = (mv: MouseEvent): void => {
      ev.preventDefault();
      ev.stopPropagation();
      let applyLeft: number = mv.clientX - substrateX;
      let applyTop: number = mv.clientY - substrateY;

      /* 简单的边界限制处理 */
      if (applyLeft <= 0) {
        applyLeft = 0;
      }
      if (applyTop <= 0) {
        applyTop = 0;
      }
      if (
        applyLeft >=
        this.parentElement!.clientWidth - this.container.clientWidth
      ) {
        applyLeft =
          this.parentElement!.clientWidth - this.container.clientWidth;
      }
      if (
        applyTop >=
        this.parentElement!.clientHeight - this.container.clientHeight
      ) {
        applyTop =
          this.parentElement!.clientHeight - this.container.clientHeight;
      }

      this.container.style.setProperty("--x", `${applyLeft}px`);
      this.container.style.setProperty("--y", `${applyTop}px`);
    };

    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", (): void => {
      if (this.container.classList.contains("active")) {
        this.container.classList.remove("active");
      }
      document.removeEventListener("mousemove", mouseMove);
    });
  };
}
