import { computed } from 'vue';

// const formRef = ref<InstanceType<typeof ElForm> | null>(null);

export const formRules = computed((formData: any) => ({
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
