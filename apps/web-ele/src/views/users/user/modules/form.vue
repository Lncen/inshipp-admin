<script lang="ts" setup>
import type { UserApi } from '#/api';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

// import { Spin } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { createUser, setPasswordUser, updateUser } from '#/api';
import { $t } from '#/locales';

import { useFormSchema, usePasswordFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<UserApi.UserInfo>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const defaultCheckedKeys = ref<string[]>([]);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateUser(id.value, values) : createUser(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<UserApi.UserInfo>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
        defaultCheckedKeys.value = data.groups;
      } else {
        id.value = undefined;
      }

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});
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

    setPasswordUser(values)
      .then(() => {
        setPasswordModalApi.close();
        ElMessage.success($t('修改成功'));
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        ElMessage.error($t('修改失败'));
      });
  },
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
    <template #footer>
      <div class="flex w-full items-center justify-between">
        <VbenButton
          btn-class="text-red-500"
          @click="() => setPasswordModalApi.open()"
        >
          修改密码
        </VbenButton>
        <div class="flex gap-2">
          <VbenButton @click="drawerApi.close()">
            {{ $t('common.cancel') }}
          </VbenButton>
          <VbenButton type="primary" @click="drawerApi.onConfirm()">
            {{ $t('common.confirm') }}
          </VbenButton>
        </div>
      </div>
    </template>
    <SetPassword title="密码设置">
      <PasswordForm />
    </SetPassword>
  </Drawer>
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
