<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/products/products';

import { onMounted, reactive, ref, watch } from 'vue';

import { ColPage } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElLoading, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCategories, getList, remove } from '#/api/products/products';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import ProductCategoryTree from './modules/ProductCategoryTree.vue';
import ProductEditDialog from './modules/ProductEditDialog.vue';

// 弹窗
const showEdit = ref(false);
const productId = ref<string>();
const categoriesDate = ref<Api.MenuItem[]>([]);
// 当前选中的分类 ID
const selectedCategoryId = ref<string>('');
const selectedCategoryPath = ref<string>('');
// 修改类型定义，应该是商品数组而不是 ListResponse
const isLoading = ref(false);

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

    pagerConfig: {
      pageSize: 10, // 设置默认每页显示10条
    },

    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          // 在查询参数中加入分类 ID
          const params = {
            page: page.currentPage,
            page_size: page.pageSize,
            ...(selectedCategoryId.value
              ? { category: selectedCategoryId.value }
              : {}),
            ...formValues,
          };
          selectedCategoryId.value = '';
          return await getList(params);
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

function onDelete(row: Api.ProductItem) {
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
    .catch((error) => {
      // 5. 删除失败：关闭 loading + 提示错误
      loading.close();
      // ElMessage.error($t('ui.actionMessage.deleteFailed', [row.name]));
      console.error('Delete role failed:', error);
    });
}

async function onEdit(row: Api.ProductItem) {
  productId.value = row.id;
  showEdit.value = true;
}
async function onCreate() {}

function onActionClick(e: OnActionClickParams<Api.ProductItem>) {
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

// 获取分类数据
const fetchCategories = async () => {
  isLoading.value = true;
  try {
    const response = await getCategories();
    categoriesDate.value = response; // 根据API响应结构调整
  } catch (error) {
    console.error('获取分类数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 监听分类变化，变化时重新查询数据
watch(
  () => selectedCategoryId.value, // 明确指定监听的依赖
  async (newVal) => {
    // console.log(`选中分类从 "${selectedCategoryId.value}" 变更为 "${newVal}"`);

    const findCategory = (
      items: Api.MenuItem[],
      id: string,
    ): Api.MenuItem | undefined => {
      for (const item of items) {
        if (String(item.id) === String(id)) {
          return item;
        }
        if (item.children) {
          const found = findCategory(item.children, id);
          if (found) return found;
        }
      }
      return undefined;
    };

    const selectedCategory = findCategory(categoriesDate.value, newVal);
    if (selectedCategory) {
      selectedCategoryPath.value =
        selectedCategory.path || selectedCategory.name;

      // 分类变化时重新查询数据
      gridApi.query();
    } else {
      // console.log('未找到选中的分类');
    }
  },
  { immediate: false }, // 避免立即执行
);

// 刷新
function onRefresh() {
  gridApi.query();
}

// 组件挂载时获取分类数据
onMounted(() => {
  fetchCategories();
});

const props = reactive({
  leftCollapsedWidth: 2,
  leftCollapsible: false,
  leftMaxWidth: 20,
  leftMinWidth: 10,
  leftWidth: 12,
  resizable: true,
  rightWidth: 70,
  splitHandle: false,
  splitLine: false,
});
</script>

<template>
  <ColPage v-bind="props" auto-content-height>
    <template #left="{ isCollapsed }">
      <div
        v-if="!isCollapsed"
        class="border-border bg-card mr-2 rounded-[var(--radius)] border p-2"
      >
        <h3 class="mb-3 font-bold">商品分类</h3>
        <ProductCategoryTree
          :data="categoriesDate"
          v-model="selectedCategoryId"
        />
      </div>
    </template>
    <div class="flex h-full flex-col">
      <Grid :table-title="selectedCategoryPath">
        <template #toolbar-tools>
          <ElButton type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', [$t('products.product')]) }}
          </ElButton>
        </template>
      </Grid>
    </div>
    <!-- 右侧：产品列表 -->
  </ColPage>

  <ProductEditDialog
    v-model="showEdit"
    :product-id="productId || ''"
    @saved="onRefresh"
  />
</template>
