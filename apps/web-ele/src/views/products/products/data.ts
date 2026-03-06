import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/products/products';

import { h } from 'vue';

import {
  flagOptions,
  isClosedOptions,
  productStatusOptions,
  productTypeOptions,
  redeemTypeOptions,
  ruleTypeOptions,
  sourceTypeOptions,
} from '#/api/products/products';
import { $t } from '#/locales';
import { formatImageUrl } from '#/utils/formatImageUrl';
import { renderChoiceTag } from '#/utils/renderChoiceTag';

export function useGridFormSchema(supplierSelectData: any): VbenFormSchema[] {
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
      component: 'Select',
      fieldName: 'owner_sup',
      label: $t('products.supplier_name'),
      componentProps: {
        placeholder: '请选择状态',
        options: supplierSelectData,
        props: { value: 'id', label: 'name' },
      },
    },
    {
      component: 'Select',
      fieldName: 'rule_type',
      label: '规则类型',
      componentProps: {
        placeholder: '请选择状态',
        options: ruleTypeOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'is_closed',
      label: '是否关闭下单',
      componentProps: {
        placeholder: '请选择状态',
        options: isClosedOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'source_type',
      label: '来源类型',
      componentProps: {
        placeholder: '请选择状态',
        options: sourceTypeOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '商品状态',
      componentProps: {
        placeholder: '请选择状态',
        options: productStatusOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '商品类型',
      componentProps: {
        placeholder: '请选择状态',
        options: productTypeOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'fulfillment_type',
      label: '发货方式',
      componentProps: {
        placeholder: '请选择状态',
        options: redeemTypeOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'is_repeatable',
      label: '是否支持重复购买',
      componentProps: {
        placeholder: '请选择状态',
        options: flagOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'can_refund',
      label: '是否支持退款',
      componentProps: {
        placeholder: '请选择状态',
        options: flagOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'can_refund',
      label: '是否支持退款',
      componentProps: {
        placeholder: '请选择状态',
        options: flagOptions,
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
      field: 'images',
      title: $t('主图'),
      width: 70,
      slots: {
        default: ({ row }: { row: Api.ProductItem }) => {
          return row.images &&
            Array.isArray(row.images) &&
            row.images.length > 0
            ? h('img', {
                src: formatImageUrl(row.images[0]),
                alt: '产品主图',
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px',
                },
              })
            : h('span', { style: { color: '#999' } }, '暂无图片');
        },
      },
    },
    {
      field: 'name',
      width: 150,
      title: $t('products.name'),
    },
    {
      field: 'is_closed',
      title: $t('关闭下单'),
      width: 80,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.ProductItem }) =>
          renderChoiceTag(row.is_closed, isClosedOptions),
      },
    },
    {
      field: 'source_type',
      title: $t('产品来源'),
      width: 100,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.ProductItem }) =>
          renderChoiceTag(row.is_closed, sourceTypeOptions),
      },
    },
    {
      field: 'status',
      title: $t('产品状态'),
      width: 100,
      align: 'center',
      slots: {
        default: ({ row }: { row: Api.ProductItem }) =>
          renderChoiceTag(row.is_closed, productStatusOptions),
      },
    },
    {
      field: 'profit',
      title: $t('products.profit'),
      width: 100,
      slots: {
        default: ({ row }: { row: Api.ProductItem }) => {
          const price = Number(row.price) || 0;
          const costPrice = Number(row.cost_price) || 0;
          const calculatedValue = price - costPrice;
          return calculatedValue.toFixed(8);
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
      width: 80,
    },
    {
      field: 'rule_type',
      title: $t('结算规则'),
      width: 100,
      slots: {
        default: ({ row }: { row: Api.ProductItem }) =>
          renderChoiceTag(row.type, ruleTypeOptions),
      },
    },
    {
      field: 'created_at',
      title: $t('创建时间'),
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
