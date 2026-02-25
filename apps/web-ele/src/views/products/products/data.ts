import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/products/products';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('products.id'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('products.name'),
    },
    {
      component: 'Input',
      fieldName: 'supplier',
      label: $t('products.supplier_name'),
    },
    {
      component: 'Select',
      fieldName: 'is_active',
      label: $t('products.status'),
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'has_stock',
      label: $t('products.stock'),
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '有', value: true },
          { label: '无', value: false },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'is_card_product',
      label: $t('products.is_card_product'),
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
      },
    },
  ];
}

export function useColumns<T = Api.ProductItem>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('products.id'),
      width: 70,
    },
    {
      field: 'Images',
      title: $t('主图'),
      width: 200,
    },
    {
      field: 'name',
      title: $t('products.name'),
      width: 200,
    },

    {
      field: 'profit',
      title: $t('products.profit'),
      width: 100,
      slots: {
        default: ({ row }: { row: Api.ProductItem }) => {
          // 转换为数字类型并计算 profit = price - cost_price
          const price = Number(row.price) || 0;
          const costPrice = Number(row.cost_price) || 0;
          const calculatedValue = price - costPrice;
          return calculatedValue.toFixed(8); // 保留两位小数
        },
      },
    },
    {
      field: 'is_active',
      title: $t('products.status'),

      slots: {
        default: ({ row }: { row: Api.ProductItem }) => {
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
      field: 'price',
      title: $t('products.price'),
      width: 100,
    },
    {
      field: 'cost_price',
      title: $t('products.cost_price'),
      width: 100,
    },
    {
      field: 'stock',
      title: $t('products.stock'),
    },
    {
      field: 'min_quantity',
      title: $t('products.min_quantity'),
    },

    {
      field: 'supplier_name',
      title: $t('products.supplier_name'),
      width: 90,
      slots: {
        default: ({ row }: { row: Api.ProductItem }) => {
          return h(
            ElTag,
            {
              type: 'warning',
              size: 'small',
              effect: 'light',
            },
            () => row.supplier_name || '--',
          );
        },
      },
    },
    {
      field: 'refund_allowed',
      title: $t('products.is_refund_allowed'),
      width: 80,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.ProductItem }) => {
          const isActive = row.is_refund_allowed;
          return h(
            ElTag,
            {
              type: isActive ? 'success' : 'info',
              size: 'small',
              effect: 'light',
            },
            () => (isActive ? '是' : '否'),
          );
        },
      },
    },
    {
      field: 'updated_at',
      title: $t('products.updated_at'),
      width: 140,
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
