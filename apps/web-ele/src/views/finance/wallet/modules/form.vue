<script lang="ts" setup>
import type { Api } from '#/api/finance/wallet';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

// import { Spin } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
// import { create, update } from '#/api/finance/wallet';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

// const emits = defineEmits(['success']);

const formData = ref<Api.Item>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    // const values = await formApi.getValues();

    drawerApi.lock();
    // (id.value ? update(id.value, values) : create(values))
    //   .then(() => {
    //     emits('success');
    //     drawerApi.close();
    //   })
    //   .catch(() => {
    //     drawerApi.unlock();
    //   });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<Api.Item>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
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
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
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
