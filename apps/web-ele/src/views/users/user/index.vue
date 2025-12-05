<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { Api } from '#/api/user/user';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  ElButton,
  ElCol,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElLoading,
  ElMessage,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElRow,
  ElSelect,
  ElSwitch,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  create,
  del,
  drestore,
  getGroupsList,
  getInfo,
  getList,
  setPassword,
  update,
} from '#/api/user/user';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const router = useRouter();
const dialogVisible = ref(false);
// 当前编辑的行数据
const currentRow = ref<Api.Item | null>(null);

// 弹窗表单数据（只放需要修改的字段）
const editForm = ref<Api.EditableFields>({
  id: '',
  nickname: '',
  phone: '',
  gender: 'secret' as 'female' | 'male' | 'secret',
  is_active: true,
  groups: [] as number[],
  remark: '',
});

const readonlyUserInfo = ref<Api.Item>({
  id: '',
  username: '',
  invite_code: '',
  date_joined: '',
  last_login: '',
  registration_ip: '',
  last_login_ip: '',
  order_count: 0,
  invite_count: 0,
  invited_by_nickname: '',
  source_display: '',
  is_verified: false,
  level: '',
  device_id: '',
  is_deleted: false,
  deleted_at: '',
  balance: '0.00',
});

const editFormRef = ref<any>();
const saveLoading = ref(false);

// 用户组选项（从 getGroupsList 接口获取）
const groupOptions = ref<{ id: number; name: string }[]>([]);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getList({
            page: page.currentPage,
            page_size: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: true, // 启用自定义列功能，允许用户自定义显示/隐藏表格列
      export: false, // 禁用导出功能
      refresh: true, // 禁用刷新功能
      search: true, // 禁用搜索功能
      zoom: true, // 禁用缩放功能
    },
  } as VxeTableGridOptions<Api.Item>,
});

// 获取用户组列表（页面初始化时调用一次就行）
const loadGroupOptions = async () => {
  try {
    const res = await getGroupsList(); // 你之前说这个接口已经有了
    groupOptions.value = res;
  } catch (error) {
    console.error('加载用户组失败', error);
  }
};

// 更新用户信息
async function handleSave() {
  // 1. 显示全局 loading（Element Plus 的加载遮罩）
  const loading = ElLoading.service({
    text: $t('ui.actionMessage.deleting', [readonlyUserInfo.value.username]),
    background: 'rgba(0, 0, 0, 0.7)', // 可选：半透明遮罩
    customClass: 'delete-loading', // 可选：自定义类名
  });
  update(readonlyUserInfo.value.id, editForm.value)
    .then(() => {
      // 3. 显示成功消息
      ElMessage.success($t('更新成功', [readonlyUserInfo.value.username]));
    })
    .catch((error) => {
      // 5. 删除失败：关闭 loading + 提示错误
      // ElMessage.error($t('ui.actionMessage.deleteFailed', [row.name]));
      console.error('更新失败:', error);
    })
    .finally(() => {
      // 4. 刷新列表
      onRefresh();
      loading.close();
      dialogVisible.value = false;
    });
}

function onDelete(row: Api.Item) {
  // 1. 显示全局 loading（Element Plus 的加载遮罩）
  const loading = ElLoading.service({
    text: $t('ui.actionMessage.deleting', [row.username]),
    background: 'rgba(0, 0, 0, 0.7)', // 可选：半透明遮罩
    customClass: 'delete-loading', // 可选：自定义类名
  });

  del(row.id)
    .then(() => {
      // 2. 关闭 loading
      loading.close();
      // 3. 显示成功消息
      ElMessage.success($t('ui.actionMessage.deleteSuccess', [row.username]));
      // 4. 刷新列表
      onRefresh();
    })
    .catch((error) => {
      // 5. 删除失败：关闭 loading + 提示错误
      loading.close();
      // ElMessage.error($t('ui.actionMessage.deleteFailed', [row.name]));
      console.error('Delete role failed:', error);
    })
    .finally(() => {
      // 4. 刷新列表
      onRefresh();
      dialogVisible.value = false;
    });
}

