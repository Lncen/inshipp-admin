import { requestClient } from '#/api/request';

export namespace SystemGroupApi {
  export interface SystemGroup {
    [key: string]: any;
    id: string;
    name: string;
    permissions: [];
    remark?: string;
    status: 0 | 1;
  }
  export interface SystemGroupData {
    results: SystemGroup[];
    count: number;
    next: string;
    previous: string;
  }
}

/**
 * 获取角色列表数据
 */
async function getGroupList(params?: { page?: number; page_size?: number }) {
  return requestClient.get<SystemGroupApi.SystemGroupData>('system/group/', {
    params,
  });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createGroup(data: Omit<SystemGroupApi.SystemGroup, 'id'>) {
  return requestClient.post('system/group/', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateGroup(
  id: string,
  data: Omit<SystemGroupApi.SystemGroup, 'id'>,
) {
  return requestClient.put(`/system/group/${id}/`, data);
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteGroup(id: string) {
  return requestClient.delete(`/system/group/${id}/`);
}

/**
 * 获取路由列表数据
 */
async function getMenu() {
  return requestClient.get<SystemGroupApi.SystemGroupData>('system/menu/');
}

export { createGroup, deleteGroup, getGroupList, getMenu, updateGroup };
