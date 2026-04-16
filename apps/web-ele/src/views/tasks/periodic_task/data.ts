import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { Api } from '#/api/tasks/periodic_task';

import { h } from 'vue';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
import { ElTag } from 'element-plus';

import { $t } from '#/locales';

/**
 * 根据 Item 接口生成表单 Schema 配置
 * @returns VbenFormSchema 数组
 */
export function useSchema(): VbenFormSchema[] {
  return [
    // 基础信息
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 * @param onActionClick 表格操作按钮点击事件
 */
export function useColumns(
  onActionClick?: OnActionClickFn<Api.Item>,
): VxeTableGridOptions<Api.Item>['columns'] {
  return [
    {
      field: 'id',
      title: $t('system.role.id'),
      width: 80,
    },
    {
      field: 'name',
      title: '任务名称',
      width: 200,
    },
    {
      field: 'schedule_type',
      title: '执行类型',
      width: 110,
    },
    {
      field: 'enabled',
      title: '是否启用',
      width: 100,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          return h('div', { class: 'flex items-center justify-center' }, [
            h(
              ElTag,
              {
                type: row.enabled ? 'success' : 'info', // 启用显示绿色，禁用显示红色
                size: 'small',
              },
              () => (row.enabled ? '启用' : '禁用'), // 显示中文状态
            ),
          ]);
        },
      },
    },
    {
      field: 'one_off',
      title: '是否一次性',
      width: 80,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          return h('div', { class: 'flex items-center justify-center' }, [
            h(
              ElTag,
              {
                type: row.enabled ? 'success' : 'info', // 启用显示绿色，禁用显示红色
                size: 'small',
              },
              () => (row.enabled ? '是' : '否'), // 显示中文状态
            ),
          ]);
        },
      },
    },

    {
      field: 'schedule_display',
      minWidth: 190,
      title: '时间',
    },
    {
      field: 'total_run_count',
      title: '次数',
    },
    {
      field: 'last_run_at',
      title: '上一次运行',
    },
    {
      field: 'date_changed',
      title: '更新',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: '操作',
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 100,
    },
  ];
}