function onDrestore() {
  // 1. 显示全局 loading（Element Plus 的加载遮罩）
  const loading = ElLoading.service({
    text: $t('ui.actionMessage.deleting', [readonlyUserInfo.value.username]),
    background: 'rgba(0, 0, 0, 0.7)', // 可选：半透明遮罩
    customClass: 'delete-loading', // 可选：自定义类名
  });

  drestore(readonlyUserInfo.value.id)
    .then(() => {
      // 2. 关闭 loading
      loading.close();
      // 3. 显示成功消息
      ElMessage.success($t('用户恢复成功', [readonlyUserInfo.value.username]));
      // 4. 刷新列表
      onRefresh();
    })
    .catch((error) => {
      // 5. 删除失败：关闭 loading + 提示错误
      loading.close();
      // ElMessage.error($t('ui.actionMessage.deleteFailed', [row.name]));
      console.error('用户恢复失败:', error);
    })
    .finally(() => {
      // 4. 刷新列表
      onRefresh();
      dialogVisible.value = false;
    });
}

function onActionClick(e: OnActionClickParams<Api.Item>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

async function onEdit(row: Api.Item) {
  const res = await getInfo(row.id);
  // 设置只读信息
  readonlyUserInfo.value = {
    id: res.id,
    username: res.username,
    invite_code: res.invite_code,
    date_joined: res.date_joined,
    last_login: res.last_login,
    registration_ip: res.registration_ip,
    last_login_ip: res.last_login_ip,
    order_count: res.order_count,
    invite_count: res.invite_count,
    invited_by_nickname: res.invited_by_nickname,
    source_display: res.source_display,
    is_verified: res.is_verified,
    level: res.level,
    device_id: res.device_id,
    is_deleted: res.is_deleted,
    deleted_at: res.deleted_at,
    balance: res.balance,
  };

  // 设置可编辑表单数据
  editForm.value = {
    nickname: res.nickname,
    phone: res.phone,
    gender: res.gender,
    is_active: res.is_active,
    groups: res.groups,
    remark: res.remark,
  };
  dialogVisible.value = true;
}
function onRefresh() {
  gridApi.query();
}

function onEditBalance() {
  // formDrawerApi.setData(row).open();
  router.replace({
    path: '/wallet/user',
    query: { username: readonlyUserInfo.value.username },
  });
}

function onCreate() {
  setPasswordDialogVisible.value = true;
}
// 创建用户 和 更新密码
const FormRef = ref();
const setPasswordDialogVisible = ref(false);

const userPasswordForm = ref({
  id: '',
  username: '',
  password: '',
  confirm_password: '',
});

function onResetPassword() {
  // 1. 显示全局 loading（Element Plus 的加载遮罩）
  userPasswordForm.value.id = readonlyUserInfo.value.id;
  userPasswordForm.value.username = readonlyUserInfo.value.username;
  setPasswordDialogVisible.value = true;
  // handleClose(); // 关闭表单
}
// 创建用户和设置密码
function handleCreateAndSetpassword() {
  // 1. 表单验证
  if (!userPasswordForm.value.username) {
    ElMessage.error('用户名不能为空');
    return;
  }

  if (!userPasswordForm.value.password) {
    ElMessage.error('密码不能为空');
    return;
  }

  if (!userPasswordForm.value.confirm_password) {
    ElMessage.error('确认密码不能为空');
    return;
  }

  if (
    userPasswordForm.value.password !== userPasswordForm.value.confirm_password
  ) {
    ElMessage.error('两次输入的密码不一致');
    userPasswordForm.value.password = '';
    userPasswordForm.value.confirm_password = '';
    return;
  }

  // 2. 开启 loading
  const loading = ElLoading.service({
    text: userPasswordForm.value.id
      ? $t('ui.actionMessage.updating', [userPasswordForm.value.username])
      : $t('ui.actionMessage.creating', [userPasswordForm.value.username]),
    background: 'rgba(0, 0, 0, 0.7)',
    customClass: 'delete-loading',
  });

  // 3. 提交请求
  const promise = userPasswordForm.value.id
    ? setPassword(userPasswordForm.value)
    : create(userPasswordForm.value);

  promise
    .then(() => {
      const action = userPasswordForm.value.id ? '更新' : '创建';
      ElMessage.success(`${action}成功`);
      onRefresh();
      handleClose();
    })
    .catch((error) => {
      console.error(
        `${userPasswordForm.value.id ? '更新' : '创建'}失败:`,
        error,
      );
      ElMessage.error(
        `${userPasswordForm.value.id ? '更新' : '创建'}失败，请重试`,
      );
    })
    .finally(() => {
      loading.close(); // ✅ 确保最后关闭
    });
}

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false;
  setPasswordDialogVisible.value = false;
  editFormRef.value?.resetFields();
  FormRef.value?.resetFields();
  currentRow.value = null;
  userPasswordForm.value = {
    id: '',
    username: '',
    password: '',
    confirm_password: '',
  };
}

