<script lang="ts" setup>
import type { Api as BuyProductsApi } from '#/api/products/by_param';
import type { Api } from '#/api/products/products';

import { ref, toRaw } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElCol,
  ElDialog,
  ElDivider,
  ElEmpty,
  ElFormItem,
  ElImage,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElRow,
  ElSelect,
  ElText,
  ElTreeSelect,
} from 'element-plus';

import { createReference } from '#/api/asset/asset';
import { inputTypeOptions } from '#/api/products/by_param';
import {
  create,
  flagOptions,
  isClosedOptions,
  productStatusOptions,
  productTypeOptions,
  redeemTypeOptions,
  ruleTypeOptions,
  sourceTypeOptions,
  update,
} from '#/api/products/products';
import ImagePickerDialog from '#/modules/ImagePickerDialog.vue';
import { formatImageUrl } from '#/utils/formatImageUrl';

const loading = ref(false);

// 参数模板定义
const BUY_PARAMS_TEMPLATE = {
  // product: undefined,
  id: undefined,
  key: '',
  label: '',
  value: '',
  description: '',
  input_type: 1,
  type_config: '',
  default_value: '',
  use_default: 2,
  is_required: 2,
  is_hidden: 2,
  validate_min: 1,
  validate_max: 100_000,
  is_edit: 1,
};

// 默认数据对象
const DEFAULT_DATA = {
  id: undefined, // 修改为数值类型
  name: '',
  after_sale_rules: '',
  description: '',
  unit: '1',
  category: undefined, // 使用 null 而不是 undefined
  images: [],

  cost_price: '0.00',
  price: '0.00',
  purchase_step: '1.0000',
  price_display_precision: 0,

  stock: -1, // -1 表示无限库存
  min_quantity: 1,
  max_quantity: 1_000_000,

  fulfillment_type: 1,
  status: 1,
  source_type: 1,
  type: 8,
  rule_type: 2,

  is_closed: 2,
  is_repeatable: 1,
  is_batch: 1,
  can_refund: 2,
  buy_params: [BUY_PARAMS_TEMPLATE],

  sort: 0,
  input_fields_overridden: false,
  params_template: [],
  created_at: '',
  updated_at: '',
};

const categoriesData = ref<Api.MenuItem[]>([]);
// 定义响应式引用
const formData = ref<Api.ProductItem>({ ...DEFAULT_DATA });
const supSelectData = ref<any>([]);
const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  closable: false,
  showConfirmButton: true, // 提交锁定状态
  onCancel() {
    // 取消逻辑
    modalApi.close();
  },
  onConfirm() {
    // 确认逻辑
    createOrUpdate();

    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    // 打开
    if (isOpen) {
      const data = modalApi.getData<any>();
      formData.value = data.initialData;
      categoriesData.value = data.categories;
      supSelectData.value = data.supplierSelectData;
    }
  },
});

// 创建或修改----------------------------------

async function createOrUpdate() {
  try {
    if (formData.value.id) {
      // 修改
      await update(formData.value.id, formData.value);
      ElMessage.success('修改成功');
    } else {
      // 创建
      await create(formData.value);
      ElMessage.success('创建成功');
    }
  } catch (error) {
    console.error('创建或修改失败：', error);
    ElMessage.error('创建或修改失败');
  }
}

// 图片选择器 ----------------------------------
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
      object_id: formData.value.id,
      usage_type: 'cover',
      sort_order: 1,
    };
    try {
      const response = await createReference(data);
      if (response && response.url) {
        formData.value.images = [response.url]; // 确保是数组格式
      }
    } catch (error) {
      console.error('创建关联失败：', error);
      ElMessage.error('图片关联失败');
    }
  }
}

// 下单参数设置 ----------------------------------

const dialogFormVisible = ref(false);
const buyParams = ref<BuyProductsApi.Item>(BUY_PARAMS_TEMPLATE);
const editingParams = ref<BuyProductsApi.Item>(); // 用于保存编辑弹窗的原始参数
const isParamsEdit = ref('edit');

const hel_BuyParams = (params: BuyProductsApi.Item, stautu: string) => {
  isParamsEdit.value = stautu;
  editingParams.value = params;
  const to_raw = toRaw(params);
  buyParams.value = structuredClone(to_raw);
  dialogFormVisible.value = true;
};

// 关闭下单参数设置
function closeBuyParams() {
  dialogFormVisible.value = false;
}
// 确定
const on_confirm_buy_params = async () => {
  if (isParamsEdit.value === 'edit' && editingParams.value) {
    Object.assign(editingParams.value, buyParams.value);
  }

  if (isParamsEdit.value === 'add') {
    formData.value.buy_params.push(buyParams.value);
  }
  dialogFormVisible.value = false;
};

