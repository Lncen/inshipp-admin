<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api';

import { computed, nextTick, ref } from 'vue';

import { Loading, Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

// import { Spin } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { createRole, getPermList, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permission_ids = ref<SystemRoleApi.SystemRole[]>([]);
const defaultCheckedKeys = ref<number[]>([]);
const loadingPermissions = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    // 过滤掉非数字的权限ID
    if (values.permission_ids && Array.isArray(values.permission_ids)) {
      values.permission_ids = values.permission_ids
        .filter(
          (id) =>
            typeof id === 'number' ||
            (typeof id === 'string' && /^\d+$/.test(id)),
        )
        .map((id) => (typeof id === 'string' ? Number.parseInt(id, 10) : id));
    }
    drawerApi.lock();
    (id.value ? updateRole(id.value, values) : createRole(values))
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
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
        defaultCheckedKeys.value = data.permissions;
      } else {
        id.value = undefined;
      }

      if (permission_ids.value.length === 0) {
        await loadPermissions();
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getPermList();
    permission_ids.value = res;
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permission_ids="slotProps">
        <Loading :spinning="loadingPermissions" class="w-full">
          <Tree
            :tree-data="permission_ids"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
            label-field="name"
          />

          <!-- 可选：自定义 loading 图标（如果你希望统一图标） -->
          <template #icon>
            <IconifyIcon
              icon="svg-spinners:bars-scale"
              class="text-primary size-10"
            />
          </template>
        </Loading>
      </template>
    </Form>
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
