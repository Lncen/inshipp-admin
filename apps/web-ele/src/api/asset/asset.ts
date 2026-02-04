import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    id: string;
    file: string;
    filename: string;
    width: number;
    height: number;
    size: number; // bytes
    ref_count: string;
    created_at: string;
  }

  export interface ListResponse {
    current_page: string;
    per_page: string;
    total: number;
    results: Item[];
  }

  export interface queryParams {
    page: number;
    page_size: number;
    assetType?: string;
    objectType?: string;
    usageType?: string;
  }

  // 图片上传响应类型
  export interface UploadResponse {
    url: string; // 上传后的图片URL
    id?: string; // 图片ID（如果后端返回）
    filename?: string; // 文件名（如果后端返回）
    size?: number; // 文件大小（如果后端返回）
    // 可根据实际后端响应结构进行调整
  }

  export interface UsageType {
    avatar: string;
    cover: string;
    gallery: string;
    detail: string;
    banner: string;
    attachment: string;
    other: string;
  }

  export interface ObjectType {
    product: string;
    user: string;
    content: string;
  }

  export interface AssetType {
    image: string;
    video: string;
    audio: string;
    file: string;
    other: string;
  }
}

/**
 * 获取数据
 */
async function getList(params: Recordable<any>) {
  return requestClient.get<Api.ListResponse>('asset', {
    params,
  });
}

/**
 * 创建
 * @param data 数据
 */
async function upload(data: Recordable<any>) {
  return requestClient.post('assets/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: Api.Item['id']) {
  return requestClient.delete(`asset/${id}`);
}

export { getList, remove, upload };
