import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/user/user';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { z } from '#/adapter/form';
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
export function useColumns<T = Api.Item>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('users.user.id'),
      width: 90,
      fixed: 'left',
      align: 'center',
    },

    {
      field: 'username',
      title: $t('users.user.username'),
      width: 160,
      showOverflow: 'tooltip',
    },
    {
      field: 'balance',
      title: $t('users.user.balance'),
      width: 120,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          const balance = row.balance || 1;
          return h(
            ElTag,
            { type: 'success', size: 'small', effect: 'plain' },
            () => `${balance}`,
          );
        },
      },
    },
    {
      field: 'nickname',
      title: $t('users.user.nickname'),
      width: 140,
      showOverflow: 'tooltip',
    },
    {
      field: 'group_names',
      title: $t('users.user.group'), // 角色/用户组
      width: 140,
      slots: {
        default: ({ row }: { row: Api.ListResponse }) => {
          const groupNames = Array.isArray(row.group_names)
            ? row.group_names.join(',')
            : row.group_names || '';

          if (!groupNames) {
            return h(ElTag, { type: 'info', size: 'small' }, () => '无角色');
          }

          const groups = groupNames
            .split(',')
            .map((g: string) => g.trim())
            .filter(Boolean);

          return h(
            'div',
            { class: 'flex flex-wrap gap-1 justify-center' },
            groups.map((group: string) =>
              h(
                ElTag,
                {
                  type: group.includes('管理员') ? 'danger' : 'warning',
                  size: 'small',
                },
                () => group,
              ),
            ),
          );
        },
      },
    },
    {
      field: 'level',
      title: $t('users.user.level'),
      width: 90,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          const level = row.level || 1;
          let type: 'danger' | 'success' | 'warning' = 'success';
          if (level >= 50) type = 'danger';
          else if (level >= 10) type = 'warning';

          return h(
            ElTag,
            { type, size: 'small', effect: 'plain' },
            () => `Lv.${level}`,
          );
        },
      },
    },

    {
      field: 'order_count',
      title: $t('users.user.order_count'),
      width: 100,
      align: 'center',
    },
    {
      field: 'is_active',
      title: $t('users.user.status'),
      width: 100,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          const isActive = row.is_active;
          return h(
            ElTag,
            {
              type: isActive ? 'success' : 'info',
              size: 'small',
              effect: 'light',
            },
            () => (isActive ? $t('common.enabled') : $t('common.disabled')),
          );
        },
      },
    },
    {
      field: 'status',
      title: $t('users.user.status'),
      width: 100,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          // 你返回的 status 字段是 "在线" / "离线"
          const isOnline = row.status === '在线';
          return h('div', { class: 'flex items-center justify-center gap-1' }, [
            h('span', {
              class: `inline-block size-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`,
            }),
            h(
              ElTag,
              {
                type: isOnline ? 'success' : 'info',
                size: 'small',
              },
              () => row.status,
            ),
          ]);
        },
      },
    },
    {
      field: 'remark',
      title: $t('users.user.remark'),
      showOverflow: 'tooltip',
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
      width: 100,
    },
  ];
}
