<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api } from '#/api/finance/wallet_user';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElOptionGroup,
  ElSelect,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getList } from '#/api/finance/wallet_user';
import { $t } from '#/locales';
import AdminMoneyDialog from '#/modules/AdminMoneyDialog.vue';

import { useColumns } from './data';

// ==================== 搜索表单数据 ====================
const searchForm = ref({
  username: '',
  reference_id: '',
  remark: '',
  type: '',
  timestamp: [] as string[], // [start, end]
});

// ==================== 重置表单 ====================
const resetForm = () => {
  searchForm.value = {
    username: '',
    reference_id: '',
    remark: '',
    type: '',
    timestamp: [],
  };
};

// ==================== 查询 ====================
const handleSearch = () => {
  const params: any = {
    page: 1,
    page_size: 10, // 默认改为10
    username: searchForm.value.username || undefined,
    reference_id: searchForm.value.reference_id || undefined,
    remark: searchForm.value.remark || undefined,
    type: searchForm.value.type || undefined,
  };

  // 时间范围处理
  if (searchForm.value.timestamp?.length === 2) {
    params.start_date = searchForm.value.timestamp[0];
    params.end_date = searchForm.value.timestamp[1];
  }
  // 重点：把 params 传进去！
  gridApi.query(params);
};

// ==================== 表格 ====================
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const params: any = {
            page: page.currentPage,
            page_size: 10, // 默认改为10
            username: searchForm.value.username || undefined,
            reference_id: searchForm.value.reference_id || undefined,
            remark: searchForm.value.remark || undefined,
            type: searchForm.value.type || undefined,
          };

          // 时间范围处理
          if (searchForm.value.timestamp?.length === 2) {
            params.start_date = searchForm.value.timestamp[0];
            params.end_date = searchForm.value.timestamp[1];
          }

          return await getList(params);
        },
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: false, // 我们自己写搜索栏，关闭内置
      zoom: true,
    },
  } as VxeTableGridOptions<Api.Item>,
});

// ==================== 弹窗 ====================
const centerDialogVisible = ref(false);
const onCreate = () => {
  // if (!searchForm.value.username?.trim()) {
  //   ElMessage.warning('请先输入用户名');
  //   return;
  // }
  centerDialogVisible.value = true;
};

const onRefresh = (username: string) => {
  searchForm.value.username = username;
  handleSearch();
  resetForm();
};

const isComposing = ref(false);
function onInput() {
  // 如果正在中文输入（IME 组合中），不处理
  if (isComposing.value) return;
  // 英文输入或中文已确认，可以执行搜索等操作
  handleSearch();
}
</script>

<template>
  <Page auto-content-height>
    <!-- 自定义搜索栏（纯模板语法） -->
    <div class="mb-2 rounded-lg border shadow-sm">
      <ElCard>
        <ElForm :inline="true" :model="searchForm" label-width="80px">
          <ElFormItem label="用户名">
            <ElInput
              v-model="searchForm.username"
              placeholder="输入用户名"
              clearable
              @compositionstart="isComposing = true"
              @input="onInput"
            />
          </ElFormItem>

          <ElFormItem label="订单号">
            <ElInput
              v-model="searchForm.reference_id"
              placeholder="输入订单号"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="备注">
            <ElInput
              v-model="searchForm.remark"
              placeholder="输入备注内容"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="交易类型">
            <ElSelect
              v-model="searchForm.type"
              placeholder="全部类型"
              clearable
              style="width: 150px"
            >
              <ElOption label="全部类型" value="" />
              <ElOptionGroup label="收入类">
                <ElOption label="用户充值" :value="1" />
                <ElOption label="退款入账" :value="4" />
                <ElOption label="收到转账" :value="31" />
                <ElOption label="后台加款" :value="11" />
                <ElOption label="活动奖励" :value="21" />
                <ElOption label="红包/返利" :value="22" />
              </ElOptionGroup>
              <ElOptionGroup label="支出类">
                <ElOption label="用户提现" :value="2" />
                <ElOption label="转账支出" :value="32" />
                <ElOption label="平台消费" :value="41" />
                <ElOption label="手续费扣除" :value="51" />
                <ElOption label="后台扣款" :value="12" />
                <ElOption label="强制没收" :value="99" />
                <ElOption label="违规处罚" :value="98" />
              </ElOptionGroup>
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="时间范围">
            <ElDatePicker
              v-model="searchForm.timestamp"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :shortcuts="[
                {
                  text: '今天',
                  value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setHours(0, 0, 0, 0);
                    return [start, end];
                  },
                },
                {
                  text: '昨天',
                  value: () => {
                    const end = new Date();
                    end.setDate(end.getDate() - 1);
                    end.setHours(23, 59, 59, 999);
                    const start = new Date(end);
                    start.setHours(0, 0, 0, 0);
                    return [start, end];
                  },
                },
                {
                  text: '近7天',
                  value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    return [start, end];
                  },
                },
                {
                  text: '近30天',
                  value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    return [start, end];
                  },
                },
              ]"
            />
          </ElFormItem>

          <ElFormItem>
            <ElButton type="primary" @click="handleSearch"> 查询 </ElButton>
            <ElButton @click="resetForm"> 重置 </ElButton>
          </ElFormItem>
        </ElForm>
      </ElCard>
    </div>

    <!-- 表格 + 工具栏 -->
    <Grid :table-title="$t('finance.wallets.wallet_detail')">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('finance.wallets.Adjust') }}
        </ElButton>
      </template>
    </Grid>

    <!-- 调账弹窗 -->
    <AdminMoneyDialog
      v-model:visible="centerDialogVisible"
      :username="searchForm.username"
      @success="(username: string) => onRefresh(username)"
      @update:visible="(val: boolean) => !val && resetForm()"
    />
  </Page>
</template>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
