import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { h } from 'vue';

import { ElTag } from 'element-plus';

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
      fieldName: 'level',
      label: $t('system.role.level'),
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
      fieldName: 'is_active',
      label: $t('system.role.status'),
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: $t('system.role.remark'),
    },
    {
      component: 'Input',
      fieldName: 'permission_ids',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
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
    {
      field: 'permissions_count',
      title: $t('system.role.permissions_count'),
      width: 100,
    },
    {
      field: 'users_count',
      title: $t('system.role.users_count'),
      width: 100,
    },
    {
      field: 'is_active',
      title: $t('system.role.is_active'),
      width: 100,
      slots: {
        default: ({ row }: { row: SystemRoleApi.SystemRole }) => {
          const isEnabled = row.is_active;
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
      field: 'updated_at',
      title: $t('system.role.updated_at'),
      width: 150,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 130,
    },
  ];
}
