<script lang="ts" setup>
import type { Api } from '#/api/tasks/interval_schedule';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElButton, ElForm } from 'element-plus';

import { create, update } from '#/api/tasks/interval_schedule';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

// import { getCategories } from '#/api/products/products';

const data = ref<any>({});
const formData = ref<Api.Item>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dept.name')])
    : $t('ui.actionTitle.create', [$t('system.dept.name')]);
});

function resetForm() {}

const formRef = ref<InstanceType<typeof ElForm> | null>(null);
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const valid = await formRef.value?.validate().catch(() => false);
    if (valid) {
      modalApi.lock();
      try {
        await (formData.value?.id
          ? update(formData.value.id, formData.value as Omit<Api.Item, 'id'>)
          : create(formData.value as Omit<Api.Item, 'id'>));
        modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      data.value = modalApi.getData<Api.Item>();
      if (data.value) {
        formData.value = data;
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
