import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    id: number;
    every: number;
    period: string;
  }
}

const path = 'interval-schedules';

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
async function create(data: Omit<Api.Item, 'children' | 'id'>) {
  return requestClient.post(path, data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: number, data: Omit<Api.Item, 'children' | 'id'>) {
  return requestClient.put(`${path}/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: number) {
  return requestClient.delete(`${path}/${id}`);
}

async function getSelectPeriod() {
  return requestClient.get<Array<[string, string]>>(`${path}/select_period`);
}

export { create, getList, getSelectPeriod, remove, update };
