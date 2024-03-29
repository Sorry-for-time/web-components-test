import { CustomCard } from "@/lib/components/CustomCard";
import { customConfirm } from "@/lib/components/CustomConfirm";
import { customMessage } from "@/lib/components/CustomMessage";
import { WebComponentBuiltInHooksDefine } from "@/lib/interface/WebComponentBuiltInHooksDefine";

const template: string = import.meta.glob("/src/templates/ContextMenu.html", {
  as: "raw",
  eager: true,
  import: "default"
})["/src/templates/ContextMenu.html"];

/**
 * 定义菜单选项里的选项名称
 */
const enum MenuItemType {
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

  /**
   * 移除所有卡片
   */
  REMOVE_ALL = "remove-all"
}

/**
 * @description 自定义菜单
 * @export
 * @class ContextMenu
 * @extends {HTMLElement}
 */
export class ContextMenu extends HTMLElement implements WebComponentBuiltInHooksDefine {
  private static readonly componentStr: string = template;

  private container: HTMLElement;

  private allItems: NodeListOf<HTMLParagraphElement>;

  private dragView: HTMLDivElement;

  private cardTarget: CustomCard | null = null;

  // 记录点击后经过边界处理的光位置
  private clickPosition: {
    left: number;
    top: number;
  } = {
    left: 0,
    top: 0
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = ContextMenu.componentStr;

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
   */
  private removeHideClass: (ev: MouseEvent) => void = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    if (!this.container.classList.contains("hide")) {
      this.container.classList.add("hide");
    }
  };

  /**
   * 鼠标单击菜单选项的对应操作
   */
  private clickMenuItemHandler: (ev: MouseEvent) => void = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    // 取得点击的目标元素
    const target: HTMLParagraphElement = ev.target as HTMLParagraphElement;
    switch (target.id) {
      case MenuItemType.ADD /* 添加新的卡片 */:
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
        this.dragView.appendChild(newCard); // 添加到拖拽视图区域
        break;
      case MenuItemType.DELETE /* 删除当前卡片 */:
        this.cardTarget && this.dragView.removeChild(this.cardTarget);
        break;
      case MenuItemType.EDITOR /* 编辑当前卡片 */:
        const editor: HTMLDivElement = this.cardTarget?.shadowRoot?.querySelector(".content")!;
        editor.setAttribute("contenteditable", "true");
        editor.focus(); // 聚焦光标
        document.execCommand("selectAll", true); // 在获取光标后勾选所有的文本内容
        break;
      case MenuItemType.EXPORT /* 导出卡片内容 */:
        const container: HTMLDivElement = this.cardTarget?.shadowRoot?.querySelector(".container")!;
        let anchor: HTMLAnchorElement | null = document.createElement("a");
        const text: string = container.querySelector(".content")?.textContent || ""; // 获取文本内容
        anchor.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text.trim())); // 设置锚点链接
        anchor.setAttribute("download", "context.txt"); // 设置下载链接
        anchor.click(); // 触发点击, 进行导出操作
        anchor = null; //  置空元素
        break;
      case MenuItemType.PRINT /* 打印当前页面  */:
        queueMicrotask(print);
        break;
      case MenuItemType.REMOVE_ALL /* 删除所有卡片 */:
        customConfirm
          .confirm("您确定删除所有卡片(这将没办法恢复)?")
          .then((): void => {
            this.dragView.innerHTML = "";
            customMessage.message("操作成功", "success");
          })
          .catch((): void => {
            customMessage.message("取消操作...", "info");
          });
        break;
      default:
        break;
    }
    // 点击完成后移隐藏菜单栏
    this.container.classList.add("hide");
  };

  /**
   * 鼠标右键事件处理
   */
  private contextMenuHandler: (ev: MouseEvent) => void = (ev: MouseEvent): void => {
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
        // 目标为卡片实例时不显示 "添加", "打印", "删除所有节点" 选项
        if (p.id !== MenuItemType.ADD && p.id !== MenuItemType.PRINT && p.id !== MenuItemType.REMOVE_ALL) {
          p.classList.remove("hide");
        }
      });
    }
    // 目标为拖拽可视区域
    else {
      // 目标不为卡片实例时显示 "添加", "打印" 和 "删除所有卡片" 选项
      this.allItems.forEach((p: HTMLParagraphElement): void => {
        if (p.id === MenuItemType.ADD || p.id === MenuItemType.PRINT || p.id === MenuItemType.REMOVE_ALL) {
          p.removeAttribute("class");
        }
      });
    }

    // 获取自定义菜单容器的宽高值
    const menuWidth: number = this.container.offsetWidth;
    const menuHeight: number = this.container.offsetHeight;

    // 取得父级容器的宽高
    const activeViewWidth: number = this.dragView.offsetWidth;
    const activeViewHeight: number = this.dragView.offsetHeight;

    // 边界处理
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
    // 更新记录的信息
    this.clickPosition.left = neededLeft;
    this.clickPosition.top = neededTop;
    // 应用变换
    this.container.style.setProperty("--x", `${this.clickPosition.left}px`);
    this.container.style.setProperty("--y", `${this.clickPosition.top}px`);
    // 移除样式
    if (this.container.classList.contains("hide")) {
      this.container.classList.remove("hide");
    }
  };
}
