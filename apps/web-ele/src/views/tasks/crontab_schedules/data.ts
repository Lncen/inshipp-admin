import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { Api } from '#/api/tasks/crontab_schedules';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'minute',
      label: '分钟# 示例: 范围: 1-5 | 指定选中: 1,2,3 |  步长:*/2',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
      rules: z.string({
        required_error: $t('ui.formRules.required'),
        invalid_type_error: '此为必填项,* 表示所有',
      }),
    },
    {
      component: 'Input',
      fieldName: 'hour',
      label: '小时',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
      rules: z.string({
        required_error: $t('ui.formRules.required'),
        invalid_type_error: '此为必填项,* 表示所有',
      }),
    },
    {
      component: 'Input',
      fieldName: 'day_of_week',
      label: '一个月的第几天',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
      rules: z.string({
        required_error: $t('ui.formRules.required'),
        invalid_type_error: '此为必填项,* 表示所有',
      }),
    },
    {
      component: 'Input',
      fieldName: 'day_of_month',
      label: '一年的第几个月',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
      rules: z.string({
        required_error: $t('ui.formRules.required'),
        invalid_type_error: '此为必填项,* 表示所有',
      }),
    },
    {
      component: 'Input',
      fieldName: 'month_of_year',
      label: '一个星期的第几天',
      componentProps: {
        style: { width: '100%' }, // 设置宽度
      },
      rules: z.string({
        required_error: $t('ui.formRules.required'),
        invalid_type_error: '此为必填项,* 表示所有',
      }),
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
      field: 'minute',
      title: '分钟',
    },
    {
      field: 'hour',
      title: '小时',
    },

    {
      field: 'day_of_week',
      title: '一个月的第几天',
    },

    {
      field: 'day_of_month',
      title: '一年的第几个月',
    },
    {
      field: 'month_of_year',
      title: '一个星期的第几天',
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
