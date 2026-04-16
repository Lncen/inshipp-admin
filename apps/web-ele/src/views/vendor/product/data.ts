import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/products/products';

import { $t } from '#/locales';

export function useColumns<T = Api.ProductItem>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'checkbox',
      width: 30,
      align: 'center',
      fixed: 'left',
    },
    {
      field: 'id',
      title: $t('products.id'),
      width: 70,
    },

    {
      field: 'name',
      title: $t('products.name'),
    },
    {
      field: '',
      title: '价格',
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('products.product'),
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
