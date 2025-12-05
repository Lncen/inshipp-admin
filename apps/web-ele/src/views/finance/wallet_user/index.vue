<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { Api as Api__wallet } from '#/api/finance/wallet';
import type { Api } from '#/api/finance/wallet_user';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElOptionGroup,
  ElSelect,
  ElTag,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getList as getuser__wallet } from '#/api/finance/wallet';
import { getList } from '#/api/finance/wallet_user';
import { $t } from '#/locales';
import AdminMoneyDialog from '#/modules/AdminMoneyDialog.vue';

import { useColumns } from './data';

const route = useRoute();
// ==================== 钱包详情 ====================
const user_wallet_detail = ref<Partial<Api__wallet.Item>>({
  user_id: '',
  username: '',
  balance: '',
  frozen_balance: '',
  is_active: false,
  created_at: '',
});
const wallet_detail_Form = async () => {
  const keyword = searchForm.value.username;
  if (keyword) {
    const res = await getuser__wallet({
      keyword,
      page: 1,
      page_size: 10,
    });
    user_wallet_detail.value = res.results?.[0] ?? {};
  }
};

// ==================== 表单数据 ====================
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
  user_wallet_detail.value = {};
  gridApi.reload();
};

// ==================== 查询 ====================
const handleSearch = () => {
  const params: any = {
    username: searchForm.value.username || undefined,
    reference_id: searchForm.value.reference_id || undefined,
    remark: searchForm.value.remark || undefined,
    type: searchForm.value.type || undefined,
    created_at_min: searchForm.value.timestamp[0] || undefined,
    created_at_max: searchForm.value.timestamp[1] || undefined,
  };

  gridApi.query(params);
};

// ==================== 表格 ====================
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    // height: 'auto',
    minHeight: 400, // 设置最低高度
    keepSource: true,
    pagerConfig: {
      pageSize: 10, // 设置默认每页显示10条
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const params: any = {
            page: page.currentPage,
            page_size: page.pageSize, // 默认改为10
            username: searchForm.value.username || undefined,
            reference_id: searchForm.value.reference_id || undefined,
            remark: searchForm.value.remark || undefined,
            type: searchForm.value.type || undefined,
            created_at_min: searchForm.value.timestamp[0] || undefined,
            created_at_max: searchForm.value.timestamp[1] || undefined,
          };

          if (params.username) {
            await wallet_detail_Form();
            return await getList(params);
          }
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
};

const isComposing = ref(false);
function onInput() {
  // 搜索栏输入用户名时自动触发搜索
  // 英文输入或中文已确认，可以执行搜索等操作
  // 如果正在中文输入（IME 组合中），不处理
  // if (isComposing.value) return;
  // handleSearch();
}
// 校验规则：必填
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    // 如果希望在 change 或 submit 时校验，可加 trigger: 'change'
  ],
};

onMounted(() => {
  // 获取传递的参数
  const username = route.query.username;

  searchForm.value.username = username as string;
  handleSearch();
});
</script>

<template>
  <Page auto-content-height>
    <!-- 自定义搜索栏（纯模板语法） -->
    <div class="mb-2 rounded-lg shadow-sm">
      <ElCard>
        <ElForm
          :inline="true"
          :model="searchForm"
          :rules="rules"
          label-width="80px"
        >
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

    <ElCard class="mb-2">
      <ElDescriptions class="margn-top" title="详细" :column="3" border>
        <template #extra>
          <ElButton type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('finance.wallets.Adjust') }}
          </ElButton>
        </template>
        <ElDescriptionsItem>
          <template #label>
            <div class="cell-item">用户名</div>
          </template>
          {{ user_wallet_detail.username }}
        </ElDescriptionsItem>

        <ElDescriptionsItem>
          <template #label>
            <div class="cell-item">状态</div>
          </template>
          <div v-if="user_wallet_detail.username !== ''">
            <ElTag
              type="success"
              effect="plain"
              v-if="user_wallet_detail.is_active === true"
            >
              <strong>正常</strong>
            </ElTag>
            <ElTag
              type="danger"
              effect="plain"
              v-else-if="user_wallet_detail.is_active === false"
            >
              <strong>异常</strong>
            </ElTag>
          </div>
        </ElDescriptionsItem>

        <ElDescriptionsItem>
          <template #label>
            <div class="cell-item">冻结余额</div>
          </template>
          {{ user_wallet_detail.frozen_balance }}
        </ElDescriptionsItem>

        <ElDescriptionsItem>
          <template #label>
            <div class="cell-item">可用余额</div>
          </template>
          {{ user_wallet_detail.balance }}
        </ElDescriptionsItem>
        <ElDescriptionsItem>
          <template #label>
            <div class="cell-item">创建时间</div>
          </template>
          {{ user_wallet_detail.created_at }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

    <!-- 表格 + 工具栏 -->
    <Grid :table-title="$t('finance.wallets.wallet_detail')" />

    <!-- 调账弹窗 -->
    <AdminMoneyDialog
      v-model:visible="centerDialogVisible"
      :username="searchForm.username"
      @success="(username: string) => onRefresh(username)"
    />
  </Page>
</template>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}

.cell-item {
  display: flex;
  align-items: center;
}
</style>
