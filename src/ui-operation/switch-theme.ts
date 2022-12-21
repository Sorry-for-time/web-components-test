/**
 * 定义主题颜色模式字符串
 */
const enum THEMES {
  "normal" = "normal-theme",
  "dark" = "dark-theme",
  "special" = "special-theme",
  "gray" = "gray-theme",
  "slogan" = "slogan-theme",
}

/**
 * @description 切换主题样式
 * @author Shalling <3330689546@qq.com>
 * @date 2022-11-27 21:11:03
 * @export
 */
export function useSwitchTheme(): void {
  /* 取得所有的主题颜色切换按钮 */
  const themeButtons: NodeListOf<HTMLSpanElement> = document.querySelectorAll("#app span");

  const storedThemeMode: string | null = localStorage.getItem("theme-mode");

  // 判断 localStorage 里是否存储了自定义的主题标识
  if (storedThemeMode) {
    let themeIDTag: string = "";
    switch (storedThemeMode) {
      case THEMES.normal:
        themeIDTag = THEMES.normal;
        break;
      case THEMES.dark:
        themeIDTag = THEMES.dark;
        break;
      case THEMES.special:
        themeIDTag = THEMES.special;
        break;
      case THEMES.gray:
        themeIDTag = THEMES.gray;
        break;
      case THEMES.slogan:
        themeIDTag = THEMES.slogan;
        break;
      default:
        themeIDTag = THEMES.normal;
        break;
    }
    document.body.classList.add(themeIDTag);
    // 设置激对应按钮的激活样式
    themeButtons.forEach((e: HTMLSpanElement): void => {
      if (e.id === themeIDTag) {
        e.classList.add("active");
      }
    });
  }
  // 如果本地未指定使用的主题模式, 那么判断系统所处的颜色模式
  else {
    /* 判断当前系统默认颜色是否处于暗色模式 */
    const colorMode: boolean = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (colorMode) {
      document.body.classList.add(THEMES.dark);
      themeButtons.forEach((e: HTMLSpanElement): void => {
        if (e.id === THEMES.dark) {
          e.classList.add("active");
        }
      });
    } else {
      document.body.classList.add(THEMES.normal);
      themeButtons.forEach((e: HTMLSpanElement): void => {
        if (e.id === THEMES.normal) {
          e.classList.add("active");
        }
      });
    }
  }

  // 初始化的时候移除掉 body 的隐藏样式
  document.body.classList.remove("hidden");

  // 点击按钮的时候切换主题颜色模式
  themeButtons.forEach((span: HTMLSpanElement): void => {
    // 清除所有的选中激活样式
    span.addEventListener("click", (): void => {
      themeButtons.forEach((el: HTMLSpanElement): void => {
        el.classList.remove("active");
      });

      /* 清空所有主题 */
      document.body.classList.remove(...document.body.classList.toString().split(" "));
      let spanThemeStr: string = THEMES.normal;
      switch (span.id) {
        case THEMES.normal:
          spanThemeStr = THEMES.normal;
          break;
        case THEMES.dark:
          spanThemeStr = THEMES.dark;
          break;
        case THEMES.special:
          spanThemeStr = THEMES.special;
          break;
        case THEMES.gray:
          spanThemeStr = THEMES.gray;
          break;
        case THEMES.slogan:
          spanThemeStr = THEMES.slogan;
          break;
        default:
          /* 除非非法修改, 不然应该不会有什么问题 */
          break;
      }

      document.body.classList.add(spanThemeStr);
      span.classList.add("active");
      localStorage.setItem("theme-mode", spanThemeStr);
    });
  });
}

/**
 * 将主题重置为系统的默认主题
 */
export function useResetToDefaultTheme(): void {
  localStorage.removeItem("theme-mode");
  document.querySelectorAll("#app span").forEach((span: Element): void => {
    span.classList.remove("active");
  });
  document.body.removeAttribute("class");
  useSwitchTheme();
}
