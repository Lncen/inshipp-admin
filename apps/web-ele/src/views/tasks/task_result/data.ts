import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { Api } from '#/api/tasks/task_result';

import { $t } from '#/locales';

/**
 * 根据 Item 接口生成表单 Schema 配置
 * @returns VbenFormSchema 数组
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: 'ID',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'task_id',
      label: '任务ID ',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'periodic_task_name',
      label: '周期任务名称',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'task_name',
      label: '任务函数名',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'take_status',
      label: '状态',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'worker',
      label: '执行 Worker',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'content_type',
      label: '内容类型',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'content_encoding',
      label: '编码',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input', // 或 'TextArea' / 'Text'
      fieldName: 'result',
      label: '任务结果',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'date_created',
      label: '创建时间',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'date_started',
      label: '开始时间',
      componentProps: {
        placeholder: '未记录',
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'date_done',
      label: '完成时间',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input', // 或 'TextArea'
      fieldName: 'traceback',
      label: '错误堆栈',
      componentProps: {
        readOnly: true,
      },
      // 移除了不支持的 show 属性
    },
    {
      component: 'Input',
      fieldName: 'meta',
      label: '元数据 (Meta)',
      componentProps: {
        readOnly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'task_args',
      label: '任务参数 (args)',
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'task_kwargs',
      label: '任务关键字参数 (kwargs)',
      componentProps: {
        readonly: true,
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
      field: 'task_id',
      title: '任务ID',
    },
    {
      field: 'task_name',
      title: '任务名称',
    },
    {
      field: 'periodic_task_name',
      title: '定期任务名称',
    },
    {
      field: 'take_status',
      title: '状态',
    },
    {
      field: 'date_done',
      title: '完成时间',
    },
    {
      field: 'worker',
      title: '执行者',
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
