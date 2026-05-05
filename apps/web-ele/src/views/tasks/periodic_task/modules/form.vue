<script lang="ts" setup>
import type { Api } from '#/api/tasks/periodic_task';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  ElButton,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElRow,
  ElSelect,
  ElSwitch,
  ElText,
  ElTooltip,
} from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { create, update } from '#/api/tasks/periodic_task';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

const DEFAULT_TASK_DATA = {
  id: undefined, // 或者不包含 id（新建时通常无 ID）
  name: '',
  task: '',
  interval: null,
  crontab: null,
  solar: null,
  clocked: null,
  one_off: false,
  last_run_at: '',

  args: '[]',
  kwargs: '{}',

  queue: '',
  exchange: '',
  routing_key: '',
  headers: '{}',
  priority: 0,
  expires: undefined,
  expire_seconds: '',

  start_time: '',
  enabled: true,

  total_run_count: 0,
  date_changed: '',
  description: '',
  objects: '',
};

// 配置数据
const taskConfig = ref();
// 统一使用 formData 作为唯一数据源
const formData = ref<Api.Item>(DEFAULT_TASK_DATA);

// 添加缺失的调度类型响应式变量
const scheduleTypeId = ref({ type: 'interval', selectedScheduleId: undefined });

// 根据传入的数据确定调度类型
const determineScheduleType = (
  data: Api.Item,
): { selectedScheduleId: any; type: string } => {
  if (data.interval !== null)
    return { type: 'interval', selectedScheduleId: data.interval };
  if (data.crontab !== null)
    return { type: 'crontab', selectedScheduleId: data.crontab };
  if (data.solar !== null)
    return { type: 'solar', selectedScheduleId: data.solar };
  if (data.clocked !== null)
    return { type: 'clocked', selectedScheduleId: data.clocked };
  return { type: 'interval', selectedScheduleId: data.interval };
};

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dept.name')])
    : $t('ui.actionTitle.create', [$t('system.dept.name')]);
});

const [, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    buildFormData();

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
      const data = modalApi.getData<any>();
      taskConfig.value = data.taskConfig;

      if (data.rowData) {
        formData.value = data.rowData; // 更新主数据源
        scheduleTypeId.value = determineScheduleType(data.rowData);
      } else {
        // 如果没有数据（创建模式），重置为初始值
        formData.value = DEFAULT_TASK_DATA;
        scheduleTypeId.value = {
          type: 'interval',
          selectedScheduleId: undefined,
        };
        formApi.resetForm();
      }
      ScheduleTypeChange();
    }
  },
});

// 处理调度类型改变
// const selectedSchedule = ref();
const scheduleOptions = ref<{ id: number; schedule_display: string }[]>();

const ScheduleTypeChange = () => {
  switch (scheduleTypeId.value.type) {
    case 'clocked': {
      scheduleOptions.value = taskConfig.value.clocked; // 如果有的话
      break;
    }
    case 'crontab': {
      scheduleOptions.value = taskConfig.value.crontab; // 如果有的话
      break;
    }
    case 'interval': {
      scheduleOptions.value = taskConfig.value.interval; // 如果有的话
      break;
    }
    case 'solar': {
      scheduleOptions.value = taskConfig.value.solar;
      break;
    }
  }
};
const handleScheduleTypeChange = () => {
  scheduleTypeId.value.selectedScheduleId = undefined;
  ScheduleTypeChange();
};

// 修改buildFormData函数
const buildFormData = () => {
  // 清空所有调度类型字段
  formData.value.interval = null;
  formData.value.crontab = null;
  formData.value.solar = null;
  formData.value.clocked = null;

  // 使用类型安全的赋值方式
  const currentType = scheduleTypeId.value.type;
  const selectedScheduleId = scheduleTypeId.value.selectedScheduleId;

  // 明确处理每种情况
  switch (currentType) {
    case 'clocked': {
      formData.value.clocked = selectedScheduleId ?? null;
      break;
    }
    case 'crontab': {
      formData.value.crontab = selectedScheduleId ?? null;
      break;
    }
    case 'interval': {
      formData.value.interval = selectedScheduleId ?? null;
      break;
    }
    case 'solar': {
      formData.value.solar = selectedScheduleId ?? null;
      break;
    }
    default: {
      // 默认处理
      formData.value.interval = selectedScheduleId ?? null;
    }
  }
};

const onPreview = () => {
  console.warn('预览');
};

const onAdd = () => {
  console.warn('添加');
};

const onEdit = () => {
  console.warn('编辑');
};
</script>

