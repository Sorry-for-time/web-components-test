export function useTypewriterEffect(): void {
  const slogan: HTMLHeadElement = document.querySelector("#app footer h1")!;
  const chars: string = slogan.textContent!;
  console.log(chars);
  let index: number = 0;

  setInterval((): void => {
    index = (index + 1) % chars.length;
    slogan.textContent = chars.substring(0, index + 1);
  }, 300);
}
