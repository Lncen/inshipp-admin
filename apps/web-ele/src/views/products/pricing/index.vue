<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/products/pricing';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElLoading, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDetail, getList, remove } from '#/api/products/pricing';
import { getUserLevelSelect } from '#/api/user/level';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const userLevel = ref<any>(null);
/** S
 * 编辑S
 * @param row
 */
async function onEdit(row: Api.Item) {
  if (!row.id) {
    ElMessage.error({
      message: $t('ui.actionMessage.editFailed', ['无效ID']),
      key: 'action_process_msg',
    });
    return;
  }

  try {
    // 1. 加载用户等级（如果尚未加载）
    if (!userLevel.value) {
      const levelRes = await getUserLevelSelect();
      // 可选：验证返回是否为有效数组
      if (!Array.isArray(levelRes) || levelRes.length === 0) {
        ElMessage.warning('未获取到用户等级数据，请稍后重试');
        return;
      }
      userLevel.value = levelRes;
    }

    // 2. 加载模板详情
    const template = await getDetail(row.id);
    if (!template) {
      ElMessage.error('未能加载模板详情');
      return;
    }

    // 3. 确保两者都存在，再打开弹窗
    formModalApi
      .setData({
        template,
        userLevels: userLevel.value,
      })
      .open();
  } catch (error) {
    console.error('加载编辑数据失败:', error);
    ElMessage.error('加载数据失败，请稍后重试');
  }
}

/**
 * 创建
 */
function onCreate() {
  formModalApi.setData(null).open();
}

/**
 * 删除
 * @param row
 */
function onDelete(row: Api.Item) {
  const loadingInstance = ElLoading.service({
    text: $t('ui.actionMessage.deleting', [row.id]),
    background: 'rgba(0, 0, 0, 0.8)',
  });

  if (row.id) {
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
  } else {
    ElMessage.error({
      message: $t('ui.actionMessage.deleteFailed', [row.id]),
      key: 'action_process_msg',
    });
  }
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
    <Grid table-title="价格模板">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ '价格模板' }}
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>
