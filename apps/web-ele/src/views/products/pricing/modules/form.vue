<script lang="ts" setup>
import type { Api } from '#/api/products/pricing';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  ElButton,
  ElCol,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElRow,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { create, statusOptions, update } from '#/api/products/pricing';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

const DEFAULT_DATA = {
  id: undefined,
  name: '',
  description: '',
  is_default: false,
  status: 1,
  valid_period: undefined as [Date, Date] | undefined,
  created_at: '',
  updated_at: '',
  valid_period_status: '已过期',
  rules: [],
};

const formData = ref<Api.Item>({ ...DEFAULT_DATA });
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['价格模板'])
    : $t('ui.actionTitle.create', ['价格模板']);
});

function resetForm() {
  formData.value = { ...DEFAULT_DATA };
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) {
      return; // 验证失败，不继续提交
    }

    modalApi.lock();
    // const data = await formApi.getValues();
    try {
      await (formData.value?.id
        ? update(formData.value.id, formData.value as Omit<Api.Item, 'id'>)
        : create(formData.value as Omit<Api.Item, 'id'>));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.lock(false);
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const row = modalApi.getData();
      if (row) {
        const data = mapTemplateWithFullRules(row.template, row.userLevels);
        formData.value = data;
      }
    }
  },
});

/**
 * 将模板的 rules 补全为覆盖所有用户等级的完整规则列表
 * @param template 原始模板
 * @param allLevels 所有用户等级（来自 /user-level-select 接口）
 * @returns 补全后的模板（rules 已替换）
 */
function mapTemplateWithFullRules(
  template: Api.Item,
  allLevels: Api.Rule[],
): Api.Item {
  // 构建 level -> discount_rate 映射
  const ruleMap = new Map<number, number>();
  for (const rule of template.rules) {
    ruleMap.set(rule.level, rule.discount_rate);
  }

  // 构建 level -> name 映射（以防 rule 中 name 不准，优先用 allLevels 的 name）
  const levelNameMap = new Map<number, string>();
  for (const level of allLevels) {
    levelNameMap.set(level.level, level.name);
  }

  // 生成完整规则：遍历所有用户等级
  const fullRules: Api.Rule[] = allLevels.map((level) => ({
    level: level.level,
    name: levelNameMap.get(level.level) ?? level.name,
    discount_rate: ruleMap.get(level.level) ?? 10, // 默认 10
  }));

  // 返回新对象，替换 rules
  return {
    ...template,
    rules: fullRules,
  };
}

// 模板验证
const formRef = ref<InstanceType<typeof ElForm> | null>(null);
const formRules = computed(() => ({
  name: [
    {
      required: true,
      message: '此项为必填项',
      trigger: 'blur',
    },
  ],
  rules: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || !Array.isArray(value)) {
          callback(new Error('用户等级规则不能为空'));
          return;
        }

        for (const item of value) {
          const rate = Number(item.discount_rate);
          if (rate === undefined || rate === null || Number.isNaN(rate)) {
            callback(new Error(`"${item.name}" 的加价倍率必须为数字`));
            return;
          }
          if (rate < 1) {
            callback(new Error(`"${item.name}" 的加价倍率不能小于 1`));
            return;
          }
        }
        callback(); // 验证通过
      },
      trigger: 'blur', // 或 'change'
    },
  ],
  status: [
    {
      validator: (rule: any, value: any, callback: any) => {
        // 如果是默认模板，状态不能为禁用（假设禁用值为 0）
        if (formData.value.is_default === true && value === 2) {
          callback(new Error('默认模板不能被禁用'));
        } else {
          callback();
        }
      },
    },
  ],
}));
</script>

<template>
  <Modal :title="getTitle">
    <ElForm
      ref="formRef"
      :model="formData"
      label-width="80px"
      :rules="formRules"
      class="mx-4"
    >
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formData.name" />
      </ElFormItem>
      <ElRow>
        <ElCol :span="16">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" style="width: 100%">
              <ElOption
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="默认模板" prop="is_default">
            <ElSwitch v-model="formData.is_default" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElFormItem label="生效时间">
        <ElDatePicker
          v-model="formData.valid_period"
          type="datetimerange"
          range-separator="--"
          start-placeholder="开始"
          end-placeholder="结束"
        />
      </ElFormItem>

      <ElFormItem label="设置" prop="rules">
        <ElTable :data="formData.rules">
          <ElTableColumn
            label="用户等级"
            prop="name"
            width="150px"
            align="center"
          />
          <ElTableColumn
            label="加价(倍率)"
            prop="discount_rate"
            width="150px"
            align="center"
          >
            <template #default="{ row }">
              <ElInput
                v-model="row.discount_rate"
                :input-style="{ textAlign: 'center' }"
                style="width: 100px"
              />
            </template>
          </ElTableColumn>
        </ElTable>
      </ElFormItem>
    </ElForm>

    <template #prepend-footer>
      <div class="flex-auto">
        <ElButton type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </template>
  </Modal>
</template>
<style scoped>
.demo-datetime-picker {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: 0;
}

.block {
  flex: 1;
  min-width: 300px;
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
}

.block:last-child {
  border-right: none;
}

.block .demonstration {
  display: block;
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .block {
    flex: 100%;
    border-right: none;
    border-bottom: solid 1px var(--el-border-color);
  }

  .block:last-child {
    border-bottom: none;
  }

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  :deep(.el-date-editor.el-input__wrapper) {
    width: 100%;
    max-width: 300px;
  }
}
</style>
