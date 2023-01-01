import { CustomCard } from "@/lib/components/CustomCard";
import { CommonToolCollection } from "../utils/CommonToolCollection";
export async function testCustomElement(): Promise<void> {
  const dragView: HTMLDivElement = document.querySelector(".drag-view")!;
  const customCards: Array<CustomCard> = Array.from(document.querySelectorAll("custom-card"));

  customCards.forEach((aCard: CustomCard): void => {
    console.log("创建耗时: ", aCard.createCostTime);
  });

  for await (const v of CommonToolCollection.iterableConstructorBackItemByDelay(customCards)) {
    dragView.removeChild(v as HTMLElement);
  }

  for await (const v of CommonToolCollection.iterableConstructorBackItemByDelay(
    customCards,
    (): number => Math.random() * 1000
  )) {
    dragView.appendChild(v as HTMLElement);
  }
}
