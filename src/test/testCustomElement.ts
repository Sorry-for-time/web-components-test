import { CustomCard } from "@/lib/components/CustomCard";
import { iterableConstructorBackItemByDelay } from "@/utils/iterableObjDelayBackItem";

export async function testCustomElement() {
  const dragView: HTMLDivElement = document.querySelector(".drag-view")!;
  const customCards: Array<CustomCard> = Array.from(document.querySelectorAll("custom-card"));

  customCards.forEach((e) => {
    console.log("创建耗时: ", e.createCostTime);
  });
  for await (const v of iterableConstructorBackItemByDelay(customCards)) {
    dragView.removeChild(v as HTMLElement);
  }

  for await (const v of iterableConstructorBackItemByDelay(customCards, (): number => Math.random() * 1000)) {
    dragView.appendChild(v as HTMLElement);
  }
}
