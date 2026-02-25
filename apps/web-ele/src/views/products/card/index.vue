<script setup lang="ts">
import { ref } from 'vue';

import { ElButton } from 'element-plus';

import ImagePickerDialog from '#/modules/ImagePickerDialog.vue';

const dialogVisible = ref(false);
const selectedImg = ref<string>('');
const selectedImgs = ref<string[]>([]);

// 模拟已有图片列表（实际应从接口获取）
const imageSource = ref([
  { url: 'https://example.com/img1.jpg' },
  { url: 'https://example.com/img2.jpg' },
  { url: 'https://example.com/img3.jpg' },
  // ... 更多
]);

const pickerRef = ref<InstanceType<typeof ImagePickerDialog>>();

function openSinglePicker() {
  pickerRef.value?.open(imageSource.value);
}

function openMultiPicker() {
  pickerRef.value?.open(imageSource.value);
}

function onConfirm(urls: string | string[]) {
  if (Array.isArray(urls)) {
    selectedImgs.value = urls;
    // console.warn('选择了多张：', urls);
  } else {
    selectedImg.value = urls;
    // console.warn('选择了单张：', urls);
  }
}
</script>

<template>
  <div>
    <ElButton type="primary" @click="openSinglePicker">
      选择主图（单选）
    </ElButton>
    <ElButton type="success" @click="openMultiPicker">
      选择详情图（多选，最多9张）
    </ElButton>

    <p>已选主图：{{ selectedImg }}</p>
    <p>已选详情图：{{ selectedImgs }}</p>
    <!-- 图片选择器 -->
    <!-- :multiple="false" 多选 -->
    <ImagePickerDialog
      ref="pickerRef"
      v-model="dialogVisible"
      :default-selected="selectedImg"
      @confirm="onConfirm"
      :max="9"
      :multiple="false"
    />
  </div>
</template>
