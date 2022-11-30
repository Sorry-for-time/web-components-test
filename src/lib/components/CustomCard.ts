import { WebComponentBase } from "../WebComponentBase";

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
export class CustomCard extends HTMLElement implements WebComponentBase {
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

  static get observedAttributes(): Array<string> {
    return ["left", "top"];
  }

  connectedCallback(): void {
    this.container.style.left = this.defaultPositionBucket.left;
    this.container.style.top = this.defaultPositionBucket.top;
    // 通知浏览器将快变化的属性
    this.container.style.willChange = "left, top";
    this.addEventListener("click", this.setCurrentPriorityDisplay);
    this.titleEl.addEventListener("mousedown", this.mouseDownHandler);
    this.textEditor.addEventListener("dblclick", this.textEditorInput);
    document.addEventListener("click", this.textEditorBlur);

    this._createCostTime = performance.now() - this._createCostTime;
    CustomCard.debugBucket.open &&
      console.log(
        `${this.versionId} connected, record: ${++CustomCard.debugBucket
          .counter}`
      );

    this.textEditor.addEventListener(
      "focusout",
      this.contentEditorChangeHandler
    );
  }

  disconnectedCallback(): void {
    document.removeEventListener("mousedown", this.mouseDownHandler);

    this.mouseUpHandlerRecord &&
      document.removeEventListener("mouseup", this.mouseUpHandlerRecord);

    /* 移除文本编辑框的内容 */
    this.textEditor.removeEventListener("dblclick", this.textEditorInput);
    document.removeEventListener("click", this.textEditorBlur);
    this.removeEventListener("click", this.setCurrentPriorityDisplay);
    this.textEditor.addEventListener(
      "focusout",
      this.contentEditorChangeHandler
    );

    CustomCard.debugBucket.open &&
      console.log(
        `${this._versionID} disconnected, record ${CustomCard.debugBucket
          .counter--}`
      );
  }

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
   * 鼠标主键按下操作
   * @param ev 鼠标主键按下事件
   */
  private mouseDownHandler: MOUSE_OPERATION = (ev: MouseEvent): void => {
    // 如果已经是优先级别最高的元素, 那么久不重新操作
    if (this.parentElement?.lastElementChild !== this) {
      this.parentElement?.appendChild(this);
    }

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
      this.setAttribute("left", `${applyLeft}px`);
      this.setAttribute("top", `${applyTop}px`);
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

  /**
   * 卡片文本框失去焦点
   * @param ev
   */
  private textEditorInput: MOUSE_OPERATION = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    this.textEditor.setAttribute("contenteditable", "true");
    this.textEditor.focus();
  };

  /**
   * 卡片文本框聚焦功能实现
   * @param ev
   */
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
    /* 将点击选中的元素移动到父容器的末尾, 实现显示层级上的的优先显示 */
    if (this.parentElement?.lastElementChild !== this) {
      this.parentElement?.appendChild(this);
    }
  };

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

  /**
   * 在文本编辑框失去焦点时同步修改元素自身的 innerText
   */
  private contentEditorChangeHandler: () => void = (): void => {
    this.innerText = this.textEditor.innerText;
  };
}
