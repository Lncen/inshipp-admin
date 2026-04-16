<script lang="ts" setup>
import type { Api } from '#/api/tasks/task_result';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';

import { useSchema } from '../data';

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  schema: useSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    modalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<Api.Item>();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});
</script>

<template>
  <Modal title="任务详情">
    <Form class="mx-4">
      <template #prepend-footer> </template>
    </Form>
  </Modal>
</template>
