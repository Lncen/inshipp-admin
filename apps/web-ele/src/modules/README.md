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
