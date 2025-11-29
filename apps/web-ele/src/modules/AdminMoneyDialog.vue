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
// props & emit
const props = defineProps({
  visible: Boolean,
  username: { type: [Number, String], default: '' },
});

const emit = defineEmits(['update:visible', 'success']);

// 如果项目没装 lodash，用这个手写防抖（推荐，直接复制）
const debounce = (fn, delay = 500) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

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
  status: false,
});

// 计算属性保持不变
const isDeposit = computed(() => Number(form.value.amount) > 0);
const displayAmount = computed(() =>
  Math.abs(form.value.amount || 0).toFixed(8),
);

const amountType = computed(() => {
  const n = Number(form.value.amount);
  if (!form.value.amount || n === 0)
    return { text: '请输入金额', class: 'info' };
  if (n > 0) return { text: '将为用户充值', class: 'success' };

  const balance = Number(userInfo.value.balance);
  if (balance + n < 0) return { text: '余额不足', class: 'warning' };
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

// 核心：防抖查询用户信息
const fetchUserInfo = async (username) => {
  if (!username?.trim()) {
    userInfo.value = { username: '', balance: '0.00000000', status: false };
    return;
  }
  loadingUserInfo.value = true;
  try {
    const res = await getUserByUsername({ username: username.trim() });
    userInfo.value = {
      username: res.username || '未知用户',
      balance: res.balance ?? '0.00000000',
      status: !!res.status,
    };
  } catch {
    userInfo.value = { username: '用户不存在', balance: '-.--', status: false };
  } finally {
    loadingUserInfo.value = false;
  }
};

const debouncedFetchUserInfo = debounce(fetchUserInfo, 500);

// 提交逻辑（不变，只是用了 displayAmount）
const submitForm = async () => {
  if (!(await formRef.value?.validate())) return;

  loading.value = true;
  try {
    const payload = {
      username: form.value.username.trim(),
      amount: displayAmount.value,
      remark: form.value.remark.trim(),
    };

    if (isDeposit.value) {
      await deposit(payload);
      ElMessage.success(`充值成功 +${displayAmount.value}`);
    } else {
      await deduct(payload);
      ElMessage.success(`扣款成功 -${displayAmount.value}`);
    }

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
  userInfo.value = { username: '', balance: '0.00000000', status: false };
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

// 2. dialog.visible 变化时通知父组件（v-model 语法糖）
watch(
  () => dialog.visible,
  (val) => {
    emit('update:visible', val);

    // 弹窗打开时：填充 username 并查询用户信息
    if (val) {
      form.value.username = props.username ? String(props.username) : '';
      if (form.value.username) {
        debouncedFetchUserInfo(form.value.username);
      } else {
        userInfo.value = { username: '', balance: '0.00000000', status: false };
      }
    } else {
      // 关闭时清理
      handleClose();
    }
  },
);

// 3. 用户手动输入用户名时实时查询
watch(
  () => form.value.username,
  (newVal) => {
    debouncedFetchUserInfo(newVal);
  },
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
          clearable
        >
          <template #suffix>
            <el-icon v-if="loadingUserInfo"><Loading /></el-icon>
          </template>
        </ElInput>
      </ElFormItem>

      <!-- 用户信息展示 -->
      <ElFormItem label="用户信息">
        <div>
          <ElTag type="success" effect="plain" v-if="userInfo.username">
            当前余额: <strong>¥{{ userInfo.balance }}</strong>
          </ElTag>
          <ElTag type="danger" effect="plain" v-if="!userInfo.username">
            <strong>请输入用户名</strong>
          </ElTag>
          <span style="margin-left: 12px; color: #656">
            <ElTag
              v-show="userInfo.username ? true : false"
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
