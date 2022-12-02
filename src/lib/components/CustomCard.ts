import { WebComponentBase } from "../WebComponentBase";
const templateStr: string = `
<style>
  .active {
    cursor: move;
  }

  .container {
    --title-height: 26px;
    position: absolute;

    display: block;
    width: 260px;
    max-height: 500px;
    overflow: auto;
    height: auto;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.418);
    background: scroll no-repeat center
      linear-gradient(rgba(0, 255, 255, 0.205), rgba(128, 0, 128, 0.247));
    backdrop-filter: blur(12px);
  }

  .container .card {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: var(--title-height) calc(
        100% - var(--title-height)
      );
  }

  .title {
    background: scroll no-repeat center
      linear-gradient(
        23deg,
        rgba(194, 115, 197, 0.589),
        rgba(68, 96, 223, 0.582)
      );
    backdrop-filter: blur(12px);
    cursor: move;
  }

  .content {
    min-height: 24px;
    font-size: 18px;
    padding: 10px;
    user-select: none;
    color: transparent;
    background: scroll no-repeat center
      linear-gradient(
        109deg,
        rgba(61, 245, 167, 1) 11.2%,
        rgba(9, 111, 224, 1) 91.1%
      );
    font-weight: 600;
    background-clip: text;
    -webkit-background-clip: text;
    animation: scroll-color 5s linear infinite;
  }

  .content:focus-within {
    caret-color: white;
    outline: none;
    background: rgba(39, 39, 39, 0.616);
    color: rgb(230, 230, 230);
    animation: none;
    background-clip: none;
    -webkit-background-clip: none;
  }

  @keyframes scroll-color {
    from {
      filter: hue-rotate(0deg);
    }
    to {
      filter: hue-rotate(360deg);
    }
  }
</style>

<div class="container">
  <div class="card">
    <div class="title"></div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</div>
`;

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
    this.attachShadow({ mode: "open" }).innerHTML = templateStr;

    this.titleEl = this.shadowRoot?.querySelector(".title")!;
    this.container = this.shadowRoot?.querySelector(".container")!;
    this.textEditor = this.shadowRoot?.querySelector(".content")!;

    /* 在节点加载成功后移除 slot 节点 */
    this.textEditor.removeChild(this.textEditor.querySelector("slot")!);
    this.textEditor.innerHTML = this.innerHTML.toString();
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
          .counter}`,
      );

    this.textEditor.addEventListener(
      "focusout",
      this.contentEditorChangeHandler,
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
    this.textEditor.removeEventListener(
      "focusout",
      this.contentEditorChangeHandler,
    );

    CustomCard.debugBucket.open &&
      console.log(
        `${this._versionID} disconnected, record ${CustomCard.debugBucket
          .counter--}`,
      );
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string,
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
    ev: MouseEvent,
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
   * 在文本编辑框失去焦点时同步修改元素自身的 innerHTML
   */
  private contentEditorChangeHandler: (ev: Event) => void = (
    ev: Event,
  ): void => {
    ev.preventDefault();
    ev.stopPropagation();
    this.innerHTML = this.textEditor.innerHTML!;
  };
}
