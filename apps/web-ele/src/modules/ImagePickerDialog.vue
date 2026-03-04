<!-- ImagePickerDialog.vue -->
<script setup lang="ts">
import type { ComponentSize } from 'element-plus';

import type { Api } from '#/api/asset/asset';

import { computed, ref, watch } from 'vue';

import {
  ElButton,
  ElButtonGroup,
  ElDialog,
  ElEmpty,
  ElImage,
  ElMessage,
  ElPagination,
  ElRadioButton,
  ElRadioGroup,
} from 'element-plus';

import {
  assetTypeOptions,
  getList,
  objectTypeOptions,
  usageTypeOptions,
} from '#/api/asset/asset';

// ====================== Props & Emits ======================
const props = defineProps<{
  // 已选中的图片url（用于回显）
  defaultSelected?: string | string[];
  // 最大可选数量（多选模式有效）
  max?: number;
  modelValue: boolean;
  // 是否多选模式（覆盖 radio 选择）
  multiple?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm', urls: string | string[]): void;
}>();
const background = ref(false);
const disabled = ref(false);
const size = ref<ComponentSize>('default');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const form = ref({
  assetType: '',
  objectType: '',
  usageType: '',
});

// ====================== 状态 ======================
const visible = ref(false);
const selectMode = ref<'multiple' | 'single'>('single');
const selectedImages = ref<string[]>([]);
const imageList = ref<Api.Item[]>([]);
const loading = ref(false);
// ====================== 请求数据 ======================
const getData = async () => {
  try {
    // 设置加载状态
    loading.value = true;

    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      asset_type: form.value.assetType,
      object_type: form.value.objectType,
      usage_type: form.value.usageType,
    };

    const response = await getList(params);
    imageList.value = response.results;
    total.value = response.total;
  } catch (error) {
    console.error('获取图片列表失败:', error);
    ElMessage.error('获取图片列表失败');
  } finally {
    loading.value = false;
  }
};
// ====================== 计算属性 ======================
const isMultiple = computed(() => {
  return props.multiple ?? selectMode.value === 'multiple';
});

// ====================== 方法 ======================
const isSelected = (url: string) => {
  return selectedImages.value.includes(url);
};

const toggleSelect = (url: string) => {
  if (isMultiple.value) {
    // 多选模式
    const index = selectedImages.value.indexOf(url);
    if (index === -1) {
      // 未选中 → 选中
      if (props.max && selectedImages.value.length >= props.max) {
        ElMessage.warning(`最多只能选择 ${props.max} 张图片`);
        return;
      }
      selectedImages.value.push(url);
    } else {
      // 已选中 → 取消
      selectedImages.value.splice(index, 1);
    }
  } else {
    // 单选模式
    selectedImages.value = [url];
  }
};

const confirmSelect = () => {
  if (selectedImages.value.length === 0) {
    ElMessage.warning('请至少选择一张图片');
    return;
  }

  const result = isMultiple.value
    ? [...selectedImages.value]
    : selectedImages.value[0];

  // 添加类型保护，确保result不为undefined
  if (!result || (Array.isArray(result) && result.length === 0)) {
    ElMessage.warning('请选择有效的图片');
    return;
  }

  emit('confirm', result);
  visible.value = false;
};

const handleClose = () => {
  emit('update:modelValue', false);
};

// ====================== 监听 ======================
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      // 打开时初始化选中状态
      if (props.defaultSelected) {
        selectedImages.value = Array.isArray(props.defaultSelected)
          ? [...props.defaultSelected]
          : [props.defaultSelected];
      } else {
        selectedImages.value = [];
      }

      // 如果强制多选模式
      if (props.multiple) {
        selectMode.value = 'multiple';
      }
    }
  },
  { immediate: true },
);

