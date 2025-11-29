import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/finance/wallet_user';

import { h } from 'vue';

import { ElTag } from 'element-plus';

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: 'ID',
      width: 80,
    },
    {
      field: 'username',
      title: '用户名',
      width: 140,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          return h(
            'div',
            { class: 'flex items-center gap-2' },
            [
              h('span', row.username),
              row.phone &&
                h(ElTag, { size: 'small', type: 'info' }, () => row.phone),
            ].filter(Boolean),
          );
        },
      },
    },
    {
      field: 'balance_after',
      title: '余额',
      width: 130,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          return h('div', { class: 'flex items-center gap-1 font-medium' }, [
            h('span', row.balance_after),
          ]);
        },
      },
    },

    {
      field: 'type_display',
      title: '类型',
      width: 110,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          // 收入
          const typeMap: Record<
            number,
            {
              text: string;
              type: 'danger' | 'info' | 'primary' | 'success' | 'warning';
            }
          > = {
            1: { text: '用户充值', type: 'success' },
            4: { text: '退款入账', type: 'primary' },
            31: { text: '收到转账', type: 'success' },
            32: { text: '转账支出', type: 'primary' },
            11: { text: '后台加款', type: 'warning' },
            12: { text: '后台扣款', type: 'warning' },
            21: { text: '活动奖励', type: 'info' },
            22: { text: '红包/返利', type: 'warning' },
            2: { text: '用户提现', type: 'danger' },
            41: { text: '平台消费', type: 'info' },
            51: { text: '手续费扣除', type: 'warning' },
            99: { text: '强制没收', type: 'danger' },
            98: { text: '违规处罚', type: 'danger' },
          };
          const config = typeMap[row.type] || {
            text: row.type_display,
            type: 'info',
          };
          return h(
            ElTag,
            { type: config.type, effect: 'plain' },
            () => config.text,
          );
        },
      },
    },
    {
      field: 'amount_display',
      title: '变动金额',
      width: 130,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          const isPositive = row.amount.startsWith('-') === false;
          return h(
            'span',
            {
              class: isPositive
                ? 'text-success font-medium'
                : 'text-danger font-medium',
            },
            row.amount_display,
          );
        },
      },
    },

    {
      field: 'created_at',
      title: '时间',
      width: 170,
      formatter: ({ cellValue }: any) => {
        // 如果你有 dayjs 或 date-fns，直接用格式化
        return cellValue || '-';
      },
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 150,
      showOverflow: 'tooltip' as const,
    },
    {
      field: 'reference_id',
      title: '订单号',
      minWidth: 180,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          return h(
            'span',
            { class: 'font-mono text-xs text-gray-500' },
            row.reference_id || '-',
          );
        },
      },
    },
  ];
}
