<script lang="ts" setup>
import type { Api } from '#/api';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

// import { Spin } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { setPassword } from '#/api/user/user';
import { $t } from '#/locales';

import { usePasswordFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<Api.Item>();

const id = ref();

// 修改密码

const [PasswordForm, passwordFormApi] = useVbenForm({
  schema: usePasswordFormSchema(), // 需要定义密码表单结构
  showDefaultActions: false,
});
const [SetPassword, setPasswordModalApi] = useVbenModal({
  async onConfirm() {
    // 获取表单数据
    const values = await passwordFormApi.getValues();

    // 验证表单
    const { valid } = await passwordFormApi.validate();
    if (!valid) {
      throw new Error($t('表单验证失败'));
    }

    // 验证密码一致性
    if (values.new_password !== values.confirm_password) {
      ElMessage.error('两次输入的密码不一致');
      throw new Error($t('两次输入的密码不一致'));
    }

    values.id = formData.value?.id;

    setPassword(values)
      .then(() => {
        setPasswordModalApi.close();
        ElMessage.success($t('修改成功'));
        emits('success');
      })
      .catch(() => {
        ElMessage.error($t('修改失败'));
      });
  },
});
</script>
<template>
  <SetPassword title="密码设置">
    <PasswordForm />
  </SetPassword>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
