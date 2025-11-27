import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserApi } from '#/api';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { z } from '#/adapter/form';
import { getGroupsList } from '#/api';
import { $t } from '#/locales';

export function usePasswordFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('users.user.id'),
      dependencies: {
        show: false,
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'new_password',
      label: $t('密码'),
      rules: z
        .string()
        .min(6, $t('至少6个字符'))
        .max(20, $t('最多20个字符'))
        // 添加密码字符限制（只允许字母、数字和符号）
        .regex(
          /^[\w!@#$%^&*()+\-=[\]{};':"\\|,.<>/?`~]*$/,
          $t('只允许字母、数字和符号'),
        ),
    },
    {
      component: 'Input',
      fieldName: 'confirm_password',
      label: $t('确认密码'),
      rules: z
        .string()
        .min(6, $t('至少6个字符'))
        .max(20, $t('最多20个字符'))
        // 添加密码字符限制（只允许字母、数字和符号）
        .regex(
          /^[\w!@#$%^&*()+\-=[\]{};':"\\|,.<>/?`~]*$/,
          $t('只允许字母、数字和符号'),
        ),
    },
  ];
}
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('users.user.id'),

      dependencies: {
        show: false,
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'date_joined',
      label: $t('users.user.createdAt'),
      // rules: 'required',
      disabled: true,
      dependencies: {
        show: (row) => {
          return row?.id !== undefined;
        },

        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('users.user.username'),
      rules: z
        .string()
        .min(6, $t('至少6个字符'))
        .max(20, $t('最多20个字符'))
        // 添加密码字符限制（只允许字母、数字和符号）
        .regex(
          /^[\w!@#$%^&*()+\-=[\]{};':"\\|,.<>/?`~]*$/,
          $t('只允许字母、数字和符号'),
        ),
      dependencies: {
        disabled: (row) => {
          return row?.id !== undefined;
        },
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'password',
      label: $t('密码'),
      // rules: 'required',
      dependencies: {
        show: (row) => {
          return row?.id === undefined;
        },
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('users.user.email'),
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('users.user.nickname'),
      // rules: 'required',
      dependencies: {
        show: (row) => {
          return row?.id !== undefined;
        },
        triggerFields: ['id'],
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        // 菜单接口转options格式
        afterFetch: (data: { name: string; path: string }[]) => {
          return data.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
        },
        // 菜单接口
        api: getGroupsList,
        multiple: true,
      },
      // 字段名
      fieldName: 'groups',
      // 界面显示的label
      label: $t('users.user.group'),
      dependencies: {
        show: (row) => {
          return row?.id !== undefined;
        },
        triggerFields: ['id'],
      },
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
      dependencies: {
        show: (row) => {
          return row?.id !== undefined;
        },
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'bio',
      label: $t('users.user.bio'),
      dependencies: {
        show: (row) => {
          return row?.id !== undefined;
        },
        triggerFields: ['id'],
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('是'), value: true },
          { label: $t('否'), value: false },
        ],
        optionType: 'button',
      },
      defaultValue: false,
      fieldName: 'is_staff',
      label: $t('users.user.is_staff'),
      dependencies: {
        show: (row) => {
          return row?.id !== undefined;
        },
        triggerFields: ['id'],
      },
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

// 表格
export function useColumns<T = UserApi.UserInfo>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('users.user.id'),
      width: 80,
    },
    {
      field: 'username',
      title: $t('users.user.username'),
      width: 150,
    },
    {
      field: 'role',
      title: $t('users.user.group'),
      width: 150,
      slots: {
        default: ({ row }: { row: UserApi.UserInfo }) => {
          return h(
            'div',
            {
              class: 'flex items-center justify-center',
            },
            [
              h(
                ElTag,
                {
                  type: 'warning',
                  size: 'small',
                },
                () => row.role,
              ),
            ],
          );
        },
      },
    },
    {
      field: 'nickname',
      title: $t('users.user.nickname'),
      width: 100,
    },
    {
      field: 'is_active',
      title: $t('system.role.is_active'),
      width: 100,
      slots: {
        default: ({ row }: { row: UserApi.UserInfo }) => {
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
      field: 'bio',
      minWidth: 200,
      title: $t('users.user.bio'),
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