// 页面加载时获取一次用户组
onMounted(() => {
  loadGroupOptions();
});
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </ElButton>
      </template>
    </Grid>

    <ElDialog
      v-model="dialogVisible"
      title="编辑用户"
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <!-- 不可编辑字段（只读信息） -->
      <ElRow :gutter="24" class="read-only-info mb-6">
        <!-- 基础信息 -->
        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">用户ID：</span>
            <span class="info-value">{{ readonlyUserInfo.id }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">用户名：</span>
            <span class="info-value">{{ readonlyUserInfo.username }}</span>
          </div>
        </ElCol>

        <!-- 注册与登录 -->
        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">注册时间：</span>
            <span class="info-value">{{ readonlyUserInfo.date_joined }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">最后登录：</span>
            <span class="info-value">{{ readonlyUserInfo.last_login }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">注册来源：</span>
            <span class="info-value">{{
              readonlyUserInfo.source_display
            }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">邀请人：</span>
            <span class="info-value">{{
              readonlyUserInfo.invited_by_nickname || '—'
            }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">邀请码：</span>
            <span class="info-value">{{ readonlyUserInfo.invite_code }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">邀请人数：</span>
            <span class="info-value">{{ readonlyUserInfo.invite_count }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">注册IP：</span>
            <span class="info-value">{{
              readonlyUserInfo.registration_ip || '—'
            }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">最后登录IP：</span>
            <span class="info-value">{{
              readonlyUserInfo.last_login_ip || '—'
            }}</span>
          </div>
        </ElCol>

        <!-- 统计与状态 -->
        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">订单数：</span>
            <span class="info-value">{{ readonlyUserInfo.order_count }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">认证：</span>
            <span class="info-value">{{
              readonlyUserInfo.is_verified ? '是' : '否'
            }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">用户等级：</span>
            <span class="info-value">{{ readonlyUserInfo.level }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">设备ID：</span>
            <span class="info-value">{{
              readonlyUserInfo.device_id || '—'
            }}</span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">注销：</span>
            <span class="info-value">{{
              readonlyUserInfo.is_deleted ? '是' : '否'
            }}</span>
          </div>
        </ElCol>

        <ElCol
          v-if="readonlyUserInfo.is_deleted"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="6"
        >
          <div class="info-item">
            <span class="info-label">注销时间：</span>
            <span class="info-value">{{ readonlyUserInfo.deleted_at }}</span>
          </div>
        </ElCol>

        <!-- 如果需要恢复功能，应该另外添加 -->
        <ElCol
          v-if="readonlyUserInfo.is_deleted"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="6"
        >
          <div class="info-item">
            <span class="info-label">操作：</span>
            <span class="info-value">
              <ElButton @click="onDrestore()" text type="primary">
                注销恢复
              </ElButton>
            </span>
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">调整余额：</span>
            <span class="info-value">
              <ElButton type="primary" text @click="onEditBalance()">
                {{ readonlyUserInfo.balance }}
              </ElButton>
            </span>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="info-item">
            <span class="info-label">密码：</span>
            <span class="info-value">
              <ElButton type="primary" @click="onResetPassword" text>
                重置密码
              </ElButton>
            </span>
          </div>
        </ElCol>
      </ElRow>

      <ElForm
        ref="editFormRef"
        :model="editForm"
        label-width="100px"
        class="pt-4"
      >
        <ElRow :gutter="24">
          <!-- 只允许修改的字段（重点区分） -->
          <ElCol :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <ElFormItem label="昵称" prop="nickname">
              <ElInput v-model="editForm.nickname" placeholder="请输入昵称" />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <ElFormItem label="手机号" prop="phone">
              <ElInput v-model="editForm.phone" placeholder="请输入手机号" />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <ElFormItem label="邮箱" prop="email">
              <ElInput v-model="editForm.email" placeholder="请输入邮箱" />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <ElFormItem label="性别" prop="gender">
              <ElRadioGroup v-model="editForm.gender">
                <ElRadio label="male"> 男 </ElRadio>
                <ElRadio label="female"> 女 </ElRadio>
                <ElRadio label="secret"> 保密 </ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <ElFormItem label="是否激活" prop="is_active">
              <ElSwitch v-model="editForm.is_active" />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <ElFormItem label="用户组" prop="groups">
              <ElSelect
                v-model="editForm.groups"
                multiple
                placeholder="请选择用户组"
              >
                <ElOption
                  v-for="item in groupOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="备注" prop="remark">
              <ElInput
                v-model="editForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="handleClose">取消</ElButton>
          <ElButton type="primary" :loading="saveLoading" @click="handleSave">
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog v-model="setPasswordDialogVisible" title="重置密码">
      <template #default>
        <ElForm
          ref="FormRef"
          label-width="100px"
          :model="userPasswordForm"
          class="pt-4"
        >
          <ElFormItem label="id" prop="id">
            <ElInput v-model="readonlyUserInfo.id" placeholder="id" />
          </ElFormItem>

          <ElFormItem label="用户名" prop="username">
            <ElInput
              v-model="userPasswordForm.username"
              placeholder="请输入用户名"
              :disabled="!!readonlyUserInfo.id"
            />
          </ElFormItem>

          <ElFormItem label="密码" prop="new_password">
            <ElInput
              v-model="userPasswordForm.password"
              placeholder="请输入密码"
            />
          </ElFormItem>

          <ElFormItem label="再次输入密码" prop="confirm_password">
            <ElInput
              v-model="userPasswordForm.confirm_password"
              placeholder="再次输入密码"
            />
          </ElFormItem>
        </ElForm>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="handleClose">取消</ElButton>
          <ElButton
            type="primary"
            :loading="saveLoading"
            @click="handleCreateAndSetpassword"
          >
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </Page>
</template>
<style scoped>
/* 小屏幕：宽度 100%（实际是 100% - 边距） */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 100% !important;
    max-width: 100%;
  }
}

:deep(.el-dialog) {
  width: 800px; /* 大屏默认 */
  max-width: calc(100% - 10px); /* 防止贴边，留 16px 左右间距 */
}

.read-only-info .info-item {
  display: flex;
  align-items: center;
  min-height: 32px;
  margin-bottom: 8px;
}

.read-only-info .info-label {
  min-width: 80px;
  padding-right: 12px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
  text-align: right;
  white-space: nowrap;
}

.read-only-info .info-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}
</style>
