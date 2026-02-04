<!-- src/components/AssetUploadDialog.vue -->
<script lang="ts" setup>
import type { Api } from '#/api/asset/asset';

import { nextTick, reactive, ref } from 'vue';

import {
  ElButton,
  ElButtonGroup,
  ElDialog,
  ElMessage,
  ElUpload,
} from 'element-plus';

import { upload } from '#/api/asset/asset';

// const props = defineProps<{}>();

const emit = defineEmits<{
  (e: 'success', result: Api.Item): void;
}>();
const uploadResults = ref<any[]>([]);
// 类型定义
interface AssetUploadOptions {
  assetType?: string;
  objectType?: string;
  usageType?: string;
}

// ====== Options ======
const assetTypeOptions = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'file', label: '文件' },
  { value: 'other', label: '其他' },
];

const objectTypeOptions = [
  { value: 'product', label: '产品' },
  { value: 'content', label: '内容' },
  { value: 'user', label: '用户' },
];

const usageTypeOptions = [
  { value: 'avatar', label: '头像' },
  { value: 'cover', label: '主图' },
  { value: 'gallery', label: '相册图' },
  { value: 'detail', label: '详情图' },
  { value: 'banner', label: '广告图' },
  { value: 'attachment', label: '附件' },
  { value: 'other', label: '其他' },
];

// ====== State ======
const visible = ref(false);
const form = reactive({
  assetType: '',
  objectType: '',
  usageType: '',
});
const uploadFiles = ref<File[]>([]);
const uploadRef = ref<any>(null);

// 重置表单
const resetForm = () => {
  uploadFiles.value = [];
  uploadResults.value = [];
  form.assetType = '';
  form.objectType = '';
  form.usageType = '';
};

// ====== Methods ======
const open = async (options: AssetUploadOptions = {}) => {
  // 确保在 DOM 更新后清空文件列表
  await nextTick();
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
  resetForm();
  Object.assign(form, options);
  visible.value = true;
};

const handleClose = async () => {
  visible.value = false;
  resetForm();
  await nextTick();
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 获取支持格式文本
const getSupportedFormats = () => {
  const { assetType } = form;
  if (assetType === 'image') return 'image/*';
  if (assetType === 'video') return 'video/*';
  if (assetType === 'audio') return 'audio/*';
  if (assetType === 'file') return '.pdf,.doc,.docx,.txt,.zip,.rar';
  return '*';
};

// 文件变更处理
const handleChange = (file: any, fileList: any[]) => {
  uploadFiles.value = fileList.map((item: any) => item.raw);
};

// 移除文件
const handleRemove = (file: any, fileList: any[]) => {
  uploadFiles.value = fileList.map((item: any) => item.raw);
};

// 上传前校验
// 上传前校验（也可在这里限制数量）
const beforeUpload = (rawFile: File) => {
  if (uploadFiles.value.length >= 10) {
    ElMessage.warning(`最多只能上传 ${10} 个文件`);
    return false;
  }

  const { assetType } = form;

  // 类型校验（同之前）
  switch (assetType) {
    case 'audio': {
      if (!rawFile.type.startsWith('audio/')) {
        ElMessage.error('请上传音频文件(MP3、WAV 等）！');
        return false;
      }
      break;
    }
    case 'image': {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowed.includes(rawFile.type)) {
        ElMessage.error('请上传 JPG/PNG/GIF/WebP 格式的图片！');
        return false;
      }
      break;
    }
    case 'video': {
      if (!rawFile.type.startsWith('video/')) {
        ElMessage.error('请上传视频文件(MP4、MOV 等）！');
        return false;
      }
      break;
    }
  }

  // 大小限制（注意：avatar 用途只对单个文件生效）
  let maxSize = 10; // MB
  if (assetType === 'image' && form.usageType === 'avatar') {
    maxSize = 2;
  }
  if (rawFile.size / 1024 / 1024 > maxSize) {
    ElMessage.error(`文件大小不能超过 ${maxSize}MB!`);
    return false;
  }

  return true;
};

