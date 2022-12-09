type GENERATE_NUMBER_FUNC = (seed?: any) => number;

/**
 * @description 将一个可迭代对象的子项根据特定的时间进行返回
 * @export
 * @template T
 * @param {Iterable<T>} iterableConstructor 可迭代结构数据
 * @param {(number | GENERATE_NUMBER_FUNC)} [delay=1000] 返回元素的延迟时间(也可以是一个返回 number 数据类型的函数)
 */
export async function* iterableConstructorBackItemByDelay<T>(
  iterableConstructor: Iterable<T>,
  delay: number | GENERATE_NUMBER_FUNC = 1000
) {
  for (const item of iterableConstructor) {
    yield await new Promise((resolve): void => {
      setTimeout(
        (): void => {
          resolve(item);
        },
        typeof delay === "number" ? delay : delay()
      );
    });
  }
}
