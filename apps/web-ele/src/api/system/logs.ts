import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemLogsApi {
  /**
   * 操作类型枚举
   */
  export enum ActionType {
    APPROVE = 'APPROVE',
    CREATE = 'CREATE',
    DELETE = 'DELETE',
    EXPORT = 'EXPORT',
    IMPORT = 'IMPORT',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    OTHER = 'OTHER',
    REJECT = 'REJECT',
    UPDATE = 'UPDATE',
    VIEW = 'VIEW',
  }

  /**
   * 严重程度枚举
   */
  export enum SeverityLevel {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
  }

  /**
   * 审计日志接口
   */
  export interface AuditLog {
    id: string;
    timestamp: string;
    user: null | number;
    username: string;
    action: ActionType;
    action_description: string;
    content_type: null | string;
    object_id: null | number;
    resource_name: string;
    resource_type: string;
    old_value: null | Recordable<any>;
    new_value: null | Recordable<any>;
    ip_address: null | string;
    user_agent: string;
    request_method: string;
    request_path: string;
    status_code: null | number;
    success: boolean;
    error_message: string;
    severity: SeverityLevel;
    severity_display: string;
    metadata: Recordable<any>;
    session_key: string;
    action_display: string;
    changes: null | { [key: string]: any };
  }

  /**
   * 归档审计日志接口
   */
  export interface AuditLogArchive {
    id: string;
    original_id: number;
    archived_date: string;
    log_data: Recordable<any>;
  }

  /**
   * 审计日志统计信息接口
   */
  export interface AuditLogStatistics {
    total_count: number;
    success_count: number;
    failure_count: number;
    by_action_type: Record<string, number>;
    by_severity: Record<string, number>;
    by_date: Record<string, number>;
  }
}

/**
 * 获取审计日志列表数据
 */
async function getAuditLogList(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogsApi.AuditLog>>('audit-logs/logs/', {
    params,
  });
}

/**
 * 创建审计日志
 * @param data 审计日志数据
 */
async function createAuditLog(data: Omit<SystemLogsApi.AuditLog, 'id'>) {
  return requestClient.post('audit-logs/logs/', data);
}

/**
 * 获取审计日志详情
 * @param id 审计日志 ID
 */
async function getAuditLogDetail(id: string) {
  return requestClient.get<SystemLogsApi.AuditLog>(`audit-logs/logs/${id}/`);
}

/**
 * 更新审计日志
 * @param id 审计日志 ID
 * @param data 审计日志数据
 */
async function updateAuditLog(
  id: string,
  data: Omit<SystemLogsApi.AuditLog, 'id'>,
) {
  return requestClient.put(`audit-logs/logs/${id}/`, data);
}

/**
 * 部分更新审计日志
 * @param id 审计日志 ID
 * @param data 审计日志数据
 */
async function partialUpdateAuditLog(id: string, data: Recordable<any>) {
  return requestClient.put(`audit-logs/logs/${id}/`, data);
}

/**
 * 删除审计日志
 * @param id 审计日志 ID
 */
async function deleteAuditLog(id: string) {
  return requestClient.delete(`audit-logs/logs/${id}/`);
}

/**
 * 获取审计日志统计信息
 */
async function getAuditLogStatistics() {
  return requestClient.get<SystemLogsApi.AuditLogStatistics>(
    'audit-logs/logs/statistics/',
  );
}

/**
 * 导出审计日志
 */
async function exportAuditLogs(params: Recordable<any>) {
  return requestClient.get('audit-logs/logs/export/', {
    params,
    responseType: 'blob',
  });
}

/**
 * 批量创建审计日志
 * @param data 审计日志数据数组
 */
async function bulkCreateAuditLogs(
  data: Array<Omit<SystemLogsApi.AuditLog, 'id'>>,
) {
  return requestClient.post('audit-logs/logs/bulk_create/', data);
}

/**
 * 归档旧日志
 */
async function archiveOldLogs(data: Recordable<any>) {
  return requestClient.post('audit-logs/logs/archive_old_logs/', data);
}

/**
 * 获取最近活动
 */
async function getRecentActivity(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogsApi.AuditLog>>(
    'audit-logs/logs/recent_activity/',
    { params },
  );
}

/**
 * 获取我的活动
 */
async function getMyActivity(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogsApi.AuditLog>>(
    'audit-logs/logs/my_activity/',
    { params },
  );
}

/**
 * 获取归档列表数据
 */
async function getArchiveList(params: Recordable<any>) {
  return requestClient.get<Array<SystemLogsApi.AuditLogArchive>>(
    'audit-logs/archives/',
    { params },
  );
}

/**
 * 获取归档详情
 * @param id 归档 ID
 */
async function getArchiveDetail(id: string) {
  return requestClient.get<SystemLogsApi.AuditLogArchive>(
    `audit-logs/archives/${id}/`,
  );
}

export {
  archiveOldLogs,
  bulkCreateAuditLogs,
  createAuditLog,
  deleteAuditLog,
  exportAuditLogs,
  getArchiveDetail,
  getArchiveList,
  getAuditLogDetail,
  getAuditLogList,
  getAuditLogStatistics,
  getMyActivity,
  getRecentActivity,
  partialUpdateAuditLog,
  updateAuditLog,
};
