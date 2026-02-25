<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElCol,
  ElDialog,
  ElDivider,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElRow,
  ElSwitch,
} from 'element-plus';

import { createReference } from '#/api/asset/asset';
import { getDetail, update } from '#/api/products/products';
import ImagePickerDialog from '#/modules/ImagePickerDialog.vue';

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  productId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue', 'saved']);

// 控制弹窗显示
const visible = ref(false);
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      fetchData();
    }
  },
);
watch(visible, (val) => {
  emit('update:modelValue', val);
});

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  images: [],
  price: '0.00000000',
  cost_price: '0.00000000',
  stock: -1,
  min_quantity: 1,
  max_quantity: 0,
  sort_weight: 0,
  is_active: true,
  refund_allowed: false,
  is_digital: false,
  description: '',
  ordering_notes: '',
  supplier_name: '',
  category_name: '',
  category_id: null,
  supplier_id: null,
  supplier_product_id: '',
  upstream_category_name: '',
  upstream_tags: '',
  sync_status: 'pending',
  last_sync_at: null,
  created_at: null,
  updated_at: null,
});

// 图片上传模拟（仅前端展示）
const imageFileList = ref<{ url: string }[]>([]);

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入售价', trigger: 'blur' },
    {
      validator: (
        _rule: any,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        const num = Number.parseFloat(value);
        if (Number.isNaN(num) || num < 0) {
          callback(new Error('价格必须 ≥ 0'));
        } else if (num < Number.parseFloat(formData.cost_price)) {
          callback(new Error('售价必须 ≥ 进货价'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  cost_price: [
    { required: true, message: '请输入进货价', trigger: 'blur' },
    {
      validator: (
        _rule: any,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        const num = Number.parseFloat(value);
        if (Number.isNaN(num) || num < 0) {
          callback(new Error('进货价必须 ≥ 0'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// 同步状态映射
const syncStatusMap = {
  pending: '待同步',
  success: '同步成功',
  failed: '同步失败',
};
const syncStatusType = (status: string) => {
  if (status === 'success') {
    return 'success';
  } else if (status === 'failed') {
    return 'danger';
  } else {
    return 'info';
  }
};

const syncStatusText = (status: string) =>
  syncStatusMap[status as keyof typeof syncStatusMap] || status;

// 获取数据
const loading = ref(false);
const fetchData = async () => {
  try {
    loading.value = true;
    // 假设 getList() 返回 { data: Product[] }，这里按 ID 过滤
    // 实际应替换为 getProduct(id) 接口
    const product = await getDetail(props.productId); // 你提供的接口
    if (!product) {
      ElMessage.error('商品未找到');
      visible.value = false;
      return;
    }

    // 赋值
    Object.assign(formData, product);

    // 初始化图片
    imageFileList.value = product.images.map((url: any) => ({ url }));
  } catch {
    ElMessage.error('加载商品失败');
    // console.error(error);
    visible.value = false;
  } finally {
    loading.value = false;
  }
};

// 提交
const formRef = ref();
const submitting = ref(false);
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitting.value = true;

    update(props.productId, formData);
    ElMessage.success('保存成功');
    emit('saved');
    visible.value = false;
  } catch {
    ElMessage.error('请检查表单');
  } finally {
    submitting.value = false;
    emit('update:modelValue', false);
  }
};

// 关闭时清理
const handleClose = () => {
  // 可选：重置表单
  // Object.assign(formData, initialData)
};

// ============== 图片选择器 =============
const imageDialogVisible = ref(false);
const selectedImg = ref<string>('');
const selectedImgs = ref<string[]>([]);

const pickerRef = ref<InstanceType<typeof ImagePickerDialog>>();

const imageSource = ref({
  assetType: 'image',
  objectType: 'product',
  usageType: 'cover',
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
const formatImageUrl = (url: string): string => {
  if (!url) return '';

  // 替换为你的实际API基础URL
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};
</script>

<template>
  <ElDialog
    v-model="visible"
    title="编辑商品详情"
    width="800px"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="auto"
      size="default"
      scroll-to-error
    >
      <ElRow :gutter="24">
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="商品名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入商品名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="本地分类">
            <ElInput v-model="formData.category_name" readonly />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="24">
        <ElFormItem label="商品图片">
          <!-- 图片列表 -->
          <div class="image-grid" v-loading="loading">
            <div v-for="img in formData.images" :key="img" class="image-item">
              <ElImage
                :src="formatImageUrl(img)"
                fit="cover"
                lazy
                class="preview-img"
              />
            </div>

            <!-- 空状态 -->
            <ElEmpty
              v-if="formData.images.length === 0"
              description="暂无图片"
            />
          </div>
        </ElFormItem>

        <ElFormItem label=" ">
          <ElButton type="primary" @click="openSinglePicker">
            选择主图（单选）
          </ElButton>
        </ElFormItem>
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="售价" prop="price">
            <ElInputNumber
              v-model="formData.price"
              :min="0"
              :precision="8"
              :step="0.01"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>

          <ElFormItem label="进货价" prop="cost_price">
            <ElInputNumber
              v-model="formData.cost_price"
              :min="0"
              :precision="8"
              :step="0.01"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
          <ElFormItem label="库存">
            <ElInputNumber
              v-model="formData.stock"
              :min="-1"
              :max="999999"
              controls-position="right"
              style="width: 100%"
            />
            <div class="text-sm text-gray-500">-1 表示无限库存</div>
          </ElFormItem>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="最小购买量">
            <ElInputNumber
              v-model="formData.min_quantity"
              :min="1"
              :max="999"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>

          <ElFormItem label="最大购买量">
            <ElInputNumber
              v-model="formData.max_quantity"
              :min="0"
              :max="9999"
              controls-position="right"
              style="width: 100%"
            />
            <div class="text-sm text-gray-500">0 表示不限制</div>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 开关类字段（上架状态、退单等） -->
      <ElRow :gutter="24">
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="上架状态">
            <ElSwitch v-model="formData.is_active" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="允许退单">
            <ElSwitch v-model="formData.refund_allowed" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="数字商品">
            <ElSwitch v-model="formData.is_digital" />
          </ElFormItem>
        </ElCol>

        <!-- 排序权重（单独一行） -->
        <ElFormItem label="排序权重">
          <ElInputNumber
            v-model="formData.sort_weight"
            :min="-9999"
            :max="9999"
            controls-position="right"
            style="width: 100%"
          />
        </ElFormItem>
      </ElRow>
      <!-- 描述类字段 -->
      <ElFormItem label="商品详情">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入商品详情"
        />
      </ElFormItem>

      <ElFormItem label="下单说明">
        <ElInput
          v-model="formData.ordering_notes"
          type="textarea"
          :rows="2"
          placeholder="请输入下单说明"
        />
      </ElFormItem>

      <!-- 只读信息 -->
      <ElDivider content-position="left">只读信息</ElDivider>
      <ElRow :gutter="24">
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="供应商">
            <ElInput v-model="formData.supplier_name" readonly />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="上游商品ID">
            <ElInput v-model="formData.supplier_product_id" readonly />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="上游分类">
            <ElInput v-model="formData.upstream_category_name" readonly />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="12">
          <ElFormItem label="同步状态">
            <el-tag :type="syncStatusType(formData.sync_status)">
              {{ syncStatusText(formData.sync_status) }}
            </el-tag>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="submitting">
        保存
      </ElButton>
    </template>
  </ElDialog>

  <ImagePickerDialog
    ref="pickerRef"
    v-model="imageDialogVisible"
    :default-selected="selectedImg"
    @confirm="onConfirm"
    :max="9"
    :multiple="false"
  />
</template>
<style scoped>
.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 24px;
  color: #888;
}

.preview-img {
  width: 200px;
  aspect-ratio: 4/3; /* 保持比例 */
}
</style>
