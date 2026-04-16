<script lang="ts" setup>
import type { Api } from '#/api/tasks/clockeds_schedule';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { ElButton, ElDatePicker } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { create, update } from '#/api/tasks/clockeds_schedule';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

const DATA = {
  id: null,
  clocked_time: '',
};

const formData = ref<Api.Item>(cloneDeep(DATA));

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dept.name')])
    : $t('ui.actionTitle.create', [$t('system.dept.name')]);
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
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
      try {
        await (formData.value?.id
          ? update(formData.value.id, formData.value)
          : create(formData.value));
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

const shortcuts = [
  {
    text: '现在',
    value: new Date(),
  },
  {
    text: '明天',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    },
  },
  {
    text: '下周',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
];
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4">
      <ElDatePicker
        v-model="formData.clocked_time"
        type="datetime"
        placeholder="Select date and time"
        :shortcuts="shortcuts"
      />
    </Form>
    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
