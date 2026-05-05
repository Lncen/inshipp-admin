<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/vendor/vendor_product';

import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ColPage, useVbenModal } from '@vben/common-ui';

import { refAutoReset } from '@vueuse/core';
import { ElButton, ElMessage } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getTemplateSelect } from '#/api/products/pricing';
import { getCategories } from '#/api/products/products';
import { getCategory, getProducts } from '#/api/vendor/vendor_product';

import { useColumns } from './data';
import Form from './modules/form.vue';
import ProductCategoryTree from './modules/ProductCategoryTree.vue';
// import { create, statusOptions, update } from '#/api/products/pricing';

const selectVendorId = ref<any>();
const categoriesDate = ref<Api.Item[]>([]);
// 当前选中的分类 ID
const selectedCategoryId = ref<number>();
const selectedCategoryPath = ref<string>('');
// 修改类型定义，应该是商品数组而不是 ListResponse
const isLoading = refAutoReset(false, 30_000);

// 选中的表格行
const selectedRows = ref<Api.Item[]>([]);

// ------------编辑模态框-----------------
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false,
  // 修改 gridEvents 部分
  gridEvents: {
    // 单选框/复选框变化时触发
    checkboxChange({ records }: any) {
      selectedRows.value = records;
    },
    // 全选/全不选时触发
    checkboxAll({ records }: any) {
      selectedRows.value = records;
    },
  },

  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,

    proxyConfig: {
      ajax: {
        query: async () => {
          if (selectedCategoryId.value) {
            return await fetchProduct();
          }
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

async function onEdit() {
  formModalApi.open();
}

function onActionClick(e: OnActionClickParams<Api.Item>) {
  switch (e.code) {
    case 'delete': {
      // onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit();
      break;
    }
  }
}

// 获取分类数据
async function fetchCategories() {
  isLoading.value = true;
  try {
    if (selectVendorId.value) {
      const response = await getCategory({
        vendor_id: selectVendorId.value,
      });
      categoriesDate.value = response;
    } else {
      ElMessage.error('请选择供应商');
    }
  } catch (error) {
    console.error('获取分类数据失败:', error);
  } finally {
    isLoading.value = false;
  }
}

async function fetchProduct() {
  isLoading.value = true;
  try {
    if (selectVendorId.value) {
      const results: any = await getProducts({
        category_id: selectedCategoryId.value,
        vendor_id: selectVendorId.value,
      });
      return {
        results,
        total: results.length,
      };
    } else {
      ElMessage.error('请选择供应商');
    }
  } catch (error) {
    console.error('获取商品数据失败:', error);
    return {
      results: [],
      total: 0,
    };
  } finally {
    isLoading.value = false;
  }
}

const categoriesSelect = ref<any>(null);
const templateSelect = ref<any>(null);
async function onSync() {
  const selectedIds = selectedRows.value.map((row) => row.id);
  const parmet = {
    vendor_id: selectVendorId.value,
    product_ids: selectedIds,
  };
  if (categoriesSelect.value) {
    categoriesSelect.value = await getCategories(); // 分类
    templateSelect.value = await getTemplateSelect(); // 模板
  }

  formModalApi.setData({ categoriesSelect, templateSelect, ...parmet }).open();
  // console.log('要同步的参数:', parmet);
}

// 组件挂载时获取分类数据
onMounted(() => {
  try {
    const route = useRoute();
    selectVendorId.value = route.query.vendor_id;
    fetchCategories();
  } catch (error) {
    console.error('获取分类数据失败:', error);
  }
});

// 监听分类变化，变化时重新查询数据
watch(
  () => selectedCategoryId.value, // 明确指定监听的依赖
  async (newVal) => {
    // 检查 newVal 是否为 undefined，如果是则直接返回
    if (!newVal) {
      selectedCategoryPath.value = '';
      return;
    }

    const findCategory = (
      items: Api.Item[],
      id: number,
    ): Api.Item | undefined => {
      for (const item of items) {
        if (String(item.id) === String(id)) {
          return item;
        }
        if (item.parent_infos) {
          const found = findCategory(item.parent_infos, id);
          if (found) return found;
        }
      }
      return undefined;
    };

    const selectedCategory = findCategory(categoriesDate.value, newVal);
    if (selectedCategory) {
      selectedCategoryPath.value = selectedCategory.name;
      selectedCategoryId.value = selectedCategory.id;
      gridApi.query();
    } else {
      console.warn('未找到选中的分类');
      selectedCategoryPath.value = '';
    }
  },
  { immediate: false }, // 避免立即执行
);

const page_props = reactive({
  leftCollapsedWidth: 2,
  leftCollapsible: false,
  leftMaxWidth: 20,
  leftMinWidth: 20,
  leftWidth: 12,
  resizable: true,
  rightWidth: 70,
  splitHandle: false,
  splitLine: false,
});
</script>

<template>
  <ColPage v-bind="page_props" auto-content-height v-loading="isLoading">
    <template #left="{ isCollapsed }">
      <div v-if="!isCollapsed" class="bg-card mr-2 flex h-full flex-col">
        <!-- <h3 class="mb-3 font-bold">商品分类</h3> -->
        <ProductCategoryTree
          :data="categoriesDate"
          v-model="selectedCategoryId"
          :tree-props="{ label: 'name', children: 'parent_infos' }"
        />
      </div>
    </template>
    <div class="flex h-full flex-col">
      <Grid :table-title="selectedCategoryPath">
        <template #toolbar-tools>
          <ElButton type="primary" @click="onSync">
            {{ '同步商品' }}
          </ElButton>
        </template>
      </Grid>
    </div>
    <FormModal />
  </ColPage>
</template>

<style scoped>
.sidebar {
  height: 86vh; /* 或固定高度，如 600px */
}
</style>
