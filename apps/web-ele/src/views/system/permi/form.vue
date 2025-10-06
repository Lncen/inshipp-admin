<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';
import type { SystemDeptApi } from '#/api/system/dept';

import { computed, h, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { getPopupContainer } from '@vben/utils';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm, z } from '#/adapter/form';
import {
  createDept,
  getDeptList,
  isDeptNameExists,
  // SystemDeptApi,
  updateDept,
} from '#/api/system/dept';
import { $t } from '#/locales';

const emit = defineEmits<{
  success: [];
}>();
const formData = ref<SystemDeptApi.SystemDept>();
const titleSuffix = ref<string>();
const defaultRadioGroup = ref<string>();
const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'id',
    label: $t('编号'),
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('system.dept.deptName'),
    rules: z
      .string()
      .min(2, $t('ui.formRules.minLength', [$t('system.menu.menuName'), 2]))
      .max(30, $t('ui.formRules.maxLength', [$t('system.menu.menuName'), 30]))
      .refine(
        async (value: string) => {
          // 如果是编辑模式且当前值未改变，则跳过校验
          if (formData.value?.id && value === formData.value?.name) {
            return true;
          }
          // 否则调用异步校验函数检查名称是否存在
          return !(await isDeptNameExists(value, formData.value?.id));
        },
        (value) => ({
          message: $t('ui.formRules.alreadyExists', [
            $t('system.dept.deptName'),
            value,
          ]),
        }),
      ),
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      api: getDeptList,
      class: 'w-full',
      filterTreeNode(input: string, node: Recordable<any>) {
        if (!input || input.length === 0) {
          return true;
        }
        const title: string = node.name ?? '';
        if (!title) return false;
        return title.includes(input) || $t(title).includes(input);
      },
      getPopupContainer,
      labelField: 'name',
      showSearch: true,
      treeDefaultExpandAll: true,
      checkStrictly: true,
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'pid',
    label: $t('system.menu.parent'),
    renderComponentContent() {
      return {
        title({ label }: { label: string }) {
          const coms = [];
          if (!label) return '';
          // if (meta?.icon) {
          //   coms.push(h(IconifyIcon, { class: 'size-4', icon: meta.icon }));
          // }
          coms.push(h('span', { class: '' }, $t(label)));
          return h('div', { class: 'flex items-center gap-1' }, coms);
        },
      };
    },
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: [
        { label: '固定金额加价', value: 'fixed' },
        { label: '按比例加价', value: 'percentage' },
      ],
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'markup_type',
    label: $t('system.dept.MarkupType'),
  },

  {
    component: 'Input',
    fieldName: 'fixed',
    label: $t('固定加价'),
    dependencies: {
      show: (values) => values.markup_type === 'fixed',
      triggerFields: ['markup_type'],
    },
  },

  {
    component: 'Input',
    fieldName: 'percentage',
    label: $t('比例加价'),
    dependencies: {
      show: (values) => values.markup_type === 'percentage',
      triggerFields: ['markup_type'],
    },
  },

  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: $t('common.enabled'), value: 1 },
        { label: $t('common.disabled'), value: 0 },
      ],
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'status',
    label: $t('system.menu.status'),
  },
  {
    component: 'Input',
    fieldName: 'remark',
    label: $t('system.role.remark'),
  },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const isHorizontal = computed(() => breakpoints.greaterOrEqual('md').value);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemDeptApi.SystemDept>();
      defaultRadioGroup.value = data?.type;
      if (data?.type === 'link') {
        data.linkSrc = data.meta?.link;
      } else if (data?.type === 'embedded') {
        data.linkSrc = data.meta?.iframeSrc;
      }
      if (data) {
        formData.value = data;
        formApi.setValues(formData.value);
        titleSuffix.value = formData.value.meta?.title
          ? $t(formData.value.meta.title)
          : '';
      } else {
        formApi.resetForm();
        titleSuffix.value = '';
      }
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const data =
      await formApi.getValues<
        Omit<SystemDeptApi.SystemDept, 'children' | 'id'>
      >();
    if (data.type === 'link') {
      data.meta = { ...data.meta, link: data.linkSrc };
    } else if (data.type === 'embedded') {
      data.meta = { ...data.meta, iframeSrc: data.linkSrc };
    }
    delete data.linkSrc;
    try {
      await (formData.value?.id
        ? updateDept(formData.value.id, data)
        : createDept(data));
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
  <Drawer class="w-full max-w-[550px]" :title="getDrawerTitle">
    <Form class="mx-4" :layout="isHorizontal ? 'horizontal' : 'vertical'" />
  </Drawer>
</template>
