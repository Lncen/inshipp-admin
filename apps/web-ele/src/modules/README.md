# UploadModal 使用

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ElButton } from 'element-plus';
import type { Api } from '#/api/asset/asset';
import UploadModal from '#/modules/UploadModal.vue';

const uploadDialog = ref<InstanceType<typeof UploadModal>>();
const openUpload = () => {
  uploadDialog.value?.open({
    assetType: 'image',
    objectType: 'product',
    usageType: 'cover',
  });
};
const onUploadSuccess = (result: { data: Api.Item }) => {
  // getData();
  console.log('上传成功:', result);
  // 或者将新上传的文件添加到当前列表
  // images.value.unshift(result); // 添加到列表开头
};
</script>
<template>
  <ElButton @click="openUpload">上传文件</ElButton>
  <UploadModal ref="uploadDialog" @onUploadSuccess />
</template>
```

# 图片选择器

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { ElButton } from 'element-plus';

import ImagePickerDialog from '#/modules/ImagePickerDialog.vue';

const imageDialogVisible = ref(false);
const selectedImg = ref<string>('');
const selectedImgs = ref<string[]>([]);

const pickerRef = ref<InstanceType<typeof ImagePickerDialog>>();

const imageSource = ref({
  assetType: 'image',
  objectType: 'product',
  usageType: 'cover',
});

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  productId: {
    type: String,
    required: true,
  },
  categories: {
    // 接收多级分类数据

    default: () => [],
  },
});
function openSinglePicker() {
  pickerRef.value?.open(imageSource.value);
}

async function onConfirm(urls: string | string[]) {
  if (Array.isArray(urls)) {
    selectedImgs.value = urls;
    // console.log('选择了多张：', urls);
  } else {
    selectedImg.value = urls;
    // console.log('选择了单张：', urls, props.productId, formData);

    const data = {
      asset_id: urls,
      object_type: 'product',
      object_id: props.productId,
      usage_type: 'cover',
      sort_order: 1,
    };
    try {
      const respons = await createReference(data);
      formData.images = respons.url;
    } catch (error) {
      console.error('创建关联失败：', error);
    }
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
      v-model="imageDialogVisible"
      :default-selected="selectedImg"
      @confirm="onConfirm"
      :max="9"
      :multiple="false"
    />
  </div>
</template>
```
