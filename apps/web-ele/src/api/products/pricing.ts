import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    id?: number | undefined;
    name: string;
    description: string;
    is_default: boolean;
    status: number;
    valid_period: [Date, Date] | undefined;
    created_at: string;
    updated_at: string;
    valid_period_status: string;
    rules: Api.Rule[];
  }

  export interface Rule {
    id?: number;
    level: number;
    name: string;
    discount_rate: number;
  }
}

const path = 'price-templates';

const statusOptions = [
  { label: '启用', value: 1, type: 'success' },
  { label: '禁用', value: 2, type: 'danger' },
];

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
 * 获取详情
 * @param id ID
 */
async function getDetail(id: number) {
  return requestClient.get<Api.Item>(`${path}/${id}`);
}

/**
 * 获取选择框数据
 */
async function getTemplateSelect() {
  return requestClient.get<Api.Item>(`${path}/${'list_select'}`);
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

export {
  create,
  getDetail,
  getList,
  getTemplateSelect,
  remove,
  statusOptions,
  update,
};
