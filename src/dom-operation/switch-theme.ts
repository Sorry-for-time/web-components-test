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

      /* 清空所有主题 */
      document.body.classList.remove(
        ...document.body.classList.toString().split(" ")
      );
      switch (span.id) {
        case "normal":
          document.body.classList.add("normal-theme");
          break;
        case "dark":
          document.body.classList.add("dark-theme");
          break;
        case "special":
          document.body.classList.add("special-theme");
          break;
        default:
          document.body.classList.add("normal");
          break;
      }
      span.classList.add("active");
    });
  });
}
