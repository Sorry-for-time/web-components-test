type DEBOUNCE_INSTANCE = () => void;
type THROTTLE_INSTANCE = () => void;

/**
 * 防抖包装工具函数
 * @param executorFn 需要进行防抖处理的函数
 * @param startImmediately 是否在第一次调用函数的时候立即执行, 无需等待, 默认为 true
 * @param delay 执行延迟, 默认 200ms
 * @param params 函数的参数
 * @returns 防抖包装函数
 */
export const debounce = (
  executorFn: Function,
  startImmediately: boolean = true,
  delay: number = 200,
  ...params: Array<any>
): DEBOUNCE_INSTANCE => {
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
};

/**
 * 自定义节流包装函数
 * @param executorFn  要进行节流的函数
 * @param startImmediately 首次是否立即指向
 * @param delay 延迟
 * @param params 函数的参数
 * @returns 节流包装函数
 */
export const throttle = (
  executorFn: Function,
  startImmediately: boolean = true,
  delay: number = 200,
  ...params: Array<any>
): THROTTLE_INSTANCE => {
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
};
