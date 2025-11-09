import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemPermissionApi } from '#/api/system/permission';

import { z } from '#/adapter/form';
import { getContentTypeList } from '#/api/system/permission';
import { $t } from '#/locales';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.permission.id'),
      componentProps: {
        disabled: true,
      },
    },
    // {
    //   component: 'Input',
    //   fieldName: 'name',
    //   label: $t('system.permission.name'),
    //   rules: z
    //     .string()
    //     .min(2, $t('ui.formRules.minLength', [$t('system.permission.name'), 2]))
    //     .max(
    //       20,
    //       $t('ui.formRules.maxLength', [$t('system.permission.name'), 50]),
    //     ),
    // },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getContentTypeList,
        class: 'w-full',
        labelField: 'name',
        showSearch: true,
        valueField: 'id',
        placeholder: $t('请选择权限类型'),
      },
      fieldName: 'content_type',
      label: $t('system.permission.content_type'),
      rules: z
        .any()
        .refine((val) => val !== undefined && val !== null && val !== '', {
          message: $t('权限类型不能为空'),
        }),
      defaultValue: null,
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 * @param onActionClick 表格操作按钮点击事件
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemPermissionApi.SystemPermission>,
): VxeTableGridOptions<SystemPermissionApi.SystemPermission>['columns'] {
  return [
    {
      align: 'left',
      field: 'id',
      fixed: 'left',
      title: $t('system.permission.id'),
      treeNode: true,
      width: 150,
    },
    {
      field: 'name',
      title: $t('system.permission.name'),
      width: 180,
    },
    {
      field: 'content_type',
      title: $t('system.permission.content_type'),
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
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemPermissionApi.SystemPermission) => {
              return !!(row.children && row.children.length > 0);
            },
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 200,
    },
  ];
}
