import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/finance/wallet'; // 假设你的类型定义在此路径

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { $t } from '#/locales';

// 网格搜索表单 Schema - 用于顶部快速搜索
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: $t('finance.wallets.searchKeyword'),
      componentProps: {
        placeholder: $t('finance.wallets.searchPlaceholder'), // e.g. "用户名/手机/邮箱"
      },
    },
  ];
}

// 表格列配置
export function useColumns<T = Api.Item>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'user_id',
      title: $t('finance.wallets.userId'),
      width: 100,
    },
    {
      field: 'username',
      title: $t('finance.wallets.username'),
      minWidth: 120,
    },
    {
      field: 'balance',
      title: $t('finance.wallets.balance'),
      width: 120,
      align: 'right',
    },
    {
      field: 'frozen_balance',
      title: $t('finance.wallets.frozenBalance'),
      width: 120,
      align: 'right',
    },
    {
      field: 'is_active',
      title: $t('finance.wallets.status'),
      width: 100,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
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
      field: 'phone',
      title: $t('finance.wallets.phone'),
      minWidth: 130,
    },
    {
      field: 'email',
      title: $t('finance.wallets.email'),
      minWidth: 180,
    },

    {
      field: 'created_at',
      title: $t('finance.wallets.createdAt'),
      width: 160,
    },
    {
      field: 'updated_at',
      title: $t('finance.wallets.updatedAt'),
      width: 160,
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.permission.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: '详细',
          },
          {
            code: 'edit_balance',
            text: '调整余额',
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 110,
    },
  ];
}
