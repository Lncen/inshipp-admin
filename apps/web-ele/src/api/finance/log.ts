import { requestClient } from '#/api/request';

export namespace Api {
  // 单个钱包记录的类型
  export interface Item {
    id: number;

    // 被操作的用户
    username: string;
    user_id: number;

    // 操作人
    operator_name: string;
    operator_id: null | number;

    // 操作类型
    operation_type:
      | 'close'
      | 'credit'
      | 'debit'
      | 'force_deduct'
      | 'freeze'
      | 'lock'
      | 'unfreeze'
      | 'unlock';
    operation_display: string; // 如：后台加款、强制没收

    // 操作结果
    status: 'failed' | 'success';
    status_display: string; // 如：操作成功、操作失败

    // 金额（加款/扣款/没收时有值）
    amount: null | string;

    // 必填原因（合规核心！）
    reason: string;

    // 失败时的错误信息
    error_message?: null | string;

    // 操作环境
    ip_address: null | string;
    user_agent?: null | string;

    // 时间
    created_at: string; // 推荐后端返回格式：2025-04-05 14:30:22
  }

  export interface ListResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Item[];
    total_balance: string; // 所有钱包余额总和，字符串格式
  }

  export interface ListQueryParams {
    username?: string;
    operator_id?: number;
    operator?: string;
    operation_type?:
      | 'close'
      | 'credit'
      | 'debit'
      | 'force_deduct'
      | 'freeze'
      | 'lock'
      | 'unfreeze'
      | 'unlock';
    status?: 'failed' | 'success';
    start_date?: string; // YYYY-MM-DD
    end_date?: string; // YYYY-MM-DD
    page?: number;
    page_size?: number;
  }
}

/**
 * 获取列表数据
 */
async function getList(params?: Api.ListQueryParams) {
  return requestClient.get<Api.ListResponse>('admin/operation-logs', {
    params,
  });
}

export { getList };
