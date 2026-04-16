import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    id?: number;
    group_id: string;
    date_created: string;
    date_done: string;
    content_type: string;
    content_encoding: string;
    result: string;
  }
}

const path = 'task-group-result';

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
