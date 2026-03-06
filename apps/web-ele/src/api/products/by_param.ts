import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    product?: string | undefined;
    id?: string | undefined;
    key: string;
    label: string;

    value: string;
    description: string;

    input_type: number | undefined;
    type_config: string;

    default_value: string;
    use_default: number;

    is_required: number;
    is_hidden: number;

    validate_min: number;
    validate_max: number;

    is_edit: number;
  }

  export interface QueryParams {
    page?: number;
    page_size?: number;
    product_id?: number;
  }
}

// 6. 输入类型 (InputType)
export const inputTypeOptions = [
  { label: '文本', value: 1 },
  { label: '数字', value: 2 },
  { label: '下拉选择', value: 3 },
  { label: '多选', value: 4 },
  { label: '多行文本', value: 5 },
  { label: 'URL 链接', value: 6 },
] as const;

/**
 * 创建
 * @param data 数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('products-param', data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`products-param/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: any) {
  return requestClient.delete(`products-param/${id}`);
}

export { create, remove, update };
