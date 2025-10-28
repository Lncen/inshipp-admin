import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { h } from 'vue';

import { ElButton, ElTag } from 'element-plus';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('system.role.id'),
      componentProps: {
        readonly: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.role.code'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
        optionType: 'button',
      },
      defaultValue: false,
      fieldName: 'is_system',
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    { component: 'Input', fieldName: 'id', label: $t('system.role.id') },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
    },
    { component: 'Input', fieldName: 'code', label: $t('system.role.code') },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
      },
      fieldName: 'is_system',
      label: $t('system.role.status'),
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: $t('system.role.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'created_at',
      label: $t('system.role.createTime'),
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('system.role.id'),
      width: 80,
    },
    {
      field: 'name',
      title: $t('system.role.roleName'),
      width: 150,
    },
    { field: 'code', title: $t('system.role.code'), width: 100 },
    {
      field: 'is_system',
      title: $t('system.role.status'),
      width: 100,
      slots: {
        default: ({ row }: { row: SystemRoleApi.SystemRole }) => {
          const isEnabled = row.is_system;
          return h(
            'div',
            {
              class: 'flex items-center justify-center',
            },
            [
              h(
                ElTag,
                {
                  type: isEnabled ? 'success' : 'info',
                  size: 'small',
                },
                () =>
                  isEnabled ? $t('common.enabled') : $t('common.disabled'),
              ),
            ],
          );
        },
      },
    },
    {
      field: 'description',
      minWidth: 200,
      title: $t('system.role.remark'),
    },
    {
      field: 'created_at',
      title: $t('system.role.createTime'),
      width: 150,
    },
    {
      align: 'center',
      slots: {
        default: ({ row }: { row: SystemRoleApi.SystemRole }) => {
          return [
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                text: true,
                onClick: () => onActionClick({ code: 'edit', row } as any),
              },
              '编辑',
            ),
            h(
              ElButton,
              {
                type: 'danger',
                size: 'small',
                text: true,
                onClick: () => onActionClick({ code: 'delete', row } as any),
              },
              '删除',
            ),
          ];
        },
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 130,
    },
  ];
}
