<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/finance/wallet';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getList } from '#/api/finance/wallet';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import AdminMoneyDialog from './modules/AdminMoneyDialog.vue';
import Form from './modules/form.vue';

const username = ref<string>();
const centerDialogVisible = ref(false);
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
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getList({
            page: page.currentPage,
            pageSize: page.pageSize,
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
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'edit_balance': {
      onEdit_balance(e.row);
      break;
    }
  }
}

function onEdit(row: Api.Item) {
  formDrawerApi.setData(row).open();
}

function onEdit_balance(row: Api.Item) {
  centerDialogVisible.value = true;
  username.value = row.username;
}
function onRefresh() {
  gridApi.query();
}

// function onCreate() {
//   formDrawerApi.setData({}).open();
// }
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('finance.wallets.wallet')" />
    <AdminMoneyDialog
      v-model:visible="centerDialogVisible"
      :username="username"
      @success="onRefresh"
    />
  </Page>
</template>