<template>
  <Modal :title="getTitle" class="w-full max-w-[700px]">
    <ElForm label-width="120px" label-position="right">
      <!-- 基本信息 -->
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="formData.name" placeholder="名称" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="执行函数">
            <ElSelect
              v-model="formData.task"
              placeholder="请选择执行函数"
              style="width: 240px"
            >
              <ElOption
                v-for="item in taskConfig.tasks"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              >
                <ElTooltip
                  :content="item.description || item.name"
                  placement="right"
                >
                  <span>{{ item.name }}</span>
                </ElTooltip>
              </ElOption>
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="启用状态">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="仅执行一次">
            <ElSwitch v-model="formData.one_off" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 调度类型 -->
      <ElFormItem label="调度类型" required>
        <ElRadioGroup
          v-model="scheduleTypeId.type"
          @change="handleScheduleTypeChange"
        >
          <ElRadio value="interval">间隔时间</ElRadio>
          <ElRadio value="crontab">计划时间</ElRadio>
          <ElRadio value="solar">日程事件</ElRadio>
          <ElRadio value="clocked">定时</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="执行时机" required>
        <!-- Interval 调度 -->

        <div class="input-group">
          <!-- 下拉选择框 -->
          <ElSelect
            v-model="scheduleTypeId.selectedScheduleId"
            placeholder="请选择执行时间"
            class="schedule-select"
            style="width: 300px"
          >
            <ElOption
              v-for="item in scheduleOptions"
              :key="item.id"
              :label="item.schedule_display"
              :value="item.id"
            />
          </ElSelect>

          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <!-- 编辑按钮 -->
            <ElButton type="primary" circle size="small" @click="onEdit">
              >
            </ElButton>

            <!-- 新增按钮（绿色） -->
            <ElButton type="success" circle size="small" @click="onAdd" />

            <!-- 查看/预览按钮 -->
            <ElButton type="info" circle size="small" @click="onPreview" />
          </div>
        </div>
      </ElFormItem>

      <ElFormItem label="开始时间">
        <ElDatePicker
          v-model="formData.start_time"
          type="datetime"
          placeholder="选择开始时间"
          style="width: 100%"
        />
      </ElFormItem>
      <ElRow :gutter="24">
        <ElCol :span="10">
          <ElFormItem label="上次执行时间:">
            <ElText>{{ formData.last_run_at }}</ElText>
          </ElFormItem>
        </ElCol>
        <ElCol :span="10">
          <ElFormItem label="总运行次数:">
            <ElText>{{ formData.total_run_count }}</ElText>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="24">
        <ElCol :span="24">
          <ElFormItem label="描述">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="任务详细描述（可选）"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 高级配置 -->
      <ElCollapse>
        <ElCollapseItem title="高级配置">
          <ElRow :gutter="24">
            <ElCol :span="24">
              <ElFormItem label="位置参数 (args)">
                <ElInput
                  v-model="formData.args"
                  type="textarea"
                  :rows="3"
                  placeholder="['arg1', 'arg2']"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="关键字参数 (kwargs)">
                <ElInput
                  v-model="formData.kwargs"
                  type="textarea"
                  :rows="3"
                  placeholder="{'key': 'value'}"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="20">
            <ElCol :span="12">
              <ElFormItem label="队列 (queue)">
                <ElInput
                  v-model="formData.queue"
                  placeholder="留空使用默认队列"
                  clearable
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="优先级 (0-255)">
                <ElInputNumber
                  style="width: 100%"
                  v-model="formData.priority"
                  :min="0"
                  :max="255"
                  placeholder="默认不设置"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="过期时间">
                <ElDatePicker
                  v-model="formData.expires"
                  type="datetime"
                  placeholder="选择过期时间"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="过期时间间隔">
                <ElInputNumber
                  style="width: 100%"
                  v-model="formData.expire_seconds"
                  :min="0"
                  placeholder="默认不设置(秒)"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="交换器">
                <ElInput
                  v-model="formData.exchange"
                  placeholder="覆盖交换机进行低层级AMQP路由"
                  clearable
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="路由">
                <ElInput
                  v-model="formData.routing_key"
                  placeholder="覆盖路由键进行低层级AMQP路由"
                  clearable
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="AMQP消息头">
            <ElInput
              v-model="formData.headers"
              type="textarea"
              :rows="3"
              placeholder="{'key': 'value'}"
            />
          </ElFormItem>
        </ElCollapseItem>
      </ElCollapse>
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
.input-group {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}

.schedule-select {
  --el-select-border-color: transparent;

  flex: 1;
  color: #e5e7eb;
}

.schedule-select :deep(.el-input__wrapper) {
  height: 38px;
  color: #e5e7eb;
  background-color: transparent;
  border: none;
  box-shadow: none;
}

.action-buttons {
  display: flex;
  gap: 6px;
  padding-right: 4px;
}

.action-buttons .el-button {
  --el-button-bg-color: #3a3a3a;
  --el-button-hover-bg-color: #4a4a4a;
  --el-button-active-bg-color: #555;
}
</style>
