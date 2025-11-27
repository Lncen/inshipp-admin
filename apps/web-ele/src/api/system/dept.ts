import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
    markup_type: string;
    percentage: string;
    fixed: string;
  }
  export interface SystemDeptData {
    results: SystemDept[];
    count: number;
    next: string;
    previous: string;
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptList(params?: { page?: number; page_size?: number }) {
  return requestClient.get<SystemDeptApi.SystemDeptData>('/system/dept', {
    params,
  });
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post('/system/dept', data);
}

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  id: string,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.put(`/system/dept/${id}`, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: string) {
  return requestClient.delete(`/system/dept/${id}`);
}

async function isDeptNameExists(
  name: string,
  id?: SystemDeptApi.SystemDept['id'],
) {
  return requestClient.get<boolean>('dept/deptName-exists', {
    params: { id, name },
  });
}

export { createDept, deleteDept, getDeptList, isDeptNameExists, updateDept };
