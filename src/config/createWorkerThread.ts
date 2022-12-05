import { workerScriptBody } from "../worker-script/IndexedDB-store-worker.js";
const workerScriptRaw: string = workerScriptBody
  .toString()
  .replace("function workerScriptBody() {", "");
// worker 脚本字符串
const workerScript: string = workerScriptRaw
  .substring(0, workerScriptRaw.lastIndexOf("}"))
  .replaceAll("\n", "")
  .trim();

// 创建线程
export const worker = new Worker(URL.createObjectURL(new Blob([workerScript])));
