<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElLoading, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, getRoleList, updateRole } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
            current_page: page.currentPage,
            page_size: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

function onActionClick(e: SystemRoleApi.SystemRole) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

/**
 * 将 Element Plus 的 MessageBox.confirm 封装为更简洁的 confirm 函数
 * @param content 提示内容
 * @param title 提示标题（可选，默认为“确认”）
 */
function confirm(content: string, title: string = $t('common.confirm')) {
  return ElMessageBox.confirm(content, title, {
    type: 'warning', // 可选：'success' | 'warning' | 'info' | 'error'
    confirmButtonText: $t('common.ok'), // 确认按钮文本
    cancelButtonText: $t('common.cancel'), // 取消按钮文本
    // 可根据需要添加其他配置，如 center: true, draggable: true 等
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(
  newStatus: number,
  row: SystemRoleApi.SystemRole,
) {
  const status: Recordable<string> = {
    0: '禁用',
    1: '启用',
  };
  try {
    await confirm(
      `你要将${row.name}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateRole(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemRoleApi.SystemRole) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemRoleApi.SystemRole) {
  // 1. 显示全局 loading（Element Plus 的加载遮罩）
  const loading = ElLoading.service({
    text: $t('ui.actionMessage.deleting', [row.name]),
    background: 'rgba(0, 0, 0, 0.7)', // 可选：半透明遮罩
    customClass: 'delete-loading', // 可选：自定义类名
  });

  deleteRole(row.id)
    .then(() => {
      // 2. 关闭 loading
      loading.close();
      // 3. 显示成功消息
      ElMessage.success($t('ui.actionMessage.deleteSuccess', [row.name]));
      // 4. 刷新列表
      onRefresh();
    })
    .catch((error) => {
      // 5. 删除失败：关闭 loading + 提示错误
      loading.close();
      // ElMessage.error($t('ui.actionMessage.deleteFailed', [row.name]));
      console.error('Delete role failed:', error);
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
