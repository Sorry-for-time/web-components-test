/**
 * worker 线程的函数包裹体
 */
export function workerScriptBody(): void {
  const user = {
    databaseName: "data-view" /* 数据库名称 */,
    databaseVersion: 1 /* 数据库版本号 */,
    storeObjectName: "data-store" /* 实例对象名称 */,
    storeObjectId: "data-view-key" /* 唯一 key */,
  };

  let transaction: IDBTransaction | null = null;
  let database: IDBDatabase | null = null;
  let objectStore: IDBObjectStore | null = null;

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

  // worker 线程
  self.onmessage = ({ data }: MessageEvent<any>): void => {
    if (database) {
      transaction = database.transaction(user.storeObjectName, "readwrite");
      objectStore = transaction.objectStore(user.storeObjectName);
      if (objectStore) {
        let query: IDBRequest<IDBValidKey> = objectStore.put({
          id: user.storeObjectId,
          data,
        });
        query.onsuccess = (): void => {
          console.log("更新数据成功; key -->", query.result);
        };
      }
    }
  };
}
