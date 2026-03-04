<script setup lang="ts">
import { nextTick, onUnmounted, reactive, ref, watch } from 'vue';

import {
  ElButton,
  ElCascader,
  ElCol,
  ElDialog,
  ElDivider,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElImage,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElRow,
  ElSwitch,
  ElTag,
} from 'element-plus';

import { createReference } from '#/api/asset/asset';
import { getDetail, update } from '#/api/products/products';
import ImagePickerDialog from '#/modules/ImagePickerDialog.vue';
import { formatImageUrl } from '#/utils/formatImageUrl';

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

const emit = defineEmits(['update:modelValue', 'saved']);

// 控制弹窗显示
const visible = ref(false);

// 监听器清理函数存储
let stopWatchModelValue: (() => void) | null = null;
let stopWatchVisible: (() => void) | null = null;

// 组件卸载时清理
onUnmounted(() => {
  if (stopWatchModelValue) stopWatchModelValue();
  if (stopWatchVisible) stopWatchVisible();
  // 确保弹窗关闭
  visible.value = false;
});

// 使用 nextTick 确保 DOM 更新后再执行
stopWatchModelValue = watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val) {
      await nextTick();
      fetchData();
    } else {
      // 确保弹窗真正关闭后再执行清理
      setTimeout(() => {
        handleClose();
      }, 300);
    }
  },
);

stopWatchVisible = watch(visible, (val) => {
  emit('update:modelValue', val);
});

// 表单数据 - 使用初始状态以便重置
const initialFormData = {
  id: null,
  name: '',
  images: [] as string[],
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
  category_id: undefined,
  supplier_id: null,
  supplier_product_id: '',
  upstream_category_name: '',
  upstream_tags: '',
  sync_status: 'pending',
  last_sync_at: null,
  created_at: null,
  updated_at: null,
};

const formData = reactive({ ...initialFormData });

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

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true, // 可选择任意一级选项
  emitPath: false, // 只返回最终选择项的值
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

    const product = await getDetail(props.productId);
    if (!product) {
      ElMessage.error('商品未找到');
      visible.value = false;
      return;
    }

    // 赋值
    Object.assign(formData, product);

    // 初始化图片
    imageFileList.value = product.images?.map((url: any) => ({ url })) || [];
  } catch (error) {
    console.error('加载商品失败:', error);
    ElMessage.error('加载商品失败');
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

    await update(props.productId, formData);
    ElMessage.success('保存成功');
    emit('saved');
    visible.value = false;
  } catch (error) {
    console.error('表单验证或提交失败:', error);
    ElMessage.error('请检查表单');
  } finally {
    submitting.value = false;
    emit('update:modelValue', false);
  }
};

// 关闭时清理
const handleClose = () => {
  // 重置表单数据到初始状态
  Object.keys(initialFormData).forEach((key) => {
    (formData as any)[key] = (initialFormData as any)[key];
  });

  // 清空图片列表
  imageFileList.value = [];

  // 确保组件状态一致
  visible.value = false;
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
  } else {
    selectedImg.value = urls;

    const data = {
      asset_id: urls,
      object_type: 'product',
      object_id: props.productId,
      usage_type: 'cover',
      sort_order: 1,
    };
    try {
      const response = await createReference(data);
      if (response && response.url) {
        formData.images = [response.url]; // 确保是数组格式
      }
    } catch (error) {
      console.error('创建关联失败：', error);
      ElMessage.error('图片关联失败');
    }
  }
}
</script>

<template>
  <ElDialog
    v-model="visible"
    title="编辑商品详情"
    width="800px"
    destroy-on-close
    append-to-body
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
            <ElCascader
              v-model="formData.category_id"
              :options="categories"
              :props="cascaderProps"
              placeholder="请选择分类"
              clearable
              filterable
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="24">
        <ElFormItem label="商品图片">
          <div class="image-grid" v-loading="loading">
            <div
              v-for="(img, index) in formData.images"
              :key="index"
              class="image-item"
            >
              <ElImage
                :src="formatImageUrl(img)"
                fit="cover"
                lazy
                class="preview-img"
              />
            </div>
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
            <ElTag :type="syncStatusType(formData.sync_status)">
              {{ syncStatusText(formData.sync_status) }}
            </ElTag>
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
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 24px;
  color: #888;
}
</style>
