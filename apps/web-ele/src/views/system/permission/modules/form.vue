<script lang="ts" setup>
import type { SystemPermissionApi } from '#/api/system/permission';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElButton } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { createPermission, updatePermission } from '#/api/system/permission';
import { $t } from '#/locales';

import { useSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<SystemPermissionApi.SystemPermission>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.permission.name')])
    : $t('ui.actionTitle.create', [$t('system.permission.name')]);
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useSchema(),
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      try {
        await (formData.value?.id
          ? updatePermission(
              formData.value.id,
              data as Omit<SystemPermissionApi.SystemPermission, 'id'>,
            )
          : createPermission(
              data as Omit<SystemPermissionApi.SystemPermission, 'id'>,
            ));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemPermissionApi.SystemPermission>();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
