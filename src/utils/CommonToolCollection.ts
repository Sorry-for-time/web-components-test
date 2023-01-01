/**
 * 常用工具集合类
 */
export abstract class CommonToolCollection {
  /**
   * 将一个可迭代对象的子项根据特定的时间进行返回
   * @param iterableConstructor 可迭代结构
   * @param delay 迭代延迟
   */
  public static async *iterableConstructorBackItemByDelay<T>(
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

  /**
   * 函数防抖包装器函数
   * @param executorFn 需进行防抖操作的原始函数
   * @param startImmediately 是否在首次执行时立即执行
   * @param delay 间隔延迟. 默认 200ms
   * @param params 函数执行参数
   * @returns 进行防抖包装处理的函数
   */
  static debounce(
    executorFn: Function,
    startImmediately: boolean = true,
    delay: number = 200,
    ...params: Array<any>
  ): DEBOUNCE_INSTANCE {
    let timer: null | number;
    return (): void => {
      if (startImmediately) {
        timer = setTimeout(executorFn, 0, ...params);
        startImmediately = false;
      } else {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(executorFn, delay, ...params);
      }
    };
  }

  /**
   * 函数节流包装器函数
   * @param executorFn 需进行节流操作的原始函数
   * @param startImmediately 是否在首次执行时立即执行
   * @param delay 间隔延迟. 默认 200ms
   * @param params 函数执行参数
   * @returns 进行节流包装处理的函数
   */
  static throttle(
    executorFn: Function,
    startImmediately: boolean = true,
    delay: number = 200,
    ...params: Array<any>
  ): THROTTLE_INSTANCE {
    let locker: boolean = false;
    return (): void => {
      if (startImmediately) {
        startImmediately = false;
        locker = true;
        setTimeout((): void => {
          executorFn(...params);
          locker = false;
        });
      } else {
        if (locker) {
          return;
        }
        locker = true;
        setTimeout((): void => {
          executorFn(...params);
          locker = false;
        }, delay);
      }
    };
  }
}

export type GENERATE_NUMBER_FUNC = () => number;
export type DEBOUNCE_INSTANCE = () => void;
export type THROTTLE_INSTANCE = () => void;
