import "@/scss/base.scss";
import "@/config/registerComponent";
import { customConfirm } from "@/lib/components/CustomConfirm";
import { customMessage, MessageType } from "@/lib/components/CustomMessage";
import {
  useSwitchTheme,
  useResetToDefaultTheme,
} from "@/layout-ui-operation/switch-theme";
import { useTypewriterEffect } from "@/layout-ui-operation/typewriter-effect";
import { debounce, throttle } from "@/utils/performanceUtil";
import { worker } from "@/config/createWorkerThread";
import { databaseUser } from "@/config/databaseUserConfig";

window.addEventListener("load", (): void => {
  useTypewriterEffect();
  document.body.appendChild(customConfirm);
  document.body.appendChild(customMessage);

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
      200
    )
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

  // 数据库初始化操作
  function useDatabaseOperation(): void {
    // 创建一个连接到数据库的请求实例
    const idbRequest: IDBOpenDBRequest = indexedDB.open(
      databaseUser.databaseName /* 打开的数据库名称 */,
      databaseUser.databaseVersion /* 数据库版本 */
    );

    idbRequest.onupgradeneeded = (): void => {
      database = idbRequest.result;
      /* 创建数据库的实例对象 */
      database.createObjectStore(
        databaseUser.storeObjectName, // 数据库实例对象名称(有点类似表)
        {
          keyPath: "id" /* 主键名称 */,
          autoIncrement: false /* 关闭主键自动递增 */,
        }
      );
    };

    idbRequest.onerror = (): void => {
      console.warn(idbRequest.error);
      viewPageInitOperation();
    };

    idbRequest.onsuccess = (): void => {
      database = idbRequest.result;
      // 创建一个只读事务源
      const transaction: IDBTransaction = database.transaction(
        databaseUser.storeObjectName,
        "readonly"
      );

      // 获取数据对象实例
      const objectStore: IDBObjectStore = transaction.objectStore(
        databaseUser.storeObjectName
      );

      // 进行读取数据操作
      const req: IDBRequest<any> = objectStore.get(databaseUser.storeObjectId);

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

  useDatabaseOperation();

  // 点击按钮重置主题
  const resetThemeButton: HTMLButtonElement =
    document.querySelector("#reset-theme")!;
  resetThemeButton.addEventListener("click", (): void => {
    customConfirm
      .confirm("您确定恢复系统默认主题吗?")
      .then((): void => {
        useResetToDefaultTheme();
        customMessage.message("操作成功", "success");
      })
      .catch((): void => {
        customMessage.message("操作取消", "info");
      });
  });

  const resetLayoutButton: HTMLButtonElement =
    document.querySelector("#reset-layout")!;
  // 点击恢复默认布局
  resetLayoutButton.addEventListener("click", (): void => {
    customConfirm
      .confirm("您确定恢复初始界面吗?")
      .then((): void => {
        worker.postMessage({
          payload: "",
          isResetSignal: true,
        });
        window.location.reload();
      })
      .catch((): void => {
        customMessage.message("操作取消", "info");
      });
  });

  const messageBtn: HTMLButtonElement =
    document.querySelector("#send-message")!;
  messageBtn.addEventListener(
    "click",
    throttle(
      (): void => {
        customMessage.message(
          crypto.randomUUID().substring(12),
          ["info", "success", "warning", "danger"][
            Math.floor(Math.random() * 4)
          ] as MessageType
        );
      },
      true,
      80
    )
  );
});