// =========分页==============
const handleSizeChange = (val: number) => {
  pageSize.value = val;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// ====================== 暴露方法（供父组件调用） ======================
const open = (forms: {
  assetType: string;
  objectType: string;
  usageType: string;
}) => {
  form.value = forms;
  getData();
  emit('update:modelValue', true);
};

watch(
  () => ({
    assetType: form.value.assetType,
    objectType: form.value.objectType,
    usageType: form.value.usageType,
  }),
  () => {
    currentPage.value = 1; // 重置到第一页
    getData();
  },
  { deep: true },
);

defineExpose({
  open,
});
</script>

<template>
  <ElDialog
    v-model="visible"
    title="选择图片"
    width="980px"
    :close-on-click-modal="false"
    :append-to-body="true"
    @close="handleClose"
  >
    <div>
      <div class="flex items-center gap-2">
        <span class="font-medium text-red-500">资 源:</span>
        <ElButtonGroup class="flex flex-1 flex-wrap gap-2">
          <ElButton
            v-for="type in assetTypeOptions"
            :key="type.value"
            :type="form.assetType === type.value ? 'primary' : 'default'"
            size="small"
            @click="form.assetType = type.value"
            class="h-8 w-10"
            text
          >
            {{ type.label }}
          </ElButton>
        </ElButtonGroup>
      </div>

      <div class="flex items-center gap-2">
        <span class="font-medium text-red-500">对 象:</span>
        <ElButtonGroup class="flex flex-1 flex-wrap gap-2">
          <ElButton
            v-for="type in objectTypeOptions"
            :key="type.value"
            :type="form.objectType === type.value ? 'primary' : 'default'"
            size="small"
            @click="form.objectType = type.value"
            class="h-8 w-10"
            text
          >
            {{ type.label }}
          </ElButton>
        </ElButtonGroup>
      </div>

      <!-- 用途类型 -->
      <div class="flex items-center gap-2">
        <span class="font-medium text-red-500">用 途:</span>
        <ElButtonGroup class="flex flex-1 flex-wrap gap-2">
          <ElButton
            v-for="type in usageTypeOptions"
            :key="type.value"
            :type="form.usageType === type.value ? 'primary' : 'default'"
            size="small"
            @click="form.usageType = type.value"
            class="h-8 w-10"
            text
          >
            {{ type.label }}
          </ElButton>
        </ElButtonGroup>
      </div>
    </div>

    <div class="image-picker-container">
      <!-- 顶部操作栏 -->
      <div class="header">
        <ElRadioGroup v-model="selectMode" size="small">
          <ElRadioButton label="single">单选</ElRadioButton>
          <ElRadioButton label="multiple">多选</ElRadioButton>
        </ElRadioGroup>

        <div class="stats">
          已选 <span class="count">{{ selectedImages.length }}</span> 张
          <ElButton
            v-if="selectMode === 'multiple'"
            type="primary"
            size="small"
            :disabled="selectedImages.length === 0"
            @click="confirmSelect"
          >
            确定选择
          </ElButton>
        </div>
      </div>

      <!-- 图片列表 -->
      <div class="image-grid" v-loading="loading">
        <div
          v-for="img in imageList"
          :key="img.id"
          class="image-item"
          :class="{ selected: isSelected(img.id) }"
          @click="toggleSelect(img.id)"
        >
          <ElImage :src="img.file" fit="cover" lazy class="preview-img" />
        </div>

        <!-- 空状态 -->
        <ElEmpty v-if="imageList.length === 0" description="暂无图片" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton
          v-if="selectMode === 'single'"
          type="primary"
          :disabled="selectedImages.length === 0"
          @click="confirmSelect"
        >
          确定
        </ElButton>
      </div>
    </template>
    <div class="demo-pagination-block flex justify-end">
      <ElPagination
        class="mt-2"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30]"
        :size="size"
        :disabled="disabled"
        :background="background"
        layout="sizes, prev, pager, next"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </ElDialog>
</template>

<style scoped lang="scss">
.image-picker-container {
  padding: 0 8px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .stats {
    display: flex;
    gap: 16px;
    align-items: center;

    .count {
      font-weight: bold;
      color: var(--el-color-primary);
    }
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  max-height: 520px;
  padding: 4px;
  overflow-y: auto;

  .image-item {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary-light-5);

      .image-actions {
        opacity: 1;
      }
    }

    &.selected {
      border-color: var(--el-color-primary);
    }

    .preview-img {
      width: 100%;
      height: 100%;
    }

    .image-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;

      .preview-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: white;
        cursor: pointer;
        background: rgb(0 0 0 / 50%);
        border-radius: 4px;
        transition: background 0.2s;

        &:hover {
          background: rgb(0 0 0 / 70%);
        }
      }
    }

    .select-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(0 0 0 / 40%);

      .check-icon {
        font-size: 36px;
        color: white;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
