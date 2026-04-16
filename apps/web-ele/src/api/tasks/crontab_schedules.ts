import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    id?: number;
    minute: string;
    hour: string;
    day_of_month: string;
    month_of_year: string;
    day_of_week: string;
    timezone: string;
  }
}

const path = 'crontab-schedules';

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

export { create, getList, remove, update };
