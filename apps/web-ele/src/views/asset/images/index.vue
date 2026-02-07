<script setup lang="ts">
import type { ComponentSize } from 'element-plus';

import type { Api } from '#/api/asset/asset';

import { onMounted, reactive, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import {
  ElButton,
  ElCard,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElRadioButton,
  ElRadioGroup,
} from 'element-plus';

import { getList, remove, updateAssetSecurityStatus } from '#/api/asset/asset';
import UploadModal from '#/modules/UploadModal.vue';

const loading = ref(false);
const uploadDialog = ref<InstanceType<typeof UploadModal>>();
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref<ComponentSize>('default');
const total = ref(0);
const background = ref(false);
const disabled = ref(false);
// 模拟数据（替换为你的 API 调用）
const images = ref<Api.Item[]>([]);

const getData = async () => {
  try {
    // 设置加载状态
    loading.value = true;

    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      asset_type: form.assetType,
      object_type: form.objectType,
      usage_type: form.usageType,
    };

    const response = await getList(params);
    images.value = response.results;
    total.value = response.total;
  } catch (error) {
    console.error('获取图片列表失败:', error);
    ElMessage.error('获取图片列表失败');
  } finally {
    loading.value = false;
  }
};

// =========分页==============
const handleSizeChange = (val: number) => {
  pageSize.value = val;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const form = reactive({
  assetType: 'image',
  objectType: 'product',
  usageType: 'cover',
});

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
const openUpload = () => {
  uploadDialog.value?.open(form);
};

const onUploadSuccess = (result: Api.Item) => {
  // getData();

  // 或者将新上传的文件添加到当前列表
  images.value.unshift(result); // 添加到列表开头
};

// ============相册===========

// 控制悬停显示
const hoveredId = ref<null | string>(null);

const showOverlay = (id: string) => {
  hoveredId.value = id;
};

const hideOverlay = () => {
  hoveredId.value = null;
};

// 删除处理
const handleDelete = async (image: Api.Item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${image.filename}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    // 调用删除 API
    await remove(image.id);

    // 本地移除
    images.value = images.value.filter((img) => img.id !== image.id);
    ElMessage.success('删除成功');
  } catch (error) {
    // 用户取消操作时会进入这里，不做任何处理
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 审核状态
const handleStatusChange = async (ids: string, newStatus: string) => {
  try {
    await updateAssetSecurityStatus({ id: ids, security_status: newStatus });
    ElMessage.success('更新成功');
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error('更新失败');
  } finally {
    // 刷新列表
    getData();
  }
};

// 工具函数：格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// 工具函数：格式化日期
const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString('zh-CN');
};

watch(
  () => ({
    assetType: form.assetType,
    objectType: form.objectType,
    usageType: form.usageType,
  }),
  () => {
    currentPage.value = 1; // 重置到第一页
    getData();
  },
  { deep: true },
);

onMounted(() => {
  getData();
});
</script>

<template>
  <Page auto-content-height>
    <UploadModal ref="uploadDialog" @success="onUploadSuccess" />
    <ElCard class="mb-3">
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
    </ElCard>

    <ElCard>
      <ElButton @click="openUpload" class="mb-2">上传文件</ElButton>

      <div class="album-container">
        <!-- 图片网格 -->
        <div class="album-grid">
          <div
            v-for="image in images"
            :key="image.id"
            class="album-item"
            @mouseenter="showOverlay(image.id)"
            @mouseleave="hideOverlay()"
          >
            <!-- 图片 -->
            <img
              :src="image.file"
              :alt="image.filename"
              class="album-image"
              loading="lazy"
            />

            <!-- 悬停覆盖层 -->
            <div v-if="hoveredId === image.id" class="overlay">
              <!-- 删除按钮（右上角） -->

              <ElButton class="del-btn" @click="handleDelete(image)" link>
                <IconifyIcon icon="ci:trash-full" width="20" height="20" />
              </ElButton>

              <ElButton class="edit-btn" link>
                <IconifyIcon icon="ci:note-edit" width="20" height="20" />
              </ElButton>

              <!-- 基本信息（左下角） -->
              <div class="info-panel">
                <div class="mb-2">
                  <ElRadioGroup
                    v-model="image.security_status"
                    size="small"
                    @change="
                      (value) => handleStatusChange(image.id, value as string)
                    "
                  >
                    <ElRadioButton label="待审核" value="pending" />
                    <ElRadioButton label="审核通过" value="approved" />
                    <ElRadioButton label="审核拒绝" value="rejected" />
                  </ElRadioGroup>
                </div>

                <div class="info-line">
                  <strong>文件名:</strong> {{ image.filename }}
                </div>
                <div class="info-line">
                  <strong>尺寸:</strong> {{ image.width }} ×
                  {{ image.height }}
                </div>
                <div class="info-line">
                  <strong>大小:</strong> {{ formatFileSize(image.size) }}
                </div>
                <div class="info-line">
                  <strong>上传时间:</strong>
                  {{ formatDate(image.created_at) }}
                </div>
                <div class="info-line">
                  <strong>引用数:</strong>
                  {{ image.ref_count }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <ElEmpty v-if="images.length === 0" description="暂无图片" />
      </div>
    </ElCard>
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
  </Page>
</template>

<style scoped>
.album-container {
  padding: 0;
}

.album-container h2 {
  margin-bottom: 2px;
  font-size: 24px;
  color: #333;
}

/* 网格布局 */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.album-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  transition: transform 0.2s;
}

.album-item:hover {
  box-shadow: 0 4px 16px rgb(0 0 0 / 15%);
  transform: translateY(-2px);
}

.album-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4/3; /* 保持比例 */
  object-fit: cover;
}

/* 悬停覆盖层 */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  color: white;
  background: rgb(0 0 0 / 60%);
}

/* 删除按钮 */
.del-btn {
  position: absolute;
  right: 8px;
}

.edit-btn {
  position: absolute;
  right: 40px;
}

/* 信息面板 */
.info-panel {
  position: absolute;
  bottom: 8px;
  width: 98%;
  padding: 8px;
  font-size: 12px;
  line-height: 1.4;
  background: rgb(0 0 0 / 40%);
  border-radius: 4px;
}

.info-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
