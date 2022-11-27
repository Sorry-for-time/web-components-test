/**
 * @description 切换主题样式
 * @author Shalling <3330689546@qq.com>
 * @date 2022-11-27 21:11:03
 * @export
 */
export function switchTheme(): void {
  const themeButtons: NodeListOf<HTMLSpanElement> =
    document.querySelectorAll("#app span");

  themeButtons.forEach((span: HTMLSpanElement): void => {
    // 清除所有的选中激活样式
    span.addEventListener("click", (): void => {
      themeButtons.forEach((el: HTMLSpanElement): void => {
        el.classList.remove("active");
      });

      /* 如果选中的为白天模式 */
      if (span.id === "normal") {
        document.body.classList.remove("dark-theme");
        if (!document.body.classList.contains("normal-theme")) {
          document.body.classList.add("normal-theme");
          // 为按钮添加激活样式
          span.classList.add("active");
        }
      } else {
        /* 如果选中的为暗色模式 */
        document.body.classList.remove("normal-theme");
        if (!document.body.classList.contains("dark-theme"))
          document.body.classList.add("dark-theme");
        span.classList.add("active");
      }
    });
  });
}
