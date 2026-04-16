import { requestClient } from '#/api/request';

export namespace Api {
  export type RegisteredTaskItem = [string, string]; // 任务名称为字符串类型

  export interface Item {
    data: RegisteredTaskItem[]; // 包含任务数组的响应体
  }
}

/**
 * 日程事件数据
 */
async function getRegisteredTasks() {
  return requestClient.get<Api.Item>('solar-events-select');
}

export { getRegisteredTasks };
