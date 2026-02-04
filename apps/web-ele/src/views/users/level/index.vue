<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/user/level';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElLoading, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getList, remove } from '#/api/user/level';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false,
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getList({
            page: page.currentPage,
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
      custom: true, // 启用自定义列功能，允许用户自定义显示/隐藏表格列
      export: false, // 禁用导出功能
      refresh: true, // 禁用刷新功能
      search: true, // 禁用搜索功能
      zoom: true, // 禁用缩放功能
    },
  } as VxeTableGridOptions<Api.Item>,
});

function onActionClick(e: OnActionClickParams<Api.Item>) {
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

function onEdit(row: Api.EditOrCreateParams) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: Api.Item) {
  // 1. 显示全局 loading（Element Plus 的加载遮罩）
  const loading = ElLoading.service({
    text: $t('ui.actionMessage.deleting', [row.name]),
    background: 'rgba(0, 0, 0, 0.7)', // 可选：半透明遮罩
    customClass: 'delete-loading', // 可选：自定义类名
  });

  remove(row.id)
    .then(() => {
      // 2. 关闭 loading
      loading.close();
      // 3. 显示成功消息
      ElMessage.success($t('ui.actionMessage.deleteSuccess', [row.name]));
      // 4. 刷新列表
      onRefresh();
    })
    .catch((error: unknown) => {
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
