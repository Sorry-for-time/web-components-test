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
  private fragment: DocumentFragment;
  private titleEl: HTMLElement;
  private container: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // 初始化操作
    this.fragment = (
      document.querySelector("#template") as HTMLTemplateElement
    ).content.cloneNode(true) as DocumentFragment;

    this.shadowRoot?.appendChild(this.fragment);
    this.titleEl = this.shadowRoot?.querySelector(".title")!;
    this.container = this.shadowRoot?.querySelector(".container")!;
  }

  /**
   * 在 webComponent 挂载到页面上时绑定组件内部的监听器
   */
  public connectedCallback(): void {
    this.container.style.setProperty("--x", "0px");
    this.container.style.setProperty("--y", "0px");
    this.container.style.transform = "translate(var(--x), var(--y))";
    this.titleEl.addEventListener("mousedown", this.mouseDownHandler);
  }

  /**
   * 在 webComponent 实例从真实页面上卸载时解绑内部的监听器
   */
  public disconnectedCallback(): void {}

  /**
   * 鼠标主键按下操作
   * @param ev 鼠标主键按下事件
   */
  private mouseDownHandler: MOUSE_OPERATION = (ev: MouseEvent): void => {
    let substrateX: number = ev.clientX - this.titleEl.offsetLeft;
    let substrateY: number = ev.clientY - this.titleEl.offsetTop;

    const mouseMove: MOUSE_OPERATION = (mv: MouseEvent): void => {
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
        applyLeft >
        this.parentElement!.clientWidth - this.container.clientWidth
      ) {
        applyLeft =
          this.parentElement!.clientWidth - this.container.clientWidth;
      }

      if (
        applyTop >
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
      document.removeEventListener("mousemove", mouseMove);
    });

    this.titleEl.addEventListener("mouseup", (): void => {
      window.removeEventListener("mousemove", mouseMove);
    });
  };
}
