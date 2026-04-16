import { requestClient } from '#/api/request';

export namespace Api {
  // 单个钱包记录的类型
  export interface Item {
    id?: number;
    code: string;
    name: string;
    base_url: string;
    app_key: null | string;
    app_secret?: null | string;
    status?: number;
    status_display: string;
    timeout_seconds: number;
    retry_times: null | number;
    created_at: string;
    updated_at: string;
    description: string;
    platform?: number;
    balance: string;
    connection_status: string;
  }

  export interface ListResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Item;
  }

  export interface ListQueryParams {
    id?: string; // 搜索关键词（用户名/手机/邮箱）
    page?: number;
    page_size?: number;
  }
}

// 认证类型映射
const AuthType = [
  { value: 1, label: 'API Key' },
  { value: 2, label: 'Secret Key' },
  { value: 3, label: 'OAuth2' },
  { value: 4, label: 'Basic Auth' },
  { value: 5, label: 'HMAC 签名' },
];
const statusType = [
  { value: 1, label: '启用', type: 'success' },
  { value: 2, label: '暂停', type: 'warning' },
  { value: 3, label: '停用', type: 'danger' },
];

export const platformOptions = [
  { label: '亿乐sup', value: 'yilesup', type: 'warning' },
] as const;

/**
 * 获取列表数据
 */
async function getList(params?: Api.ListQueryParams) {
  return requestClient.get<Api.ListResponse>('vendors', {
    params,
  });
}
/**
 * 获取下拉列表数据
 */
async function getSelect() {
  return requestClient.get<Api.Item>('vendors/select');
}

async function getDetail(id: string) {
  return requestClient.get<Api.Item>(`vendors/${id}`);
}

/**
 * 状态检擦
 * @param params 参数
 */
async function health_check(params: any) {
  return requestClient.get<Api.Item>('vendors-info', { params });
}

/**
 * 创建
 * @param data 角色数据
 */
async function create(data: any) {
  return requestClient.post('vendors', data);
}

/**
 * 更新
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function update(id: string, data: any) {
  return requestClient.put(`vendors/${id}`, data);
}

// /**
//  * 删除
//  * @param id ID
//  */
// async function del(id: string) {
//   return requestClient.delete(`system/role/${id}`);
// }

export {
  AuthType,
  create,
  getDetail,
  getList,
  getSelect,
  health_check,
  statusType,
  update,
};
