import { CustomCard } from "./CustomCard.js";
import { WebComponentDefine } from "./WebComponentDefine.js";

/**
 * 定义菜单选项里的选项名称
 */
const enum CONTEXT_MENU_ITEM {
  /**
   * 添加一个新的卡片实例
   */
  ADD = "add",

  /**
   * 删除当前卡片实例
   */
  DELETE = "delete",

  /**
   * 编辑当前卡片实例
   */
  EDITOR = "editor",

  /**
   * 导出当前卡片实例的文本内容
   */
  EXPORT = "export",

  /**
   * 打印页面
   */
  PRINT = "print",
}

/**
 * @description 自定义菜单
 * @export
 * @class ContextMenu
 * @extends {HTMLElement}
 */
export class ContextMenu extends HTMLElement implements WebComponentDefine {
  private container: HTMLElement;
  private allItems: NodeListOf<HTMLParagraphElement>;
  private dragView: HTMLDivElement;
  private cardTarget: CustomCard | null = null;

  /* 记录点击后经过边界处理的光位置 */
  private clickPosition: {
    left: number;
    top: number;
  } = {
    left: 0,
    top: 0,
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(
      (
        document.querySelector("#context-menu") as HTMLTemplateElement
      ).content.cloneNode(true)
    );

    this.container = this.shadowRoot?.querySelector(".wrapper")!;
    this.allItems = this.shadowRoot?.querySelectorAll("p")!;
    this.dragView = document.body.querySelector(".drag-view")!;
  }

  connectedCallback(): void {
    this.container.style.setProperty("--x", "0px");
    this.container.style.setProperty("--y", "0px");
    this.container.style.willChange = "transform";
    this.container.style.transform = "translate(var(--x), var(--y))";

    this.container.addEventListener("click", this.clickMenuItemHandler);
    this.dragView.addEventListener("contextmenu", this.contextMenuHandler);

    document.addEventListener("click", this.removeHideClass);
  }

  disconnectedCallback(): void {
    this.container.removeEventListener("click", this.clickMenuItemHandler);
    this.dragView.removeEventListener("contextmenu", this.contextMenuHandler);

    document.removeEventListener("click", this.removeHideClass);
  }

  /**
   * 添加隐藏自定义菜单的样式
   * @param ev 鼠标单击产生的事件
   */
  private removeHideClass: (ev: MouseEvent) => void = (
    ev: MouseEvent
  ): void => {
    ev.preventDefault();
    ev.stopPropagation();
    if (!this.container.classList.contains("hide")) {
      this.container.classList.add("hide");
    }
  };

