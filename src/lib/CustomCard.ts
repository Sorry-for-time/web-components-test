/**
 * 鼠标相关回调事件类型定义
 */
type MOUSE_OPERATION = (ev: MouseEvent) => void;

/**
 * @description 自定义卡片组件
 * @export
 * @class CustomCard
 * @extends {HTMLElement}
 */
export class CustomCard extends HTMLElement {
  /* 组件上的真实 dom 结构引用记录 */
  private container: HTMLElement;
  private titleEl: HTMLElement;
  private textEditor: HTMLElement;

  /* 监听器函数引用记录 */
  private mouseUpHandlerRecord: MOUSE_OPERATION | null = null;

  /* 每个实例自身的唯一标识符 */
  private readonly _versionID: string = crypto.randomUUID().substring(0, 16);

  /* 组件创建所消耗的时间(微秒精度) */
  private _createCostTime: number = performance.now();

  private defaultPositionBucket: { left: string; top: string } = {
    left: "0px",
    top: "0px",
  };

  /* 用于记录挂载和卸载的数量, 方便进行 debug, 分析记录等 */
  public static debugBucket: {
    open: boolean /* 是否打开全局的 log 日志输出 */;
    counter: number /* 所有此类的实例挂载到页面上的数量 */;
  } = {
    open: false,
    counter: 0,
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      (
        document.querySelector("#template") as HTMLTemplateElement
      ).content.cloneNode(true)
    );

    this.titleEl = this.shadowRoot?.querySelector(".title")!;
    this.container = this.shadowRoot?.querySelector(".container")!;
    this.textEditor = this.shadowRoot?.querySelector(".content")!;

    /* 在节点加载成功后替换 slot 为文本节点 */
    const newTextNode: Text = document.createTextNode(
      this.lastChild?.textContent || ""
    );
    this.textEditor.replaceChild(
      newTextNode,
      this.textEditor.querySelector("slot")!
    );
    // 记录创建耗时
    this._createCostTime = performance.now() - this._createCostTime;
  }

  /**
   * 在 webComponent 挂载到页面上时绑定组件内部的监听器
   */
  connectedCallback(): void {
    this.container.style.left = this.defaultPositionBucket.left;
    this.container.style.top = this.defaultPositionBucket.top;
    this.container.style.setProperty("--weight", "3");
    this.container.style.zIndex = "var(--weight)";
    // 通知浏览器将快变化的属性
    this.container.style.willChange = "left, top, z-index";
    this.titleEl.addEventListener("mousedown", this.mouseDownHandler);
    this.textEditor.addEventListener("dblclick", this.textEditorInput);
    document.addEventListener("click", this.textEditorBlur);
    this.addEventListener("click", this.setCurrentPriorityDisplay);

    this._createCostTime = performance.now() - this._createCostTime;
    CustomCard.debugBucket.open &&
      console.log(
        `${this.versionId} connected, record: ${++CustomCard.debugBucket
          .counter}`
      );
  }

  /**
   * 在组件实例从真实页面上卸载时解绑内部的监听器
   */
  disconnectedCallback(): void {
    document.removeEventListener("mousedown", this.mouseDownHandler);

    this.mouseUpHandlerRecord &&
      document.removeEventListener("mouseup", this.mouseUpHandlerRecord);

    /* 移除文本编辑框的内容 */
    this.textEditor.removeEventListener("dblclick", this.textEditorInput);
    document.removeEventListener("click", this.textEditorBlur);
    this.removeEventListener("click", this.setCurrentPriorityDisplay);

    CustomCard.debugBucket.open &&
      console.log(
        `${this._versionID} disconnected, record ${CustomCard.debugBucket
          .counter--}`
      );
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

      this.container.style.left = `${applyLeft}px`;
      this.container.style.top = `${applyTop}px`;
    };

    document.addEventListener("mousemove", mouseMove);

    this.mouseUpHandlerRecord = (): void => {
      if (this.container.classList.contains("active")) {
        this.container.classList.remove("active");
      }
      document.removeEventListener("mousemove", mouseMove);
    };

    /* 添加监听器 */
    document.addEventListener("mouseup", this.mouseUpHandlerRecord);
  };

  private textEditorInput: MOUSE_OPERATION = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    this.textEditor.setAttribute("contenteditable", "true");
    this.textEditor.focus();
  };

  private textEditorBlur: MOUSE_OPERATION = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    // 判断目标决定是否移除光标
    if (
      (ev.target as CustomCard).shadowRoot?.querySelector(".content") !==
      this.textEditor
    ) {
      this.textEditor.blur();
      this.textEditor.removeAttribute("contenteditable");
    }
  };

  /**
   * @description 设置当前元素的显示的优先级为最高
   * @private
   * @type {MOUSE_OPERATION}
   * @memberof CustomCard
   */
  private setCurrentPriorityDisplay: MOUSE_OPERATION = (
    ev: MouseEvent
  ): void => {
    ev.preventDefault();
    ev.stopPropagation();
    {
      Array.from(this.parentElement!.children).forEach((el: Element): void => {
        (
          (el as CustomCard).shadowRoot?.lastElementChild as HTMLDivElement
        ).style.setProperty("--weight", "unset");
      });
      this.container.style.setProperty("--weight", "3");
    }
  };

  static get observedAttributes(): Array<string> {
    return ["left", "top"];
  }

  /**
   * 属性监听器(这个可选项只会在通过字面量在第一次渲染到页面上时产生效果)
   * @param name 属性名称
   * @param _oldValue 旧值
   * @param newValue 新值
   */
  attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string
  ): void {
    switch (name) {
      case "left":
        this.defaultPositionBucket.left = newValue;
        break;
      case "top":
        this.defaultPositionBucket.top = newValue;
        break;
      default:
        break;
    }
  }

  /**
   * @description 实例组件的唯一标识码
   * @readonly
   * @type {string}
   * @memberof CustomCard
   */
  public get versionId(): string {
    return this._versionID;
  }

  /**
   * @description 组件创建的时间
   * @readonly
   * @type {number}
   * @memberof CustomCard
   */
  public get createCostTime(): number {
    return this._createCostTime;
  }
}
