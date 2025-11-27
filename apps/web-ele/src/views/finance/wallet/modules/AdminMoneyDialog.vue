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
  ElTag,
} from 'element-plus';

import { deduct, deposit, getUserByUsername } from '#/api/finance/wallet';

const props = defineProps({
  visible: Boolean,
  username: { type: [Number, String], default: '' },
});

const emit = defineEmits(['update:visible', 'success']);

const dialog = reactive({ visible: false });
const loading = ref(false);
const formRef = ref(null);

const form = reactive({
  username: '',
  status: false,
  amount: null, // 支持正负数
  remark: '',
});

const userInfo = ref({ username: '', balance: '0.00000000' });

// 实时判断操作类型
const isDeposit = computed(() => form.amount > 0);
// const isDeduct = computed(() => form.amount < 0);
const displayAmount = computed(() => Math.abs(form.amount || 0).toFixed(8));
// 关键：加上这几行！！
const amountType = computed(() => {
  const amountNum = Number(form.amount);
  if (!form.amount || amountNum === 0) {
    return { text: '请输入金额', class: 'info' };
  }
  if (amountNum > 0) {
    return { text: '将为用户充值', class: 'success' };
  }
  const balance = Number(userInfo.value.balance);
  if (balance + amountNum < 0) {
    return { text: '余额不足', class: 'warning' };
  }
  return { text: '将从用户扣款', class: 'danger' };
});

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

const fetchUserInfo = async () => {
  try {
    const res = await getUserByUsername({ username: form.username });
    userInfo.value = {
      username: res.username || '未知用户',
      balance: res.balance || '0.00',
      status: res.status || false,
    };
  } catch {
    userInfo.value = { username: '用户不存在', balance: '-.--' };
  }
};

// 关键：根据正负数自动选择调用哪个接口
const submitForm = async () => {
  if (!(await formRef.value?.validate())) return;

  loading.value = true;
  try {
    const payload = {
      username: form.username,
      amount: displayAmount.value, // 永远传正数！
      remark: form.remark.trim(),
    };

    if (isDeposit.value) {
      // 调用充值接口
      await deposit(payload);
      ElMessage.success(`充值成功 +${displayAmount.value} 元`);
    } else {
      // 调用扣款接口
      await deduct(payload);
      ElMessage.success(`扣款成功 -${displayAmount.value} 元`);
    }

    emit('success');
    dialog.visible = false;
  } catch (error) {
    const msg = error.response?.data?.message || '操作失败';
    ElMessage.error(msg);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  formRef.value?.resetFields();
  Object.assign(form, { username: '', amount: null, remark: '' });
  userInfo.value = { username: '', balance: '0.00' };
};

watch(
  () => props.visible,
  (val) => {
    dialog.visible = val;
    if (val && props.username) {
      form.username = String(props.username);
      fetchUserInfo();
    }
  },
  { immediate: true },
);

watch(
  () => dialog.visible,
  (val) => emit('update:visible', val),
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
      <!-- 用户ID -->
      <ElFormItem label="用户名" prop="username">
        <ElInput
          v-model.string="form.username"
          placeholder="请输入用户名"
          :disabled="loading"
          clearabless
        />
      </ElFormItem>

      <!-- 用户信息展示 -->
      <ElFormItem label="用户信息" v-if="userInfo.username">
        <div>
          <ElTag type="success">
            当前余额: <strong>¥{{ userInfo.balance }}</strong>
          </ElTag>
          <span style="margin-left: 12px; color: #656">
            <ElTag
              :type="userInfo.status ? 'success' : 'danger'"
              effect="plain"
            >
              账户状态: <strong>{{ userInfo.status ? '正常' : '异常' }}</strong>
            </ElTag>
          </span>
        </div>
      </ElFormItem>

      <!-- 金额（支持负数） -->
      <ElFormItem label="调账金额" prop="amount">
        <ElInput
          v-model="form.amount"
          placeholder="正数=充值，负数=扣款（如 -100 表示扣100）"
          :disabled="loading"
        >
          <template #prepend>¥</template>
        </ElInput>

        <!-- 实时提示效果 -->
        <div class="tip" :class="amountType.class">
          <IconifyIcon icon="ion:chatbubble-ellipses-outline" />
          <span style="margin-left: 6px">
            {{ amountType.text }}
            <strong>{{ Math.abs(form.amount || 0).toFixed(8) }}</strong>
          </span>
        </div>
      </ElFormItem>

      <!-- 备注 -->
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
