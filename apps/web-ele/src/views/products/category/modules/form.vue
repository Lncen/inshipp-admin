<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { Api } from '#/api/products/category';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { getPopupContainer } from '@vben/utils';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm, z } from '#/adapter/form';
import { create, getTreeSelect, update } from '#/api/products/category';
import { $t } from '#/locales';

const emit = defineEmits<{
  success: [];
}>();
const formData = ref<Api.Item>();
const titleSuffix = ref<string>();
const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('system.menu.menuName'),
    rules: z
      .string()
      .min(2, $t('ui.formRules.minLength', [$t('system.menu.menuName'), 2]))
      .max(30, $t('ui.formRules.maxLength', [$t('system.menu.menuName'), 30])),
    // .refine(
    //   async (value: string) => {
    //     // 只有在创建新菜单时（没有id）才验证名称唯一性
    //     if (!formData.value?.id) {
    //       return !(await isMenuNameExists(value, formData.value?.id));
    //     }
    //     // 编辑现有菜单时跳过唯一性验证
    //     return true;
    //   },
    //   (value) => ({
    //     message: $t('ui.formRules.alreadyExists', [
    //       $t('system.menu.menuName'),
    //       value,
    //     ]),
    //   }),
    // ),
  },
  {
    component: 'ApiTreeSelect',
    fieldName: 'parent',
    label: $t('system.menu.parent'),
    componentProps: {
      api: getTreeSelect,
      class: 'w-full',
      getPopupContainer,
      labelField: 'name',
      accordion: true,
      defaultExpandedKeys: [null],
      checkStrictly: true,
      valueField: 'id',
      childrenField: 'children',
    },
  },

  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: $t('common.enabled'), value: true },
        { label: $t('common.disabled'), value: false },
      ],
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'is_active',
    label: $t('system.menu.status'),
  },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const isHorizontal = computed(() => breakpoints.greaterOrEqual('md').value);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-4 md:col-span-1',
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<Api.Item>();
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
        titleSuffix.value = formData.value.name ? $t(formData.value.name) : '';
      } else {
        formApi.resetForm();
        // 设置明确的默认值
        formApi.setValues({
          name: '',
          is_active: false,
          parent: null,
        });
        titleSuffix.value = '';
      }
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const data = await formApi.getValues<Omit<Api.Item, 'children' | 'id'>>();
    try {
      await (formData.value?.id
        ? update(formData.value.id, data)
        : create(data));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}
const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.menu.name')])
    : $t('ui.actionTitle.create', [$t('system.menu.name')]),
);
</script>
<template>
  <Drawer class="w-full max-w-[400px]" :title="getDrawerTitle">
    <Form class="mx-4" :layout="isHorizontal ? 'horizontal' : 'vertical'" />
  </Drawer>
</template>
