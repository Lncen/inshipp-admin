// src/views/finance/wallet/admin-logs/data.ts
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/finance/log';

import { h } from 'vue';

import { ElTag } from 'element-plus';

// ==================== 1. 搜索表单 ====================
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '被操作用户',
      componentProps: { placeholder: '用户名', clearable: true },
    },
    {
      component: 'Input',
      fieldName: 'operator',
      label: '操作人',
      componentProps: { placeholder: '管理员用户名', clearable: true },
    },
    {
      component: 'Select',
      fieldName: 'operation_type',
      label: '操作类型',
      componentProps: {
        placeholder: '全部类型',
        clearable: true,
        options: [
          { label: '后台加款', value: 'credit' },
          { label: '后台扣款', value: 'debit' },
          { label: '强制没收', value: 'force_deduct' },
          { label: '冻结钱包', value: 'freeze' },
          { label: '解冻钱包', value: 'unfreeze' },
          { label: '锁定钱包', value: 'lock' },
          { label: '解除锁定', value: 'unlock' },
          { label: '注销钱包', value: 'close' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '操作结果',
      componentProps: {
        placeholder: '全部',
        clearable: true,
        options: [
          { label: '成功', value: 'success' },
          { label: '失败', value: 'failed' },
        ],
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'timestamp',
      label: '操作时间',
      componentProps: {
        type: 'datetimerange',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: 'ID',
      width: 80,
      fixed: 'left',
    },
    {
      field: 'created_at',
      title: '操作时间',
      width: 150,
      align: 'center',
    },
    {
      field: 'username',
      title: '被操作用户',
      minWidth: 150,
    },
    {
      field: 'operator_name',
      title: '操作人',
      width: 120,
      slots: {
        default: ({ row }) => {
          return row.operator_name
            ? h('span', row.operator_name)
            : h('span', { class: 'text-gray-400' }, '系统');
        },
      },
    },
    {
      field: 'operation_display',
      title: '操作类型',
      width: 130,
      slots: {
        default: ({ row }) => {
          const config: Record<
            Api.Item['operation_type'],
            {
              effect?: 'dark' | 'plain';
              type: 'danger' | 'info' | 'success' | 'warning';
            }
          > = {
            credit: { type: 'success', effect: 'dark' },
            debit: { type: 'danger', effect: 'dark' },
            force_deduct: { type: 'warning', effect: 'dark' },
            freeze: { type: 'info' },
            unfreeze: { type: 'success' },
            lock: { type: 'warning' },
            unlock: { type: 'success' },
            close: { type: 'danger', effect: 'dark' },
          };

          const cfg = config[
            row.operation_type as Api.Item['operation_type']
          ] || { type: 'info' };

          return h(
            ElTag,
            {
              type: cfg.type,
              effect: 'plain',
              size: 'small',
              round: true,
            },
            () => row.operation_display,
          );
        },
      },
    },
    {
      field: 'amount',
      title: '操作金额',
      width: 140,
      align: 'right',
      slots: {
        default: ({ row }) => {
          if (!row.amount) return h('span', { class: 'text-gray-400' }, '-');

          const isIncome = row.operation_type === 'credit';
          const isExpense = ['debit', 'force_deduct'].includes(
            row.operation_type,
          );

          return h(
            'span',
            {
              class: [
                'font-bold text-lg',
                isIncome ? 'text-green-600' : '',
                isExpense ? 'text-red-600' : '',
              ].join(' '),
            },
            isIncome ? `+${row.amount}` : `-${row.amount}`,
          );
        },
      },
    },
    {
      field: 'status_display',
      title: '状态',
      width: 100,
      align: 'center',
      slots: {
        default: ({ row }) => {
          return h(
            ElTag,
            {
              type: row.status === 'success' ? 'success' : 'danger',
              effect: 'plain',
              size: 'small',
            },
            () => row.status_display,
          );
        },
      },
    },
    {
      field: 'reason',
      title: '操作原因',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    {
      field: 'ip_address',
      title: 'IP地址',
      width: 140,
      slots: {
        default: ({ row }) => {
          return row.ip_address || h('span', { class: 'text-gray-400' }, '-');
        },
      },
    },
  ];
}