  /**
   * 鼠标单击菜单选项的对应操作
   * @param ev 鼠标单击菜单选项按钮事件
   */
  private clickMenuItemHandler: (ev: MouseEvent) => void = (
    ev: MouseEvent
  ): void => {
    ev.preventDefault();
    ev.stopPropagation();
    /* 取得点击的目标元素 */
    const target: HTMLParagraphElement = ev.target as HTMLParagraphElement;
    switch (target.id) {
      // 添加新的卡片
      case CONTEXT_MENU_ITEM.ADD:
        const newCard: CustomCard = new CustomCard();
        let cardWidth: number = 260,
          cardHeight: number = 70;
        let realLeft: number = this.clickPosition.left,
          realTop: number = this.clickPosition.top;
        // 边界判断
        if (realLeft + cardWidth >= this.dragView.clientWidth) {
          realLeft = this.dragView.offsetWidth - cardWidth - 4;
        }
        if (realTop + cardHeight >= this.dragView.clientHeight) {
          realTop = this.dragView.offsetHeight - cardHeight - 4;
        }
        // 设置新添加卡片的位置
        newCard.setAttribute("left", realLeft + "px");
        newCard.setAttribute("top", realTop + "px");
        // 添加到拖拽视图区域
        this.dragView.appendChild(newCard);
        break;
      // 删除当前卡片
      case CONTEXT_MENU_ITEM.DELETE:
        this.cardTarget && this.dragView.removeChild(this.cardTarget);
        break;
      // 边界当前卡片
      case CONTEXT_MENU_ITEM.EDITOR:
        const editor: HTMLDivElement =
          this.cardTarget?.shadowRoot?.querySelector(".content")!;
        editor.setAttribute("contenteditable", "true");
        // 聚焦光标
        editor.focus();
        // 在获取光标后勾选所有的文本内容
        document.execCommand("selectAll", true);
        break;
      case CONTEXT_MENU_ITEM.EXPORT:
        const container: HTMLDivElement =
          this.cardTarget?.shadowRoot?.querySelector(".container")!;
        let anchor: HTMLAnchorElement | null = document.createElement("a");
        // 获取文本内容
        const text: string =
          container.querySelector(".content")?.textContent || "";
        // 设置锚点链接
        anchor.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(text.trim())
        );
        anchor.setAttribute("download", "context.txt"); // 设置下载链接
        anchor.click(); // 触发点击, 进行导出
        anchor = null; // 置空元素, 方便 vm 回收
        break;
      case CONTEXT_MENU_ITEM.PRINT:
        setTimeout(print); /* 在主线程空闲后调用内置打印函数 */
        break;
      default:
        break;
    }
    // 点击完成后移隐藏菜单栏
    this.container.classList.add("hide");
  };

  /**
   * 鼠标右键事件处理
   * @param ev 鼠标点击右键触发的事件信息
   */
  private contextMenuHandler: (ev: MouseEvent) => void = (
    ev: MouseEvent
  ): void => {
    ev.preventDefault();
    ev.stopPropagation();

    const target: CustomCard | any = ev.target;
    this.cardTarget = target;

    // 记录当前的点击对象是否为一个 CustomCard 的实例
    const isCustomCardInstance: boolean = ev.target instanceof CustomCard;
    this.allItems.forEach((p: HTMLParagraphElement): void => {
      p.classList.add("hide");
    });

    // 如果目标为一个 CustomCard 实例的情况
    if (isCustomCardInstance) {
      this.allItems.forEach((p: HTMLParagraphElement): void => {
        // 目标为卡片实例时不显示 "添加" 和 "打印" 选项
        if (
          p.id !== CONTEXT_MENU_ITEM.ADD &&
          p.id !== CONTEXT_MENU_ITEM.PRINT
        ) {
          p.classList.remove("hide");
        }
      });
    }
    // 目标为拖拽可视区域
    else {
      // 目标不为卡片实例时显示 "添加" 和 "打印" 选项
      this.allItems.forEach((p: HTMLParagraphElement): void => {
        if (
          p.id === CONTEXT_MENU_ITEM.ADD ||
          p.id === CONTEXT_MENU_ITEM.PRINT
        ) {
          p.classList.remove("hide");
        }
      });
    }

    /* 右键菜单的宽高值 */
    const menuWidth: number = this.container.offsetWidth;
    const menuHeight: number = this.container.offsetHeight;

    /* 取得父级容器的宽高 */
    const activeViewWidth: number = this.dragView.offsetWidth;
    const activeViewHeight: number = this.dragView.offsetHeight;

    /* 边界处理 */
    let neededLeft: number = ev.offsetX;
    let neededTop: number = ev.offsetY;

    if (neededLeft <= 4) {
      neededLeft = 4;
    }
    if (neededTop <= 4) {
      neededTop = 4;
    }
    if (neededLeft >= activeViewWidth - menuWidth) {
      neededLeft = activeViewWidth - menuWidth - 4;
    }
    if (neededTop >= activeViewHeight - menuHeight) {
      neededTop = activeViewHeight - menuHeight - 4;
    }

    /* 更新记录的信息 */
    this.clickPosition.left = neededLeft;
    this.clickPosition.top = neededTop;

    /* 应用变换 */
    this.container.style.setProperty("--x", `${this.clickPosition.left}px`);
    this.container.style.setProperty("--y", `${this.clickPosition.top}px`);

    /* 移除样式 */
    if (this.container.classList.contains("hide")) {
      this.container.classList.remove("hide");
    }
  };
}
