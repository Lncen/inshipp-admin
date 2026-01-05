import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/products/category';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { $t } from '#/locales';

export function useColumns(
  onActionClick: OnActionClickFn<Api.Item>,
): VxeTableGridOptions<Api.Item>['columns'] {
  return [
    {
      field: 'name',
      title: $t('products.name'),
      width: 200,
      align: 'left',
      treeNode: true,
    },
    {
      field: 'icon',
      title: $t('products.icon'),
      width: 200,
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
      field: 'path',
      title: $t('products.path'),
    },
    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          'delete', // 默认的删除按钮
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.menu.operation'),
      width: 150,
    },
  ];
}
