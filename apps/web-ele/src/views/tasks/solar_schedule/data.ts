import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { Api } from '#/api/tasks/solar_schedule';

import { z } from '#/adapter/form';
import { getRegisteredTasks } from '#/api/tasks/registered_tasks';
import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: async () => {
          const response = await getRegisteredTasks();

          // 检查响应结构
          let eventsArray: [string, string][] = [];

          if (Array.isArray(response)) {
            // 直接是二维数组的情况
            eventsArray = response;
          } else if (response && Array.isArray(response.data)) {
            // 包装在 data 字段中的情况
            eventsArray = response.data;
          }

          // 将二维数组转换为选项格式
          return eventsArray.map(([value, label]) => ({
            label, // 第二个元素是显示文本
            value, // 第一个元素是值
          }));
        },
        class: 'w-full',
      },
      fieldName: 'event',
      label: '事件',
    },
    {
      component: 'InputNumber',
      fieldName: 'latitude',
      label: '纬度',
      componentProps: {
        precision: 6, // 支持6位小数
        step: 0.000_001, // 步长
        style: { width: '100%' }, // 设置宽度
      },
      rules: z
        .number({
          required_error: '不能为空',
          invalid_type_error: '必须是数字',
        })
        .min(-90, '不能小于-90')
        .max(90, '不能大于90'),
    },
    {
      component: 'InputNumber',
      fieldName: 'longitude',
      label: '经度',
      componentProps: {
        precision: 6, // 支持6位小数
        step: 0.000_001, // 步长
        style: { width: '100%' }, // 设置宽度
      },
      rules: z
        .number({
          required_error: '不能为空',
          invalid_type_error: '必须是数字',
        })
        .min(-90, '不能小于-90')
        .max(90, '不能大于90'),
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
      title: $t('system.role.id'),
      width: 80,
    },
    {
      field: 'event_display_name',
      title: '事件',
      width: 150,
    },
    {
      field: 'latitude',
      title: '纬度',
    },
    {
      field: 'longitude',
      title: '经度',
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