// 手动上传（逐个上传）
const startUpload = async () => {
  if (uploadFiles.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }

  // 可选：禁用按钮防止重复点击
  const uploadButton = document.activeElement as HTMLElement;
  uploadButton?.setAttribute('disabled', 'true');

  let successCount = 0;
  let failureCount = 0;

  // ✅ 核心：每个文件独立 try...catch
  for (const file of uploadFiles.value) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('asset_type', form.assetType);
      formData.append('object_type', form.objectType);
      formData.append('usage_type', form.usageType);

      const response = await upload(formData);
      emit('success', response);
      successCount++;
    } catch (error: any) {
      failureCount++;
      uploadResults.value.push({
        filename: file.name,
        status: 'failed',
        error: error?.error || '上传失败',
        timestamp: new Date().toLocaleString(),
      });
    }
  }

  // ✅ 最终提示
  if (failureCount === 0) {
    ElMessage.success(`全部 ${successCount} 个文件上传成功！`);
    // 清理
    visible.value = false;
    resetForm();
  } else if (successCount > 0) {
    ElMessage.warning(
      `${successCount} 个成功，${failureCount} 个失败（详见上方提示）`,
    );
  } else {
    ElMessage.error('所有文件上传失败');
  }

  // 清理
  // visible.value = false;
  // resetForm();

  // ✅ 恢复按钮
  uploadButton?.removeAttribute('disabled');
};
// 暴露方法
defineExpose({
  open,
});
</script>

<template>
  <ElDialog
    v-model="visible"
    title="文件上传"
    width="700px"
    @close="handleClose"
  >
    <div class="flex items-center gap-2">
      <!-- 标题 "资源:" 改为蓝色 -->
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

    <!-- 上传区域 -->
    <div class="mb-6">
      <ElUpload
        ref="uploadRef"
        :auto-upload="false"
        :show-file-list="true"
        :before-upload="beforeUpload"
        :on-change="handleChange"
        :on-remove="handleRemove"
        multiple
        drag
        :accept="getSupportedFormats()"
        :disabled="!form.assetType || !form.objectType || !form.usageType"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">请在此提交文件或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">大小小于 5mb 的 jpg/png 文件</div>
          <label class="mb-2 block text-sm font-medium">文件列表 *</label>

          <!-- 上传结果展示区域 -->
          <div v-if="uploadResults.length > 0">
            <h4 class="mb-2 font-medium">上传结果：</h4>
            <div>
              <div
                v-for="(result, index) in uploadResults"
                :key="index"
                class="bg-transparent-gray mb-1 rounded p-2 text-sm text-red-700"
              >
                <div class="flex justify-between">
                  <span>{{ result.filename }}</span>
                  <span class="text-xs">{{ result.timestamp }}</span>
                </div>
                <div v-if="result.status === 'success'">
                  <a
                    :href="result.url"
                    target="_blank"
                    class="text-blue-500 hover:underline"
                    >查看文件
                  </a>
                </div>
                <div v-else class="text-red-500">错误: {{ result.error }}</div>
              </div>
            </div>
          </div>
        </template>
      </ElUpload>
    </div>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton
        type="primary"
        @click="startUpload"
        :disabled="uploadFiles.length === 0"
      >
        开始上传
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.block {
  display: block;
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 8px;
}

.upload-area {
  padding: 32px;
  color: #999;
  text-align: center;
  cursor: pointer;
  background-color: #f9f9f9;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: var(--el-color-primary);
}

.upload-area .el-icon {
  margin-bottom: 8px;
  font-size: 24px;
}

.upload-area p {
  margin: 0;
  font-size: 14px;
}

.bg-transparent-gray {
  background-color: rgb(57 35 35 / 70%); /* 更淡的灰色 */
}
</style>

<style>
.el-button--small {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
}

.el-upload__tip {
  color: red;
}
</style>
