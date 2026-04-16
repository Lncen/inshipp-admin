import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/vendor/vendor'; // 假设你的类型定义在此路径

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { statusType } from '#/api/vendor/vendor';
import { $t } from '#/locales';
import { renderChoiceTag } from '#/utils/renderChoiceTag';
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
      field: 'id',
      title: 'ID',
      width: 100,
    },
    {
      field: 'name',
      title: '名称',
      minWidth: 120,
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      slots: {
        default: ({ row }: { row: Api.Item }) =>
          renderChoiceTag(row.status, statusType as any),
      },
    },
    {
      field: 'connection_status',
      title: '连接状态',
      width: 100,
      slots: {
        default: ({ row }: { row: Api.Item }) => {
          // 这里需要根据实际的连接状态值来显示不同的标签
          const connectionStatus = row.connection_status;

          // 初始化默认值 - 使用Element Plus ElTag支持的类型
          let tagType: 'danger' | 'info' | 'primary' | 'success' | 'warning' =
            'success';
          let tagLabel = '已连接';

          // 根据实际的连接状态设置标签类型和文本
          if (connectionStatus !== '已连接') {
            tagType = 'danger';
            tagLabel = connectionStatus;
          }

          return h(
            ElTag,
            {
              type: tagType,
              size: 'small',
              effect: 'light',
            },
            () => tagLabel,
          );
        },
      },
    },

    {
      field: 'balance',
      title: '余额',
      width: 180,
    },

    {
      field: 'timeout_seconds',
      title: '请求超时秒数',
      minWidth: 60,
    },
    {
      field: 'retry_times',
      title: '最大重试次数',
      minWidth: 60,
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
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'product',
            text: '商品',
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
