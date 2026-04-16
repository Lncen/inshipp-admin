<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/tasks/periodic_task';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { ElButton, ElLoading, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getDetail,
  getList,
  getTaskConfig,
  remove,
} from '#/api/tasks/periodic_task';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/**
 * 编辑部门
 * @param row
 */
const taskConfig = ref(null);
async function onEdit(row: Api.Item) {
  const rowData = await getDetail(row.id);
  if (!taskConfig.value) {
    taskConfig.value = await getTaskConfig();
  }

  formModalApi.setData({ rowData, taskConfig: taskConfig.value }).open();
}

/**
 * 创建新部门
 */
async function onCreate() {
  if (!taskConfig.value) {
    taskConfig.value = await getTaskConfig();
  }
  formModalApi.setData(taskConfig.value).open();
}

/**
 * 删除部门
 * @param row
 */
function onDelete(row: Api.Item) {
  const loadingInstance = ElLoading.service({
    text: $t('ui.actionMessage.deleting', [row.id]),
    background: 'rgba(0, 0, 0, 0.8)',
  });

  remove(row.id)
    .then(() => {
      ElMessage.success({
        message: $t('ui.actionMessage.deleteSuccess', [row.id]),
        key: 'action_process_msg',
      });
      refreshGrid();
    })
    .finally(() => {
      // 无论成功还是失败都关闭 loading
      loadingInstance.close();
    })
    .catch((error) => {
      // 可以在这里添加错误处理
      console.error('Delete failed:', error);
    });
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({ code, row }: OnActionClickParams<Api.Item>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
      pageSize: 10, // 设置默认每页显示10条
    },
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
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      transform: false,
    },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid table-title="任务表">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          {{ '新建任务' }}
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
