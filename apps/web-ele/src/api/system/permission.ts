import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemPermissionApi {
  export interface SystemPermission {
    id: string;
    name: string;
    content_type?: number;
    children: SystemPermissionApi.SystemPermission[];
  }
  export interface SystemPermissionData {
    current_page: number;
    page_size: number;
    results: SystemPermissionApi.SystemPermission[];
  }
}

/**
 * 获取权限列表数据
 */
async function getPermissionList(params?: Recordable<any>) {
  return requestClient.get<Array<SystemPermissionApi.SystemPermissionData>>(
    'permissions/',
    {
      params,
    },
  );
}

/**
 * 创建权限
 * @param data 权限数据
 */
async function createPermission(
  data: Omit<SystemPermissionApi.SystemPermission, 'id'>,
) {
  return requestClient.post('permissions', data);
}

/**
 * 更新权限
 *
 * @param id 权限 ID
 * @param data 权限数据
 */
async function updatePermission(
  id: string,
  data: Omit<SystemPermissionApi.SystemPermission, 'id'>,
) {
  return requestClient.put(`permissions/${id}/`, data);
}

/**
 * 删除权限
 * @param id 权限 ID
 */
async function deletePermission(id: string) {
  return requestClient.delete(`permissions/${id}/`);
}

/**
 * 获取权限类型
 */
async function getContentTypeList(params?: Recordable<any>) {
  return requestClient.get<Array<SystemPermissionApi.SystemPermission>>(
    'permissions/get_content_types/',
    {
      params,
    },
  );
}

export {
  createPermission,
  deletePermission,
  getContentTypeList,
  getPermissionList,
  updatePermission,
};
