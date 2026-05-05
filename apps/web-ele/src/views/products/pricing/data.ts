import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { Api } from '#/api/products/pricing';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { statusOptions } from '#/api/products/pricing';
import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    // {
    //   component: 'ApiSelect',
    //   componentProps: {
    //     allowClear: true,
    //     api: async () => {
    //       const response = await getSelectPeriod();
    //       // 检查响应结构
    //       let eventsArray: [string, string][] = [];
    //       // 直接是二维数组的情况
    //       eventsArray = response;
    //       // 将二维数组转换为选项格式
    //       return eventsArray.map(([value, label]) => ({
    //         label, // 第二个元素是显示文本
    //         value, // 第一个元素是值
    //       }));
    //     },
    //     class: 'w-full',
    //   },
    //   fieldName: 'period',
    //   label: '间隔',
    // },
    // {
    //   component: 'InputNumber',
    //   fieldName: 'every',
    //   label: '时间',
    //   componentProps: {
    //     style: { width: '100%' }, // 设置宽度
    //   },
    //   rules: z
    //     .number({
    //       required_error: $t('ui.formRules.required'),
    //       invalid_type_error: $t('ui.formRules.number'),
    //     })
    //     .min(1, $t('ui.formRules.min', ['时间', 1]))
    //     .max(90, $t('ui.formRules.max', ['时间', 90])),
    // },
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
      width: 100,
    },
    {
      field: 'is_default',
      title: '默认',
      width: 60,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          if (!row.is_default) {
            return h('span', ''); // 返回空 span 而非 undefined
          }
          return h(
            ElTag,
            { type: 'success', size: 'small', effect: 'plain' },
            () => '默认',
          );
        },
      },
    },
    {
      field: 'name',
      title: '名称',
    },
    {
      field: 'status',
      title: '状态',
      width: 90,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          const status = row.status ?? 1; // 使用 nullish coalescing 更安全

          // 根据 value 查找匹配的选项
          const option = statusOptions.find((opt) => opt.value === status) || {
            label: `${status}`,
            type: 'info',
          };

          return h(
            ElTag,
            { type: option.type as any, size: 'small', effect: 'plain' },
            () => option.label,
          );
        },
      },
    },

    {
      field: 'valid_until_at',
      title: '到期时间',
    },
    {
      field: 'valid_period_status',
      title: '使用状态',
      width: 90,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          const valid_period_status = row.valid_period_status || '已过期';

          // 定义状态映射
          const validPeriodStatusOptions: Record<
            string,
            { label: string; type: string }
          > = {
            未开始: { label: '未开始', type: 'info' },
            生效中: { label: '生效中', type: 'success' },
            已过期: { label: '已过期', type: 'danger' },
            永久有效: { label: '永久有效', type: 'success' },
          };

          const { label, type } = validPeriodStatusOptions[
            valid_period_status as keyof typeof validPeriodStatusOptions
          ] || { label: `${valid_period_status}`, type: 'info' };

          return h(
            ElTag,
            { type: type as any, size: 'small', effect: 'plain' },
            () => label,
          );
        },
      },
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
