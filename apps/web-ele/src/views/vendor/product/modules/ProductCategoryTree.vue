<!-- components/ProductCategoryTree.vue -->
<script setup lang="ts">
import { ref } from 'vue';

import { ElLoading, ElScrollbar, ElTree } from 'element-plus';

interface Props {
  data: any;
  modelValue?: number; // 当前选中的分类 ID
  loading?: boolean;
  disabled?: boolean;
  treeProps?: {
    children?: string;
    label?: string;
  };
}

interface Emits {
  (e: 'update:modelValue', id: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 手动控制高亮节点（避免 ElTree 的 current-node-key 引发重渲染）
const highlightNode = ref<null | string>(null);

// 判断是否为叶子节点
const isLeafNode = (data: any) => {
  const childrenField = props.treeProps?.children || 'children';
  return !data[childrenField] || data[childrenField].length === 0;
};

const handleNodeClick = (data: any) => {
  // 只有叶子节点才能被选中
  if (isLeafNode(data)) {
    const id = data.id.toString();
    emit('update:modelValue', id);
    highlightNode.value = id; // 手动设置高亮
  }
};
</script>

<template>
  <div class="h-full">
    <ElScrollbar>
      <ElTree
        :data="props.data"
        node-key="id"
        :props="props.treeProps || { label: 'name', children: 'children' }"
        :default-expand-all="false"
        :expand-on-click-node="true"
        :loading="props.loading"
        :disabled="props.disabled"
        @node-click="handleNodeClick"
        class="border-0 bg-transparent"
      >
        <!-- 自定义节点内容 -->
        <template #default="{ data: nodeData }">
          <span class="tree-node-label">
            {{ nodeData.name }}
          </span>
        </template>
      </ElTree>
    </ElScrollbar>

    <!-- 加载状态覆盖层 -->
    <div v-if="props.loading" class="loading-overlay">
      <ElLoading lock />
    </div>
  </div>
</template>

<style scoped>
/* 关键：给容器一个固定高度，并允许内部滚动 */
.category-tree-container {
  width: 100%;
  height: 400px; /* 👈 你想要的固定高度，也可以是 100% */
  overflow: hidden; /* 防止外部滚动 */
}

.custom-tree {
  width: 100%;
  height: 100%;
  padding-right: 4px; /* 防止滚动条遮挡文字（可选） */

  /* 启用垂直滚动 */
  overflow-y: auto;
  background: transparent;
  border: none;
}

:deep(.el-tree-node__content) {
  height: 36px;
  line-height: 36px;
}

:deep(.is-current > .el-tree-node__content) {
  color: #409eff;
  background-color: #2d3136;
}

/* 为父节点添加视觉区分 */
:deep(.tree-node-parent .el-tree-node__label) {
  font-weight: bold;
  opacity: 0.7;
}

.scrollbar-demo-item {
  display: flex;
  flex-shrink: 0; /* 防止项目被压缩 */
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  color: var(--el-color-primary);
  text-align: center;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
}
</style>
