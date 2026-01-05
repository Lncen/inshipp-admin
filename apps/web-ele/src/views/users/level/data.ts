import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/user/level';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { $t } from '#/locales';

/**
 * 新增 / 编辑表单 Schema
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('users.memberLevel.id'),
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'level_id',
      label: $t('users.memberLevel.levelId'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name', // API 使用 level_name（对应模型的 name 字段）
      label: $t('users.memberLevel.levelName'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'required_score',
      label: $t('users.memberLevel.requiredScore'),
      rules: 'required',
      componentProps: {
        min: 0,
        precision: 0,
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'discount_rate',
      label: $t('users.memberLevel.discountRate'),
      rules: 'required',
      componentProps: {
        min: 0,
        step: 0.01,
        precision: 2,
        style: 'width: 100%',
        placeholder: '例如：0.95 表示 9.5 折',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'is_active',
      label: $t('users.memberLevel.status'),
      defaultValue: true,
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
      },
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: $t('users.memberLevel.description'),
      componentProps: {
        type: 'textarea',
        rows: 4,
      },
    },
  ];
}

/**
 * 表格顶部搜索表单 Schema（快速搜索）
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('users.memberLevel.levelName'),
    },
    {
      component: 'Select',
      fieldName: 'is_active',
      label: $t('users.memberLevel.status'),
      componentProps: {
        clearable: true,

        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
      },
    },
  ];
}

/**
 * 表格列定义
 */
export function useColumns<T = Api.Item>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('users.memberLevel.id'),
      width: 80,
      fixed: 'left',
    },
    {
      field: 'level_id',
      title: $t('users.memberLevel.levelId'),
      width: 100,
    },
    {
      field: 'name',
      title: $t('users.memberLevel.levelName'),
      width: 160,
    },
    {
      field: 'required_score',
      title: $t('users.memberLevel.requiredScore'),
      width: 140,
      formatter: ({ cellValue }) => {
        return cellValue ?? '-';
      },
    },
    {
      field: 'discount_rate',
      title: $t('users.memberLevel.discountRate'),
      width: 130,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          return h('div', { class: 'flex items-center justify-center' }, [
            h(
              ElTag,
              {
                type: 'warning',
                size: 'small',
              },
              () => row.discount_rate,
            ),
          ]);
        },
      },
    },
    {
      field: 'is_active',
      title: $t('users.memberLevel.status'),
      width: 100,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          const isEnabled = row.is_active;
          return h('div', { class: 'flex items-center justify-center' }, [
            h(
              ElTag,
              {
                type: isEnabled ? 'success' : 'info',
                size: 'small',
              },
              () => (isEnabled ? $t('common.enabled') : $t('common.disabled')),
            ),
          ]);
        },
      },
    },
    {
      field: 'description',
      title: $t('users.memberLevel.description'),
      minWidth: 200,
      showOverflow: true,
    },
    {
      field: 'created_at',
      title: $t('users.memberLevel.createdAt'),
      width: 170,
    },
    {
      field: 'updated_at',
      title: $t('users.memberLevel.updatedAt'),
      width: 170,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('users.memberLevel.levelName'),
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
