<script lang="ts" setup>
import type { Api } from '#/api/tasks/crontab_schedules';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { ElButton } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { create, update } from '#/api/tasks/crontab_schedules';
import { $t } from '#/locales';

import { useSchema } from '../data';

const emit = defineEmits(['success']);

const DATA = {
  id: null,
  clocked_time: '',
};

const formData = ref<Api.Item>(cloneDeep(DATA));

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['计划任务'])
    : $t('ui.actionTitle.create', ['计划任务']);
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
          ? update(formData.value.id, data)
          : create(data));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<Api.Item>();
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
