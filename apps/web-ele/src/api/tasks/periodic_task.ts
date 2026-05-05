import { requestClient } from '#/api/request';
// 23
export namespace Api {
  export interface Item {
    id?: number;
    name: string;
    task: string;
    interval: null | number;
    crontab: null | number;
    solar: null | number;
    clocked: null | number; // 是否是时钟任务
    one_off: boolean; // 是否一次性
    last_run_at: string; // 最后运行时间

    // 任务参数
    args: string; // JSON编码的位置参数(例如: ["arg1", "arg2"])
    kwargs: string; //  JSON编码的关键字参数(例如: {"argument": "value"})

    // 执行选项
    queue: string; // 队列
    exchange: string; // 任务交换器
    routing_key: string; // 任务路由
    headers: string; // 任务头
    priority: number; // 任务优先级
    expires: string | undefined; // 任务过期时间
    expire_seconds: string; // 任务过期秒数

    start_time: string; // 任务开始时间
    enabled: boolean; // 任务是否启用

    total_run_count: number; // 总运行次数
    date_changed: string; // 最后修改日期
    description: string; // 任务描述
    objects: string; // 关联对象信息
  }
}

const path = 'periodic-tasks';

/**
 * 获取列表数据
 */
async function getList(params?: {
  id?: number;
  page?: number;
  page_size?: number;
}) {
  return requestClient.get<Array<Api.Item>>(path, {
    params,
  });
}

/**
 * 根据ID获取单条数据
 */
async function getDetail(id: number) {
  return requestClient.get<Api.Item>(`${path}/${id}`);
}
/**
 * 创建
 * @param data 数据
 */
async function create(data: Omit<Api.Item, 'id'>) {
  return requestClient.post(path, data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: number, data: Omit<Api.Item, 'id'>) {
  return requestClient.put(`${path}/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: number) {
  return requestClient.delete(`${path}/${id}`);
}

/**
 * 获取周期任务配置
 */
async function getTaskConfig() {
  return requestClient.get<any>(`tasks-config`);
}

export { create, getDetail, getList, getTaskConfig, remove, update };
