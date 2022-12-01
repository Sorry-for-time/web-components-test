import { CustomCard } from "./lib/components/CustomCard.js";
import { ContextMenu } from "./lib/components/ContextMenu.js";
import { CustomConfirm } from "./lib/components/CustomConfirm.js";
import { workerScriptBody } from "./worker-script/IndexedDB-store-worker.js";
import {
  useSwitchTheme,
  useResetToDefaultTheme,
} from "./dom-operation/switch-theme.js";
import { debounce } from "./utils/performanceUtil.js";

const workerScriptRaw: string = workerScriptBody
  .toString()
  .replace("function workerScriptBody() {", "");
// worker 脚本字符串
const workerScript: string = workerScriptRaw
  .substring(0, workerScriptRaw.lastIndexOf("}"))
  .replaceAll("\n", "")
  .trim();
// 创建线程
const worker = new Worker(URL.createObjectURL(new Blob([workerScript])));

// 数据库配置信息
const user = {
  databaseName: "data-view" /* 数据库名称 */,
  databaseVersion: 1 /* 数据库版本号 */,
  storeObjectName: "data-store" /* 实例对象名称 */,
  storeObjectId: "data-view-key" /* 唯一 key */,
};

{
  // CustomCard.debugBucket.open = true; /* 打开自定义组件的日志记录输出 */
  // 注册自定义组件
  customElements.define("custom-card", CustomCard);
  customElements.define("context-menu", ContextMenu);
  customElements.define("custom-dialog", CustomConfirm);
}

window.addEventListener("load", (): void => {
  const dialog: CustomConfirm = new CustomConfirm();
  document.body.appendChild(dialog);

  // 点击按钮重置主题
  document
    .querySelector("#reset-theme")
    ?.addEventListener("click", debounce(useResetToDefaultTheme, true, 100));

  // 创建监听实例对象用于监听节点的属性变化
  const dragViewObserver = new MutationObserver(
    // 节点属性发送变化就通过 webworker 线程将新节点字符串推入 IndexedDB 数据库当中
    debounce(
      (_records: MutationRecord[]): void => {
        worker.postMessage({
          payload: dragView.innerHTML.toString().replaceAll("\n", "").trim(),
          isResetSignal: false,
        });
      },
      true,
      200,
    ),
  );

  // 页面相关的初始化操作
  function viewPageInitOperation(): void {
    // 初始化或者还原主题样式
    useSwitchTheme();
    // 监听节点属性的改变
    dragViewObserver.observe(dragView, {
      subtree: true,
      attributes: true,
      characterData: true,
      childList: true,
    });
  }

  // 获取拖拽视图区域所在节点
  const dragView: HTMLDivElement = document.querySelector(".drag-view")!;

  // 数据库实例引用
  let database: IDBDatabase | null = null;

  function databaseOperation(): void {
    // 创建一个连接到数据库的请求实例
    const idbRequest: IDBOpenDBRequest = indexedDB.open(
      user.databaseName /* 打开的数据库名称 */,
      user.databaseVersion /* 数据库版本 */,
    );

    idbRequest.onupgradeneeded = (): void => {
      database = idbRequest.result;
      /* 创建数据库的实例对象 */
      database.createObjectStore(
        user.storeObjectName, // 数据库实例对象名称(有点类似表)
        {
          keyPath: "id" /* 主键名称 */,
          autoIncrement: false /* 关闭主键自动递增 */,
        },
      );
    };

    idbRequest.onerror = (): void => {
      console.warn(idbRequest.error);
      viewPageInitOperation();
    };

    idbRequest.onsuccess = (): void => {
      database = idbRequest.result;
      // 创建一个只读写事务源
      const transaction: IDBTransaction = database.transaction(
        user.storeObjectName,
        "readonly",
      );

      // 获取数据对象实例
      const objectStore: IDBObjectStore = transaction.objectStore(
        user.storeObjectName,
      );

      // 进行读取数据操作
      const req: IDBRequest<any> = objectStore.get(user.storeObjectId);

      req.onsuccess = (): void => {
        const packet: any = req.result;
        if (packet && !packet.data.isResetSignal) {
          console.log("从 IndexedDB 获取数据成功");
          // 回写 dom 字符串
          dragView.innerHTML = packet.data.payload;
        }
        database?.close();
        viewPageInitOperation();
      };

      req.onerror = (): void => {
        console.warn("获取数据失败", req.error);
        viewPageInitOperation();
        database?.close();
      };
    };
  }
  databaseOperation();

  // 点击恢复默认布局
  document.querySelector("#reset-layout")!.addEventListener(
    "click",
    debounce(
      () => {
        dialog.alert("您确定恢复初始界面吗?", (value: boolean) => {
          if (value) {
            worker.postMessage({
              payload: "",
              isResetSignal: true,
            });
            window.location.reload();
          }
        });
      },
      true,
      100,
    ),
  );
});
