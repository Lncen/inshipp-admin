<!-- src/components/TagSelect.vue -->
<!-- 调用方法 -->
<!-- 
在你使用 TagSelect.vue 组件时，拿到选中的数据非常简单
它通过 v-model 双向绑定实现。


<template> 
<script lang="ts" setup>
const selectedType = ref('image'); // 默认选中“图片”
const assetTypeOptions = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'file', label: '文件' },
];

</script>

 <TagSelect
          label="资产类型:"
          v-model="selectedType"
          :options="assetTypeOptions"
          size="small"
          width="35px"
          height="25px"
          compact
        />

<p>当前选中值：{{ selectedAssetType }}</p>

</template> 

-->

<script lang="ts" setup>
import { ElButton } from 'element-plus';

interface Option {
  value: number | string;
  label: string;
  disabled?: boolean;
}

interface Props {
  label?: string;
  modelValue?: number | string;
  options: Option[];
  size?: 'default' | 'large' | 'small';
  width?: string;
  height?: string;
  block?: boolean;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', val: number | string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClick = (option: Option) => {
  if (props.modelValue === option.value) return;
  if (props.disabled || option.disabled) return;
  emit('update:modelValue', option.value);
};
</script>

<template>
  <div class="flex flex-wrap items-center">
    <div class="mr-2 text-blue-500" :style="{ fontSize: '13px' }">
      {{ props.label }}
    </div>
    <div class="flex-1">
      <ElButton
        v-for="option in options"
        :key="option.value"
        :type="modelValue === option.value ? 'success' : 'default'"
        size="small"
        :style="{
          width: props.width,
          height: props.height || '28px',
          minWidth: props.width,
          fontSize: '12px',
        }"
        text
        :disabled="props.disabled || option.disabled"
        @click="handleClick(option)"
      >
        {{ option.label }}
      </ElButton>
    </div>
  </div>
</template>
