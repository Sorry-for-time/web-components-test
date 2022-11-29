import { CustomCard } from "./lib/CustomCard.js";
import { ContextMenu } from "./lib/ContextMenu.js";
import { useSwitchTheme } from "./dom-operation/switch-theme.js";
import { debounce } from "./utils/performanceUtil.js";

// worker 脚本字符串
const workerScript = `
const user = {
  databaseName: "data-view" /* 数据库名称 */,
  databaseVersion: 1 /* 数据库版本号 */,
  storeObjectName: "data-store" /* 实例对象名称 */,
  storeObjectId: "data-view-key" /* 唯一 key */,
};
let transaction = null;
let database = null;
let objectStore = null;
// 创建一个连接到数据库的实例
const idbRequest = indexedDB.open(user.databaseName /* 打开的数据库 */, user.databaseVersion /* 数据库版本 */);
idbRequest.onerror = () => {
  console.warn(idbRequest.error);
};
idbRequest.onupgradeneeded = () => {
  database = idbRequest.result;
  /* 创建数据库 */
  database.createObjectStore(user.storeObjectName, // 数据库对象名称(有点类似表)
  {
      keyPath: "id" /* 主键名称 */,
      autoIncrement: false /* 关闭主键自动递增 */,
  });
};
idbRequest.onsuccess = () => {
  database = idbRequest.result;
};
// worker 线程
self.onmessage = ({ data }) => {
  if (database) {
      transaction = database.transaction(user.storeObjectName, "readwrite");
      objectStore = transaction.objectStore(user.storeObjectName);
      if (objectStore) {
          let query = objectStore.put({
              id: user.storeObjectId,
              data,
          });
          query.onsuccess = () => {
              console.log("插入数据成功成", query.result);
          };
      }
  }
};
`;
const worker = new Worker(URL.createObjectURL(new Blob([workerScript])));

const user = {
  databaseName: "data-view" /* 数据库名称 */,
  databaseVersion: 1 /* 数据库版本号 */,
  storeObjectName: "data-store" /* 实例对象名称 */,
  storeObjectId: "data-view-key" /* 唯一 key */,
};

let database: IDBDatabase | null = null;

// 创建一个连接到数据库的实例
const idbRequest: IDBOpenDBRequest = indexedDB.open(
  user.databaseName /* 打开的数据库 */,
  user.databaseVersion /* 数据库版本 */
);

idbRequest.onerror = (): void => {
  console.warn(idbRequest.error);
};

idbRequest.onupgradeneeded = (): void => {
  database = idbRequest.result;

  /* 创建数据库 */
  database.createObjectStore(
    user.storeObjectName, // 数据库对象名称(有点类似表)
    {
      keyPath: "id" /* 主键名称 */,
      autoIncrement: false /* 关闭主键自动递增 */,
    }
  );
};

idbRequest.onsuccess = (): void => {
  database = idbRequest.result;
};

window.addEventListener("load", (): void => {
  const dragView = document.querySelector(".drag-view")!;

  const transaction: IDBTransaction | null =
    database && database.transaction(user.storeObjectName, "readwrite");

  if (transaction) {
    const objectStore: IDBObjectStore = transaction.objectStore(
      user.storeObjectName
    );

    const res = objectStore.get(user.storeObjectId);
    res.onsuccess = () => {
      const str = res.result;
      if (str) {
        console.log(str);

        dragView.innerHTML = str.data;
      }
      database?.close();
      useSwitchTheme();
    };
  }

  const observer = new MutationObserver(
    debounce(
      (_records: MutationRecord[]): void => {
        worker.postMessage(dragView.innerHTML.toString().replaceAll("\n", ""));
      },
      true,
      1000
    )
  );

  observer.observe(dragView, {
    subtree: true,
    attributes: true,
    characterData: true,
    childList: true,
  });
  // 注册组件
  customElements.define("custom-card", CustomCard);
  customElements.define("context-menu", ContextMenu);
});
