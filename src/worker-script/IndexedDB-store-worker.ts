/**
 * worker 线程的函数包裹体
 */
export function workerScriptBody(): void {
  const databaseUser = {
    /**
     * 数据库名称
     */
    databaseName: "data-view",
    /**
     * 数据库版本号
     */
    databaseVersion: 1,
    /**
     * 实例对象名称
     */
    storeObjectName: "data-store",
    /**
     * 唯一 key
     */
    storeObjectId: "data-view-key"
  };

  let transaction: IDBTransaction | null = null;
  let database: IDBDatabase | null = null;
  let objectStore: IDBObjectStore | null = null;

  // 创建一个连接到数据库的实例
  const idbRequest: IDBOpenDBRequest = indexedDB.open(
    databaseUser.databaseName /* 打开的数据库 */,
    databaseUser.databaseVersion /* 数据库版本 */
  );

  idbRequest.onerror = (): void => {
    console.warn(idbRequest.error);
  };

  idbRequest.onupgradeneeded = (): void => {
    database = idbRequest.result;
    // 创建数据库
    database.createObjectStore(
      databaseUser.storeObjectName, // 数据库对象名
      {
        keyPath: "id" /* 主键名称 */,
        autoIncrement: false /* 关闭主键自增 */
      }
    );
  };

  idbRequest.onsuccess = (): void => {
    database = idbRequest.result;
  };

  // worker 线程
  self.onmessage = ({ data }: MessageEvent<any>): void => {
    if (database) {
      transaction = database.transaction(databaseUser.storeObjectName, "readwrite");
      objectStore = transaction.objectStore(databaseUser.storeObjectName);
      if (objectStore) {
        let query: IDBRequest<IDBValidKey> = objectStore.put({
          id: databaseUser.storeObjectId,
          data
        });
        query.onsuccess = (): void => {
          console.log("更新数据成功; key -->", query.result);
        };
      }
    }
  };
}
