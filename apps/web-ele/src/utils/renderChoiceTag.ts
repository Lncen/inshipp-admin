// src/utils/renderChoiceTag.ts
import { h } from 'vue';

import { ElTag } from 'element-plus';

// 辅助渲染函数
const VALID_TAG_TYPES = [
  'info',
  'success',
  'primary',
  'warning',
  'danger',
] as const;

type ValidTagType = (typeof VALID_TAG_TYPES)[number];

interface ChoiceOption {
  value: number;
  label: string;
  type?: ValidTagType;
  size?: string;
  effect?: string;
}

/**
 * 渲染 Element Plus 标签（ElTag）
 * @param value 当前值（如 status=4）
 * @param options 选项配置数组（如 productStatusOptions）
 * @param fallbackText 未匹配时的默认文本
 * @returns VNode 或字符串
 */
export const renderChoiceTag = (
  value: null | number | undefined,
  options: readonly ChoiceOption[],
  fallbackText = '--',
) => {
  if (value === null) return fallbackText;

  const option = options.find((opt) => opt.value === value);
  if (!option) return fallbackText;

  const type: ValidTagType =
    option.type && VALID_TAG_TYPES.includes(option.type) ? option.type : 'info';

  return h(
    ElTag,
    {
      type,
      size: 'small',
      effect: 'light',
    },
    () => option.label, // 直接用 label 作为标签文本
  );
};

// ------------ 示例 -----------

// import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
// import type { Api } from '#/api/products/products';

// // 2. 商品类型 (ProductType)
// export const productTypeOptions = [
//   { label: '会员卡', value: 1 },
//   { label: '优惠券', value: 2 },
//   { label: '礼品卡 / 充值卡', value: 3 },
//   { label: '数字内容（电子书 / 视频）', value: 4 },
//   { label: '在线服务', value: 5 },
//   { label: '在线课程', value: 6 },
//   { label: '游戏道具 / 点卡', value: 7 },
//   { label: '其他虚拟商品', value: 8 },
// ] as const; // <-- 注意：这里使用了 const 语法，表示这是一个只读数组
// export function useColumns<T = Api.ProductItem>(
//   onActionClick: OnActionClickFn<T>,
// ): VxeTableGridOptions['columns'] {
//   return [

//     {
//       field: 'type',
//       title: $t('产品类型'),
//       width: 100,
//       slots: {
//         default: ({ row }: { row: Api.ProductItem }) =>
//           renderChoiceTag(row.type, productTypeOptions),
//       },
//     },
//   ]
// }
