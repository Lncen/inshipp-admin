<script setup>
import { computed, reactive, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
} from 'element-plus';

import { adjust } from '#/api/finance/wallet_user';

// props & emit
const props = defineProps({
  visible: Boolean,
  username: { type: [Number, String], default: '' },
  idempotencykey: { type: [Number, String], default: '' },
});

const emit = defineEmits(['update:visible', 'success']);

const dialog = reactive({ visible: false });
const loading = ref(false);
const loadingUserInfo = ref(false); // 新增：用户名查询 loading
const formRef = ref(null);

const form = ref({
  username: '',
  amount: null,
  remark: '',
});

const userInfo = ref({
  username: '',
  balance: '0.0',
  status: '',
});

// 计算属性保持不变
const displayAmount = computed(() =>
  Math.abs(form.value.amount || 0).toFixed(8),
);

const amountType = computed(() => {
  const n = Number(form.value.amount);
  if (!form.value.amount || n === 0)
    return { text: '请输入金额', class: 'info' };
  if (n > 0) return { text: '将为用户充值', class: 'success' };

  return { text: '将从用户扣款', class: 'danger' };
});

// 规则略微优化
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^-?(0|[1-9]\d*)(\.\d{1,8})?$/,
      message: '金额格式不正确',
    },
  ],
  remark: [
    { required: false, message: '请填写操作原因（合规必填）', trigger: 'blur' },
    { min: 5, max: 200, message: '5-200个字符' },
  ],
};

// 提交逻辑（不变，只是用了 displayAmount）
const submitForm = async () => {
  if (!(await formRef.value?.validate())) return;

  loading.value = true;
  try {
    const payload = {
      username: form.value.username.trim(),
      amount: displayAmount.value,
      remark: form.value.remark.trim(),
      idempotency_key: props.idempotencykey,
    };
    await adjust(payload);
    ElMessage.success(`成功 +${displayAmount.value}`);

    // 提交成功后，触发 success 事件传递username参数
    // 关闭弹窗
    emit('success', form.value.username);
    emit('update:visible', false);
    dialog.visible = false;
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  formRef.value?.resetFields();
  form.value = { username: '', amount: null, remark: '' };
  userInfo.value = { username: '', balance: '0.00', status: '' };
};

/* ==================== 关键修复：两个 watch 完美配合 ==================== */

// 1. 父组件控制 visible ←→ dialog.visible 双向同步
watch(
  () => props.visible,
  (val) => {
    dialog.visible = val; // 这一行必须有！
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog
    v-model="dialog.visible"
    title="管理员调账（正数=充值，负数=扣款）"
    width="540px"
    destroy-on-close
    center
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="110px"
      status-icon
    >
      <ElFormItem label="用户名" prop="username">
        <ElInput
          v-model.string="form.username"
          placeholder="请输入用户名"
          :disabled="loading"
          clearable
        >
          <template #suffix>
            <el-icon v-if="loadingUserInfo"><Loading /></el-icon>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem label="调账金额" prop="amount">
        <ElInput
          v-model="form.amount"
          placeholder="正数=充值，负数=扣款（如 -100 表示扣100）"
          :disabled="loading"
        >
          <template #prepend>¥</template>
        </ElInput>

        <div class="tip" :class="amountType.class">
          <IconifyIcon icon="ion:chatbubble-ellipses-outline" />
          <span style="margin-left: 6px">
            {{ amountType.text }}
            <strong>{{ Math.abs(form.amount || 0).toFixed(8) }}</strong>
          </span>
        </div>
      </ElFormItem>

      <ElFormItem label="操作备注" prop="remark">
        <ElInput
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="记录调账其他原因（如：活动补发、异常扣款、退款等）"
          maxlength="200"
          show-word-limit
          :disabled="loading"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton :disabled="loading" @click="dialog.visible = false">
          取消
        </ElButton>
        <ElButton type="primary" :loading="loading" @click="submitForm">
          {{ loading ? '提交中...' : '确认调账' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.tip {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
}

.tip.success {
  color: #67c23a;
}

.tip.danger {
  color: #e47979;
}

.tip.warning {
  color: #e50a0a;
}

.tip.info {
  color: #909399;
}
</style>
