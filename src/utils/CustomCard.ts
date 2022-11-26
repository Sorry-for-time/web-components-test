export class CustomCard extends HTMLElement {
  private fragment: DocumentFragment;
  private titleEl: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.fragment = (
      document.querySelector("#template") as HTMLTemplateElement
    ).content.cloneNode(true) as DocumentFragment;

    this.shadowRoot?.appendChild(this.fragment);
    this.titleEl = this.shadowRoot?.querySelector(".title")!;
  }

  /**
   * 在 webComponent 挂载到页面上时绑定组件内部的监听器
   */
  public connectedCallback(): void {
    this.titleEl &&
      this.titleEl.addEventListener("mousedown", this.mouseDownHandler);
    this.titleEl &&
      this.titleEl.addEventListener("mouseup", this.mouseUpHandler);
  }

  /**
   * 在 webComponent 实例从真实页面上卸载时解绑内部的监听器
   */
  public disconnectedCallback(): void {
    this.titleEl &&
      this.titleEl.removeEventListener("mousedown", this.mouseDownHandler);

    this.titleEl &&
      this.titleEl.removeEventListener("mouseup", this.mouseUpHandler);
  }

  /**
   * 鼠标主键按下操作
   * @param ev 鼠标主键按下事件
   */
  private mouseDownHandler = (ev: MouseEvent): void => {
    console.log(ev.clientX, ev.clientY);
    this.titleEl.addEventListener("mousemove", this.mouseMoveOperation);
  };

  /**
   * 鼠标主键抬起操作
   */
  private mouseUpHandler(): void {
    this.titleEl &&
      this.titleEl.removeEventListener("mousemove", this.mouseMoveOperation);
  }

  /**
   * 鼠标移动时的操作
   * @param ev 鼠标移动事件
   */
  private mouseMoveOperation = (ev: MouseEvent): void => {
    console.log(ev.clientX, ev.clientY);
  };
}
