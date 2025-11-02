import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { $t } from '#/locales';

export function getMenuTypeOptions() {
  return [
    {
      color: 'processing',
      label: $t('system.menu.typeCatalog'),
      value: 'catalog',
    },
    { color: 'default', label: $t('system.menu.typeMenu'), value: 'menu' },
    { color: 'error', label: $t('system.menu.typeButton'), value: 'button' },
    {
      color: 'success',
      label: $t('system.menu.typeEmbedded'),
      value: 'embedded',
    },
    { color: 'warning', label: $t('system.menu.typeLink'), value: 'link' },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<SystemMenuApi.SystemMenu>,
): VxeTableGridOptions<SystemMenuApi.SystemMenu>['columns'] {
  return [
    {
      align: 'left',
      field: 'meta.title',
      fixed: 'left',
      slots: { default: 'title' },
      title: $t('system.menu.menuTitle'),
      treeNode: true,
      width: 250,
    },
    {
      align: 'center',
      field: 'type',
      title: $t('system.menu.type'),
      width: 100,
      slots: {
        default: ({ row }: { row: SystemMenuApi.SystemMenu }) => {
          const typeMap: Record<
            string,
            {
              text: string;
              type: 'danger' | 'info' | 'primary' | 'success' | 'warning';
            }
          > = {
            catalog: { type: 'primary', text: $t('system.menu.typeCatalog') },
            menu: { type: 'success', text: $t('system.menu.typeMenu') },
            button: { type: 'danger', text: $t('system.menu.typeButton') },
            embedded: { type: 'warning', text: $t('system.menu.typeEmbedded') },
            link: { type: 'info', text: $t('system.menu.typeLink') },
          };
          const config = typeMap[row.type] || { type: 'info', text: row.type };
          return h('div', [
            h(
              ElTag,
              {
                size: 'small',
                type: config.type, // 此时类型已正确匹配
              },
              config.text,
            ),
          ]);
        },
      },
    },
    {
      field: 'perm',
      title: $t('system.menu.authCode'),
      width: 200,
    },
    {
      align: 'left',
      field: 'path',
      title: $t('system.menu.path'),
      width: 200,
    },

    {
      align: 'left',
      field: 'component',
      formatter: ({ row }) => {
        switch (row.type) {
          case 'catalog':
          case 'menu': {
            return row.component ?? '';
          }
          case 'embedded': {
            return row.meta?.iframeSrc ?? '';
          }
          case 'link': {
            return row.meta?.link ?? '';
          }
        }
        return '';
      },
      minWidth: 200,
      title: $t('system.menu.component'),
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.menu.status'),
      width: 100,
      slots: {
        default: ({ row }: { row: SystemMenuApi.SystemMenu }) => {
          const statusMap: Record<
            string,
            {
              text: string;
              type: 'danger' | 'info' | 'primary' | 'success' | 'warning';
            }
          > = {
            1: { type: 'success', text: '启用' },
            0: { type: 'danger', text: '禁用' },
          };
          const config = statusMap[String(row.status)] || {
            type: 'info',
            text: String(row.status),
          };
          return h('div', [
            h(
              ElTag,
              {
                size: 'small',
                type: config.type,
              },
              config.text,
            ),
          ]);
        },
      },
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
      width: 130,
    },
  ];
}
