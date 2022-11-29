import { CustomCard } from "./CustomCard.js";

/**
 * 定义菜单选项里的选项名称
 */
const enum CONTEXT_MENU_ITEM {
  ADD = "add",
  DELETE = "delete",
  EDITOR = "editor",
  EXPORT = "export",
}

/**
 * @description 自定义菜单
 * @export
 * @class ContextMenu
 * @extends {HTMLElement}
 */
export class ContextMenu extends HTMLElement {
  private container: HTMLElement;
  private allItems: NodeListOf<HTMLParagraphElement>;
  private dragView: HTMLDivElement;
  private cardTarget: CustomCard | null = null;

  /* 记录当前点击转换后的合法界面位置 */
  private clickPosition: {
    left: string;
    top: string;
  } = {
    left: "0px",
    top: "0px",
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

  public connectedCallback(): void {
    this.container.style.setProperty("--x", "0px");
    this.container.style.setProperty("--y", "0px");
    this.container.style.willChange = "transform";

    this.container.style.transform = "translate(var(--x), var(--y))";

    this.container.addEventListener("click", (ev: MouseEvent): void => {
      const target: HTMLParagraphElement = ev.target as HTMLParagraphElement;
      switch (target.id) {
        case CONTEXT_MENU_ITEM.ADD:
          const newCard: CustomCard = new CustomCard();
          newCard.setAttribute("left", this.clickPosition.left);
          newCard.setAttribute("top", this.clickPosition.top);
          this.dragView.appendChild(newCard);
          break;
        case CONTEXT_MENU_ITEM.DELETE:
          this.cardTarget && this.dragView.removeChild(this.cardTarget);
          break;
        case CONTEXT_MENU_ITEM.EDITOR:
          break;
        case CONTEXT_MENU_ITEM.EDITOR:
          break;
        default:
          break;
      }
    });

    document.addEventListener("contextmenu", (ev: MouseEvent): void => {
      ev.preventDefault();
      ev.stopPropagation();

      const target: CustomCard | any = ev.target;
      this.cardTarget = target;

      // 记录当前的点击对象是否为一个 CustomCard 的实例
      const isCustomCardInstance: boolean = ev.target instanceof CustomCard;
      this.allItems.forEach((p: HTMLParagraphElement): void => {
        p.classList.add("hide");
      });

      if (isCustomCardInstance) {
        this.allItems.forEach((p: HTMLParagraphElement): void => {
          if (p.id !== CONTEXT_MENU_ITEM.ADD) {
            p.classList.remove("hide");
          }
        });
      } else {
        this.allItems.forEach((p: HTMLParagraphElement): void => {
          if (p.id === CONTEXT_MENU_ITEM.ADD) {
            p.classList.remove("hide");
          }
        });
      }

      const menuWidth: number = this.container.offsetWidth;
      const menuHeight: number = this.container.offsetHeight;

      const activeViewWidth: number = this.dragView.offsetWidth;
      const activeViewHeight: number = this.dragView.offsetHeight;

      let neededLeft: number = ev.offsetX;
      let neededTop: number = ev.offsetY;

      if (neededLeft >= activeViewWidth - menuWidth) {
        neededLeft = activeViewWidth - menuWidth - 4;
      }
      if (neededTop >= activeViewHeight - menuHeight) {
        neededTop = activeViewHeight - menuHeight - 4;
      }

      this.clickPosition.left = neededLeft + "px";
      this.clickPosition.top = neededTop + "px";

      this.container.style.setProperty("--x", `${this.clickPosition.left}`);
      this.container.style.setProperty("--y", `${this.clickPosition.top}`);

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
