<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/finance/log';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getList } from '#/api/finance/log';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['timestamp', ['created_at_min', 'created_at_max']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
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
    case 'detail': {
      onEdit(e.row);
      break;
    }
  }
}

function onEdit(row: Api.Item) {
  // formDrawerApi.setData(row).open();
  router.replace({
    path: '/finance/wallet/user/',
    query: { username: row.username },
  });
}

function onRefresh() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('finance.wallets.wallet')" />
  </Page>
</template>
