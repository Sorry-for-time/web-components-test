import { WebComponentBuiltInHooksDefine } from "@/lib/interface/WebComponentBuiltInHooksDefine";

const template: string = import.meta.glob("/src/templates/CustomCard.html", {
  eager: true,
  as: "raw",
  import: "default"
})["/src/templates/CustomCard.html"];

/**
 * 鼠标相关回调事件类型定义
 */
type MouseOperationType = (ev: MouseEvent) => unknown;

/**
 * 自定义卡片组件
 */
export class CustomCard extends HTMLElement implements WebComponentBuiltInHooksDefine {
  /**
   * 自定义组件模板字符串
   */
  private static componentStr: string = template;

  /**
   * 自定义 web 组件容器
   */
  private container: HTMLElement;

  /**
   * 允许进行拖拽的区域(窗口标题区域)
   */
  private titleEl: HTMLElement;

  /**
   * 文本编辑区域
   */
  private textEditor: HTMLElement;

  /**
   * 鼠标抬起监听函数引用
   */
  private mouseUpHandlerLink: MouseOperationType | null = null;

  /**
   * 每个实例自身的唯一标识符
   */
  private readonly _instanceId: string = crypto.randomUUID().substring(0, 16);

  /**
   * 组件创建所消耗的时间
   */
  private _createCostTime: number = performance.now();

  /**
   * 记录自定义卡片的所在位置(用于重渲染时恢复位置)
   */
  private positionBucket: { left: number; top: number } = {
    left: 0,
    top: 0
  };

  /**
   * 记录组件的基本创建耗时
   */
  public static logRecord: {
    open: boolean /* 是否打开全局的 log 日志输出 */;
    counter: number /* 所有此类的实例挂载到页面上的数量 */;
  } = {
    open: false,
    counter: 0
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = CustomCard.componentStr;
    this.titleEl = this.shadowRoot?.querySelector(".title")!;
    this.container = this.shadowRoot?.querySelector(".container")!;
    this.textEditor = this.shadowRoot?.querySelector(".content")!;
    // 创建内部标签, 元素为自定义卡片内的内容
    this.textEditor.innerHTML = this.innerHTML.toString();
    // 记录创建耗时
    this._createCostTime = performance.now() - this._createCostTime;
  }

  static get observedAttributes(): Array<string> {
    return ["left", "top"];
  }

  connectedCallback(): void {
    this.container.style.left = this.positionBucket.left + "px";
    this.container.style.top = this.positionBucket.top + "px";
    // 通知浏览器将快变化的属性
    this.addEventListener("click", this.setCurrentPriorityDisplay);
    this.titleEl.addEventListener("mousedown", this.mouseDownHandler);
    this.textEditor.addEventListener("dblclick", this.textEditorInput);
    this._createCostTime = performance.now() - this._createCostTime;
    CustomCard.logRecord.open && console.log(`${this.instanceId} connected, record: ${++CustomCard.logRecord.counter}`);
    this.textEditor.addEventListener("focusout", this.contentEditorChangeHandler);
    this.textEditor.addEventListener("blur", this.textEditorBlurAction);
  }

  disconnectedCallback(): void {
    document.removeEventListener("mousedown", this.mouseDownHandler);
    this.mouseUpHandlerLink && document.removeEventListener("mouseup", this.mouseUpHandlerLink);
    this.textEditor.removeEventListener("dblclick", this.textEditorInput);
    this.textEditor.removeEventListener("blur", this.textEditorBlurAction);
    this.removeEventListener("click", this.setCurrentPriorityDisplay);
    this.textEditor.removeEventListener("focusout", this.contentEditorChangeHandler);

    CustomCard.logRecord.open &&
      console.log(`${this._instanceId} disconnected, record ${CustomCard.logRecord.counter--}`);
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
    switch (name) {
      case "left":
        this.positionBucket.left = Number.parseInt(newValue);
        break;
      case "top":
        this.positionBucket.top = Number.parseInt(newValue);
        break;
      default:
        break;
    }
  }

  /**
   * 鼠标主键按下操作
   * @param ev 鼠标主键按下事件
   */
  private mouseDownHandler: MouseOperationType = (ev: MouseEvent): void => {
    // 设置卡片选中置顶显示
    if (this.parentElement?.lastElementChild !== this) {
      this.parentElement?.appendChild(this);
    }
    ev.preventDefault();
    ev.stopPropagation();
    this.container.classList.add("active");

    const substrateX: number = ev.clientX - this.container.offsetLeft;
    const substrateY: number = ev.clientY - this.container.offsetTop;

    const mouseMoveAction: MouseOperationType = (mv: MouseEvent): void => {
      ev.preventDefault();
      ev.stopPropagation();

      let willApplyLeft: number = mv.clientX - substrateX;
      let willApplyTop: number = mv.clientY - substrateY;

      /* 边界值处理 */
      if (willApplyLeft <= 0) {
        willApplyLeft = 0;
      }
      if (willApplyTop <= 0) {
        willApplyTop = 0;
      }
      if (willApplyLeft >= this.parentElement!.clientWidth - this.container.clientWidth) {
        willApplyLeft = this.parentElement!.clientWidth - this.container.clientWidth;
      }
      if (willApplyTop >= this.parentElement!.clientHeight - this.container.clientHeight) {
        willApplyTop = this.parentElement!.clientHeight - this.container.clientHeight;
      }
      this.container.style.cssText = `left:unset;top:unset;transform:translate3d(${willApplyLeft}px,${willApplyTop}px,1px)`;
      this.positionBucket.left = willApplyLeft;
      this.positionBucket.top = willApplyTop;
    };

    document.addEventListener("mousemove", mouseMoveAction);

    this.mouseUpHandlerLink = (): void => {
      this.container.classList.remove("active");
      this.container.style.cssText = `left:${this.positionBucket.left}px;top:${this.positionBucket.top}px;transform:translate3d(0, 0, 1px)`;
      // 更新自定义标签属性, 使之被 MutationObserver 捕获到状态变更
      this.setAttribute("left", `${this.positionBucket.left}`);
      this.setAttribute("top", `${this.positionBucket.top}`);
      // 在抬起鼠标后清除监听器(收尾)
      document.removeEventListener("mousemove", mouseMoveAction);
    };
    // 添加监听器
    document.addEventListener("mouseup", this.mouseUpHandlerLink);
  };

  /**
   * 卡片编辑区域双击时设置可编辑状态
   */
  private textEditorInput: MouseOperationType = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    this.textEditor.setAttribute("contenteditable", "true");
    this.textEditor.focus();
  };

  /**
   * 设置当前元素的显示的优先级为最高
   */
  private setCurrentPriorityDisplay: MouseOperationType = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    // 将点击选中的元素移动到父容器的末尾, 实现显示层级上的的优先显示
    if (this.parentElement?.lastElementChild !== this) {
      this.parentElement?.appendChild(this);
    }
  };

  /**
   * 卡片内部编辑失去焦点的时候移除 contenteditable 属性
   */
  private textEditorBlurAction: () => void = (): void => {
    this.textEditor.removeAttribute("contenteditable");
  };

  /**
   * 实例组件的唯一标识码
   */
  public get instanceId(): string {
    return this._instanceId;
  }

  /**
   * 组件创建的时间
   */
  public get createCostTime(): number {
    return this._createCostTime;
  }

  /**
   * 在文本编辑框失去焦点时同步修改元素自身的 innerHTML
   */
  private contentEditorChangeHandler: (ev: Event) => void = (ev: Event): void => {
    ev.preventDefault();
    ev.stopPropagation();
    this.innerHTML = this.textEditor.innerHTML || "";
  };
}
