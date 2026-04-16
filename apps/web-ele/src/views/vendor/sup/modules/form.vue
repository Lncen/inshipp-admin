<script lang="ts" setup>
import type { Api } from '#/api/vendor/vendor';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import {
  ElButton,
  ElCol,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElRow,
  ElSelect,
  ElText,
} from 'element-plus';

import {
  create,
  getDetail,
  health_check,
  platformOptions,
  statusType,
  update,
} from '#/api/vendor/vendor';

const rules = {
  code: [
    { required: true, message: '代码不能为空', trigger: 'blur' },
    { min: 1, max: 100, message: '代码长度应在1-100之间', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '名称不能为空', trigger: 'blur' },
    { min: 1, max: 200, message: '名称长度应在1-200之间', trigger: 'blur' },
  ],
  base_url: [{ required: true, message: '基础URL不能为空', trigger: 'blur' }],
  'credential.expires_at': [
    { required: true, message: '过期时间不能为空', trigger: 'blur' },
  ],
};

const base_data = {
  code: '',
  name: '',
  base_url: '',
  app_key: null,
  app_secret: null,
  status: 1,
  status_display: '',
  timeout_seconds: 10,
  retry_times: 3,
  balance: '0.00',
  created_at: '',
  updated_at: '',
  description: '',

  connection_status: '',
};

const formRef = ref();

const form = ref<Api.Item>({ ...cloneDeep(base_data) });

const [Modal, modalApi] = useVbenModal({
  title: '供应商详情',
  onConfirm() {
    // 提交前验证
    formRef.value.validate((valid: boolean) => {
      if (valid) {
        createOrUpdate();
      } else {
        ElMessage.error('请填写必填字段');
      }
    });
  },
  onClosed() {
    // 重置表单
    form.value = cloneDeep(base_data);
    if (formRef.value) {
      formRef.value.clearValidate();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const ventor = modalApi.getData();
      if (ventor.code === 'edit') {
        loadDetail(ventor.id);
      } else {
        // 新增时重置表单
        form.value = cloneDeep(base_data);
        if (formRef.value) {
          formRef.value.clearValidate();
        }
      }
    }
  },
});

async function loadDetail(id: any) {
  try {
    const response = await getDetail(id);
    form.value = response;
  } catch (error) {
    console.error('加载详情失败:', error);
  }
}

async function createOrUpdate() {
  const updatePromise = form.value.id
    ? update(form.value.id, form.value)
    : create(form.value);

  updatePromise
    .then(() => {
      const message = form.value.id ? '更新成功' : '创建成功';
      ElMessage.success(message);
      modalApi.close();
    })
    .catch((error) => {
      const errorMessage = form.value.id ? '更新失败' : '创建失败';
      console.error(`${errorMessage}:`, error);
      ElMessage.error(errorMessage);
    });
}

const on_health_check_loading = ref(false);
async function on_health_check() {
  on_health_check_loading.value = true; // 开始请求时设置loading为true
  try {
    await health_check({ vendor_id: form.value.id });
  } catch {
    ElMessage.error('检查供应商连接失败');
  } finally {
    on_health_check_loading.value = false; // 请求完成后设置loading为false
    modalApi.close();
  }
}
</script>

<template>
  <Modal>
    <div class="form-container">
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="ID" prop="id">
              <ElInput v-model="form.id" readonly />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="供应商状态检查" v-if="form.id" prop="id">
              <ElButton
                @click="on_health_check"
                width="100%"
                :loading="on_health_check_loading"
              >
                {{ form.connection_status }}
              </ElButton>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="代码" prop="code">
          <ElInput v-model="form.code" :readonly="!!form.id" />
        </ElFormItem>
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="form.name" />
        </ElFormItem>
        <ElFormItem label="余额">
          <ElInput v-model="form.balance" />
        </ElFormItem>

        <ElFormItem label="基础URL" prop="base_url">
          <ElInput v-model="form.base_url" />
        </ElFormItem>

        <ElDivider content-position="left">
          <ElText>认证类型</ElText>
        </ElDivider>

        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="状态" prop="status">
              <ElSelect v-model="form.status" style="width: 100%">
                <ElOption
                  v-for="item in statusType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="对接平台" prop="platform">
              <ElSelect v-model="form.platform" style="width: 100%">
                <ElOption
                  v-for="item in platformOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="超时时间(秒)" prop="timeout_seconds">
              <ElInputNumber
                v-model="form.timeout_seconds"
                :min="0"
                style="width: 100%"
                :controls="false"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="重试次数" prop="retry_times">
              <ElInputNumber
                v-model="form.retry_times"
                :min="0"
                style="width: 100%"
                :controls="false"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElDivider content-position="left">
          <ElText>凭证信息</ElText>
        </ElDivider>

        <ElFormItem>
          <div>
            <ElRow :gutter="24">
              <ElCol :span="12">
                <ElFormItem label="API Key" prop="credential.api_key">
                  <ElInput v-model="form.app_key" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="API Secret" prop="credential.api_secret">
                  <ElInput v-model="form.app_secret" />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </div>
        </ElFormItem>

        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="创建时间" prop="created_at">
              <ElInput v-model="form.created_at" readonly />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="更新时间" prop="updated_at">
              <ElInput v-model="form.updated_at" readonly />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="描述" prop="description">
          <ElInput v-model="form.description" type="textarea" :rows="3" />
        </ElFormItem>
      </ElForm>
    </div>
  </Modal>
</template>

<style scoped>
/* 调整 Element Plus 组件默认大小 */
:deep(.el-input),
:deep(.el-select),
:deep(.el-button),
:deep(.el-input-number) {
  height: 30px;
  margin-bottom: 10px;
  font-size: 14px;
}

:deep(.el-form-item__label) {
  font-size: 12px;
  color: #8b8787;
}

:deep(.el-text) {
  font-size: 12px;
  color: #ccc;
}
</style>
