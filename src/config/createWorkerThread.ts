import { workerScriptBody } from "@/worker-script/indexedDB-store-worker";

/**
 * 获取原始工作者线程函数整体字符串
 */
const workerScriptRaw: string = workerScriptBody.toString().replace("function workerScriptBody() {", "");

/**
 * 截取 worker 脚本字符串函数体
 */
const workerScript: string = workerScriptRaw.substring(0, workerScriptRaw.lastIndexOf("}")).replaceAll("\n", "").trim();

/**
 * 创建专用工作者线程
 */
export const worker = new Worker(URL.createObjectURL(new Blob([workerScript])));
