import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { Api } from '#/api/tasks/task_group_result';

import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '编号',
      componentProps: {
        readonly: true,
        style: { width: '100%' }, // 设置宽度
      },
    },
    {
      component: 'Input',
      fieldName: 'group_id',
      label: '组ID',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
    },
    {
      component: 'Input',
      fieldName: 'content_type',
      label: '内容类型',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
    },
    {
      component: 'Input',
      fieldName: 'content_encoding',
      label: '结果编码',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
    },
    {
      component: 'Input',
      fieldName: 'result',
      label: '结果数据',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
    },
    {
      component: 'Input',
      fieldName: 'date_created',
      label: '创建时间',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
    },
    {
      component: 'Input',
      fieldName: 'date_done',
      label: '完成时间',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
    },
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
      title: '编号',
      width: 80,
    },
    {
      field: 'group_id',
      title: '组ID',
    },
    {
      field: 'date_done',
      title: '完成时间',
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
