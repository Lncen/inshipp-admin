<!-- components/ProductCategoryTree.vue -->
<script setup lang="ts">
import type { Api } from '#/api/products/products';

import { ElTree } from 'element-plus';

interface Props {
  data: Api.MenuItem[];
  modelValue?: string; // 当前选中的分类 ID
}

interface Emits {
  (e: 'update:modelValue', id: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleNodeClick = (data: Api.MenuItem) => {
  emit('update:modelValue', data.id);
};
</script>

<template>
  <ElTree
    :data="data"
    node-key="id"
    :props="{ label: 'name', children: 'children' }"
    :current-node-key="modelValue"
    @node-click="handleNodeClick"
    class="border-0 bg-transparent"
    :default-expand-all="true"
    :expand-on-click-node="false"
  />
</template>

<style scoped>
:deep(.el-tree-node__content) {
  height: 36px;
  line-height: 36px;
}

:deep(.is-current > .el-tree-node__content) {
  color: #409eff;
  background-color: #2d3136;
}
</style>
