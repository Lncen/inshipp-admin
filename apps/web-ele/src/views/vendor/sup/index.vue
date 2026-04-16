<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/vendor/vendor';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getList } from '#/api/vendor/vendor';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import ExtraModal from './modules/form.vue';

const router = useRouter();

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
          const re = await getList({
            page: page.currentPage,
            page_size: page.pageSize,
            ...formValues,
          });
          return re;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: true, // 启用自定义列功能，允许用户自定义显示/隐藏表格列
      export: true, // 禁用导出功能
      refresh: true, // 禁用刷新功能
      search: true, // 禁用搜索功能
      zoom: true, // 禁用缩放功能
    },
  } as VxeTableGridOptions<Api.Item>,
});

function onActionClick(e: OnActionClickParams<Api.Item>) {
  switch (e.code) {
    case 'delete': {
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    // 供应商产品页面
    case 'product': {
      router.push({
        name: 'vendorProduct',
        query: { vendor_id: e.row.id },
      });
      break;
    }
  }
}

function onEdit(row: Api.Item) {
  modalApi.setData({ id: row.id, code: 'edit' }).open();
}

async function onCreate() {
  modalApi.setData({ id: null, code: 'create' }).open();
}

function onRefresh() {
  gridApi.query();
}

// --- 弹窗 --
const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,

  onOpenChange: (isOpen) => {
    if (!isOpen) {
      setTimeout(() => {
        gridApi.query();
      }, 300); // 延迟300ms执行
    }
  },
});
</script>
<template>
  <Page auto-content-height>
    <Grid table-title="供应商">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          {{ $t('ui.actionTitle.create', ['供应商']) }}
        </ElButton>
      </template>
    </Grid>

    <Modal @success="onRefresh" />
  </Page>
</template>
