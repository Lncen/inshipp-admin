import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    id: number;
    task_id: string;
    periodic_task_name: null | string;
    task_name: null | string;
    task_args: null | unknown; // 通常为数组，但可能未记录
    task_kwargs: string; // 通常为对象，但可能未记录
    status:
      | 'FAILURE'
      | 'IGNORED'
      | 'PENDING'
      | 'RECEIVED'
      | 'REJECTED'
      | 'RETRY'
      | 'REVOKED'
      | 'STARTED'
      | 'SUCCESS';
    worker: null | string;
    content_type: string;
    content_encoding: string;
    result: string;
    date_created: string;
    date_started: null | string;
    date_done: null | string;
    traceback: null | string;
    meta: string; // 通常是 JSON 字符串，如 "{\"children\": []}"
  }
}

const path = 'take-result';

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

async function getDetail(id: number) {
  return requestClient.get<Api.Item>(`${path}/${id}`);
}

export { getDetail, getList };