const on_delete_buy_params = async () => {
  try {
    formData.value.buy_params = formData.value.buy_params.filter(
      (item) => item.id !== buyParams.value.id,
    );

    dialogFormVisible.value = false;
  } catch {}
};
</script>

<template>
  <!-- 下的参数 -->
  <ElDialog
    v-model="dialogFormVisible"
    :title="buyParams.id ? '修改下单参数' : '添加下单参数'"
    width="500px"
    @close="closeBuyParams"
  >
    <ElRow :gutter="24">
      <ElCol :span="6">
        <ElFormItem label="参数编号" label-width="10px">
          <ElInput disabled v-model="buyParams.id" />
        </ElFormItem>
      </ElCol>
      <ElCol :span="12">
        <ElFormItem label="属于" label-width="10px">
          <ElInput disabled v-model="formData.name" />
        </ElFormItem>
      </ElCol>
      <ElCol :span="6">
        <ElFormItem label="商品编号" label-width="10px">
          <ElInput disabled v-model="buyParams.product" />
        </ElFormItem>
      </ElCol>

      <ElDivider content-position="left">
        <ElText>信息</ElText>
      </ElDivider>

      <ElCol :span="8">
        <ElFormItem label="是否使用默认值">
          <ElSelect v-model="buyParams.input_type" style="width: 100%">
            <ElOption
              v-for="item in flagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :span="8">
        <ElFormItem label="最小购买量" label-width="100px">
          <ElInputNumber
            v-model="buyParams.validate_min"
            :min="1"
            :max="1000000"
            style="width: 100%"
            :precision="0"
            placeholder="每次最少买多少"
            :controls="false"
            :step="1"
          />
        </ElFormItem>
      </ElCol>

      <ElCol :span="8">
        <ElFormItem label="最大购买量" label-width="100px">
          <ElInputNumber
            v-model="buyParams.validate_max"
            :min="1"
            :max="1000000"
            style="width: 100%"
            :precision="0"
            placeholder="每次最多买多少"
            :controls="false"
            :step="1"
          />
        </ElFormItem>
      </ElCol>

      <ElDivider content-position="left">
        <ElText>设置</ElText>
      </ElDivider>

      <ElCol :span="8">
        <ElFormItem label="类型">
          <ElSelect v-model="buyParams.input_type" style="width: 100%">
            <ElOption
              v-for="item in inputTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :span="8">
        <ElFormItem label="是否必填" label-width="10px">
          <ElSelect v-model="buyParams.is_required" style="width: 100%">
            <ElOption
              v-for="item in flagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :span="8">
        <ElFormItem label="是否隐藏">
          <ElSelect v-model="buyParams.is_hidden" style="width: 100%">
            <ElOption
              v-for="item in flagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :span="24">
        <ElFormItem label="类型扩展配置" label-width="10px">
          <ElInput v-model="buyParams.type_config" />
        </ElFormItem>
      </ElCol>

      <ElDivider content-position="left">
        <ElText>值</ElText>
      </ElDivider>

      <ElCol :span="8">
        <ElFormItem label="名称" label-width="10px">
          <ElInput v-model="buyParams.label" />
        </ElFormItem>
      </ElCol>

      <ElCol :span="8">
        <ElFormItem label="key" label-width="10px">
          <ElInput v-model="buyParams.key" />
        </ElFormItem>
      </ElCol>

      <ElCol :span="8">
        <ElFormItem label="value" label-width="10px">
          <ElInput v-model="buyParams.value" />
        </ElFormItem>
      </ElCol>

      <ElCol :span="24">
        <ElFormItem label="默认value值" label-width="10px">
          <ElInput v-model="buyParams.default_value" />
        </ElFormItem>
      </ElCol>

      <ElDivider content-position="left">
        <ElText>说明</ElText>
      </ElDivider>

      <ElCol :span="24">
        <ElFormItem label="描述" label-width="80px">
          <ElInput
            v-model="buyParams.description"
            type="textarea"
            :rows="3"
            placeholder="请输入详细描述"
          />
        </ElFormItem>
      </ElCol>
    </ElRow>

    <template #footer>
      <div class="dialog-footer">
        <ElButton
          v-if="buyParams.is_edit === 1 && buyParams.id"
          type="danger"
          @click="on_delete_buy_params"
        >
          删除
        </ElButton>
        <ElButton @click="closeBuyParams">取消</ElButton>
        <ElButton
          v-if="buyParams.is_edit === 1"
          type="primary"
          @click="on_confirm_buy_params"
        >
          确定
        </ElButton>
      </div>
    </template>
  </ElDialog>

  <!-- 图片选择器 ---------------------------------- -->
  <ImagePickerDialog
    ref="pickerRef"
    v-model="imageDialogVisible"
    :default-selected="selectedImg"
    @confirm="onConfirm"
    :max="9"
    :multiple="false"
  />

  <Modal
    :title="formData.id ? '编辑商品' : '创建商品'"
    class="w-full max-w-[900px]"
  >
    <div class="product-edit-layout">
      <ElCard shadow="never" :body-style="{ padding: '10px' }">
        <!-- 左侧：商品图片 + 部分关键状态 -->
        <div class="side-panel page-container">
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
              v-if="formData.images?.length === 0"
              description="暂无图片"
            />
          </div>
          <ElButton type="info" plain @click="openSinglePicker">
            选择主图（单选）
          </ElButton>
          <ElDivider
            content-position="left"
            style="margin-top: 1px; margin-bottom: 6px"
          >
            <ElText>供货商</ElText>
          </ElDivider>
          <ElSelect v-model="formData.owner_sup" style="width: 100%">
            <ElOption
              v-for="item in supSelectData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>

          <ElDivider
            content-position="left"
            style="margin-top: 1px; margin-bottom: 6px"
          >
            <ElText>下单参数</ElText>
          </ElDivider>

          <ElFormItem v-for="item in formData.buy_params" :key="item.id">
            <ElButton
              type="info"
              plain
              style="width: 100%"
              @click="hel_BuyParams(item, 'edit')"
            >
              {{
                item.is_edit === 2 ? `${item.label} (不允许编辑)` : item.label
              }}
            </ElButton>
          </ElFormItem>

          <ElFormItem>
            <ElButton
              type="info"
              plain
              style="width: 100%"
              @click="hel_BuyParams(BUY_PARAMS_TEMPLATE, 'add')"
            >
              <span
                style="
                  display: inline-block;
                  font-size: 40px;
                  transform: translateY(-5px); /* 负值向上移动 */
                "
              >
                +
              </span>
            </ElButton>
          </ElFormItem>
        </div>
      </ElCard>

      <!-- 右侧：主表单 -->
      <div class="main-form">
        <ElRow :gutter="24">
          <ElDivider
            content-position="left"
            style="margin-top: 0; margin-bottom: 6px"
          >
            <ElText>基本信息</ElText>
          </ElDivider>
        </ElRow>

        <ElRow :gutter="24">
          <ElCol :span="6">
            <ElFormItem label="商品编号" label-width="10px">
              <ElInput
                disabled
                v-model="formData.id"
                placeholder="请输入商品编号"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="10">
            <ElFormItem label="商品名称" label-width="80px">
              <ElInput v-model="formData.name" placeholder="请输入商品名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElForm>
              <ElFormItem>
                <div style="margin-top: 4px">
                  <ElText>创建: {{ formData.created_at }}</ElText>
                </div>
                <div style="margin-top: 4px">
                  <ElText>更新: {{ formData.updated_at }}</ElText>
                </div>
                <div style="margin-top: 4px">
                  <ElText>
                    在本地编辑过吗:
                    {{ formData.input_fields_overridden === 1 ? ' 是' : ' 否' }}
                  </ElText>
                </div>
              </ElFormItem>
            </ElForm>
          </ElCol>
        </ElRow>

        <ElDivider
          content-position="left"
          style="margin-top: 0; margin-bottom: 6px"
        >
          <ElText>状态</ElText>
        </ElDivider>
        <ElRow :gutter="24">
          <ElCol :span="8">
            <ElFormItem label="商品状态" label-width="80px">
              <ElSelect v-model="formData.status" style="width: 100%">
                <ElOption
                  v-for="item in productStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="8">
            <ElFormItem label="允许下单" label-width="80px">
              <ElSelect v-model="formData.is_closed" style="width: 100%">
                <ElOption
                  v-for="item in isClosedOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="8">
            <ElFormItem label="允许退款">
              <ElSelect v-model="formData.can_refund" style="width: 100%">
                <ElOption
                  v-for="item in flagOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="8">
            <ElFormItem label="允许重复购买">
              <ElSelect v-model="formData.is_repeatable" style="width: 100%">
                <ElOption
                  v-for="item in flagOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="8">
            <ElFormItem label="允许批量购买">
              <ElSelect v-model="formData.is_batch" style="width: 100%">
                <ElOption
                  v-for="item in flagOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElDivider content-position="left" style="margin-bottom: 6px">
          <ElText>分类信息</ElText>
        </ElDivider>

        <ElRow :gutter="24">
          <ElCol :span="8">
            <ElFormItem label="本地分类">
              <ElTreeSelect
                v-model="formData.category"
                :data="categoriesData"
                placeholder="请选择分类"
                :props="{ value: 'id', label: 'name', children: 'children' }"
                clearable
                filterable
                check-strictly
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="8">
            <ElFormItem label="来源类型" label-width="80px">
              <ElSelect v-model="formData.source_type" style="width: 100%">
                <ElOption
                  v-for="item in sourceTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="8">
            <ElFormItem label="商品类型">
              <ElSelect v-model="formData.type" style="width: 100%">
                <ElOption
                  v-for="item in productTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElDivider content-position="left" style="margin-bottom: 6px">
          <ElText>价格信息</ElText>
        </ElDivider>
        <!-- 价格与库存 -->

        <ElRow :gutter="24">
          <ElCol :span="8">
            <ElFormItem
              label="销售价格"
              placeholder="出售价格"
              label-width="90px"
            >
              <ElInput
                v-model="formData.price"
                placeholder="结算规则为(固定)时会按此结算"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="成本价格" label-width="90px">
              <ElInput v-model="formData.cost_price" placeholder="进货价格" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="库存" label-width="60px">
              <ElInputNumber
                v-model="formData.stock"
                :min="-1"
                :max="10000000"
                :precision="0"
                :step="1"
                style="width: 100%"
                placeholder="-1 表示无限库存"
                :controls="false"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="24">
          <ElCol :span="8">
            <ElFormItem label="最小购买量" label-width="100px">
              <ElInputNumber
                v-model="formData.min_quantity"
                :min="1"
                :max="1000000"
                style="width: 100%"
                :precision="0"
                placeholder="每次最少买多少"
                :controls="false"
                :step="1"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="最大购买量" label-width="100px">
              <ElInputNumber
                v-model="formData.max_quantity"
                :min="1"
                :max="1000000"
                :controls="false"
                style="width: 100%"
                :precision="0"
                :step="1"
                placeholder="每次最多可以买多少"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="购买步长" label-width="90px">
              <ElInputNumber
                v-model="formData.purchase_step"
                :min="1"
                :max="1000000"
                :controls="false"
                style="width: 100%"
                :precision="0"
                :step="1"
                placeholder="限制每次加/减的数量"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="单位" label-width="80px">
              <ElInput v-model="formData.unit" placeholder="如：件、个" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="价格精度" label-width="80px">
              <ElInput
                v-model="formData.price_display_precision"
                placeholder="小数点后几位数字?"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElDivider content-position="left" style="margin-bottom: 6px">
          <ElText>商品设置</ElText>
        </ElDivider>

        <ElRow :gutter="24">
          <ElCol :span="8">
            <ElFormItem label="结算规则">
              <ElSelect v-model="formData.rule_type" style="width: 100%">
                <ElOption
                  v-for="item in ruleTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="8">
            <ElFormItem label="发货方式" label-width="80px">
              <ElSelect v-model="formData.fulfillment_type" style="width: 100%">
                <ElOption
                  v-for="item in redeemTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElDivider content-position="left" style="margin-bottom: 6px">
          <ElText>描述</ElText>
        </ElDivider>
        <ElRow :gutter="24">
          <ElCol :span="24">
            <ElFormItem label="售后规则" label-width="80px">
              <ElInput
                v-model="formData.after_sale_rules"
                type="textarea"
                :rows="2"
                placeholder="请输入售后规则说明"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="商品描述" label-width="80px">
              <ElInput
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入商品详细描述"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <!-- 自定义参数模板（可选展示） -->
        <!-- <pre>{{ formData.params_template }}</pre> -->
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.product-edit-layout {
  display: flex;
  gap: 15px;
}

.main-form {
  display: flex;
  flex: 3;
  flex-direction: column;
  gap: 10px;
}

.side-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* 调整 Element Plus 组件默认大小 */
:deep(.el-input),
:deep(.el-select),
:deep(.el-button),
:deep(.el-input-number) {
  height: 30px;
  margin-bottom: 1px;
  font-size: 14px;
}

:deep(.el-text) {
  font-size: 12px;
  color: #ccc;
}

:deep(.el-form-item__label) {
  font-size: 12px;
  color: #8b8787;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 220px;
  height: 200px;
}

.image-item {
  position: relative;
  width: 220px;
  height: 200px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
