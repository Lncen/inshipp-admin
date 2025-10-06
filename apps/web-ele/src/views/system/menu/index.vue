<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import {
  ElButton,
  ElCard,
  ElLoading,
  ElPopconfirm,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { deleteMenu, getMenuList, SystemMenuApi } from '#/api/system/menu';
import { $t } from '#/locales';

import Form from './modules/form.vue';

const tableData = ref<SystemMenuApi.SystemMenu[]>([]);

// #region 类型字段设置标签
type RouteType = 'danger' | 'info' | 'primary' | 'success' | 'warning';
// 类型映射
const ROUTE_TYPE_CHOICES: {
  key: string;
  label: string;
  tagType: RouteType;
}[] = [
  { key: 'menu', label: '菜单', tagType: 'primary' },
  { key: 'catalog', label: '目录', tagType: 'success' },
  { key: 'button', label: '按钮', tagType: 'info' },
  { key: 'embedded', label: '页面', tagType: 'warning' },
  { key: 'link', label: '链接', tagType: 'danger' },
];
// 辅助函数
function getTypeTagType(type: string): RouteType {
  const choice = ROUTE_TYPE_CHOICES.find((item) => item.key === type);
  return choice ? choice.tagType : 'info'; // 默认返回 'info'
}

function getTypeTagName(type: RouteType) {
  const choice = ROUTE_TYPE_CHOICES.find((item) => item.key === type);
  return choice ? choice.label : '未知';
}
// #endregion

// #region  API访问
function onEdit(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData(row).open();
}
function onCreate() {
  formDrawerApi
    .setData({
      // 新建默认选中目录选项
      type: 'catalog',
    })
    .open();
}
function onAppend(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData({ pid: row.id, type: 'menu' }).open();
}
const onDelete = (row: string) => {
  const loadingInstance = ElLoading.service({
    lock: true, // 是否锁定屏幕（禁止用户交互）
    text: '正在删除...', // 加载提示文本
    background: 'rgba(0, 0, 0, 0.2)', // 背景遮罩颜色
  });
  deleteMenu(row)
    .then(() => {
      fetchMenuList();
    })
    .catch(() => {})
    .finally(() => {
      loadingInstance.close(); // 手动关闭 Loading
    });
};
// #endregion

// #region 数据加载
async function fetchMenuList() {
  // loading.value = true;
  try {
    const res = await getMenuList();
    tableData.value = res || [];
  } catch (error) {
    console.error('获取菜单列表失败:', error);
  } finally {
    // loading.value = false;
  }
}

const handleRefresh = () => {
  // 刷新数据
  fetchMenuList();
};

// #endregion

// #region  抽屉组件
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const onRefresh = () => {
  fetchMenuList();
};
// #endregion

onMounted(() => {
  fetchMenuList();
});
</script>

<template>
  <Page>
    <FormDrawer @success="onRefresh" @onclose="onRefresh" />
    <ElCard>
      <div align="right">
        <ElButton type="primary" @click="onCreate">新增</ElButton>
        <ElButton type="primary" @click="handleRefresh">刷新</ElButton>
      </div>

      <ElTable
        :data="tableData"
        style="width: 100%"
        row-key="id"
        lazy
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <ElTableColumn prop="id" label="编号" width="140px" min-width="140px" />
        <!-- 标题列 -->
        <ElTableColumn label="标题" width="230">
          <template #default="{ row }">
            <ElSpace>
              <div class="size-5">
                <IconifyIcon
                  v-if="row.type === 'button'"
                  icon="carbon:security"
                  class="size-full"
                />
                <IconifyIcon
                  v-else-if="row.meta?.icon"
                  :icon="row.meta?.icon || 'carbon:circle-dash'"
                  class="size-full"
                />
              </div>
              {{ $t(row.meta?.title) }}
            </ElSpace>
          </template>
        </ElTableColumn>

        <!-- 类型列 -->
        <ElTableColumn prop="type" label="类型" width="70px" align="left">
          <template #default="{ row }">
            <ElTag :type="getTypeTagType(row.type)">
              {{ getTypeTagName(row.type) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 其他列 -->
        <ElTableColumn
          prop="perm"
          label="权限"
          width="140px"
          min-width="100px"
        />

        <ElTableColumn prop="path" label="路由地址" width="180px" />
        <ElTableColumn prop="component" label="页面组件" min-width="240px" />

        <!-- 状态列 -->
        <ElTableColumn prop="status" label="状态" width="70px">
          <template #default="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 操作列 -->
        <ElTableColumn
          fixed="right"
          label="操作"
          header-align="left"
          align="right"
          width="170px"
        >
          <template #default="{ row }">
            <ElSpace>
              <ElButton link @click="onAppend(row)" type="primary">
                新增下级
              </ElButton>
              <ElButton link @click="onEdit(row)" type="primary">修改</ElButton>
              <ElPopconfirm
                placement="bottom-end"
                width="200"
                :title="`确定删除 ${$t(row.meta?.title)} 吗？`"
                @confirm="onDelete(row.id)"
              >
                <template #reference>
                  <ElButton type="danger" link>删除</ElButton>
                </template>
              </ElPopconfirm>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </Page>
</template>
