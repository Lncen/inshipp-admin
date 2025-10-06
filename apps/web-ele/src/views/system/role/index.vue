<script lang="ts" setup>
import type { SystemGroupApi } from '#/api/system/group';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElLoading,
  ElPagination,
  ElPopconfirm,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';

import { deleteGroup, getGroupList } from '#/api/system/group';
import { $t } from '#/locales';

import Form from './modules/form.vue';

const tableData = ref<SystemGroupApi.SystemGroup[]>([]);
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示的记录数
const total = ref(0); // 总记录数

// #region  API访问
function onEdit(row: SystemGroupApi.SystemGroup) {
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
const onDelete = (row: string) => {
  const loadingInstance = ElLoading.service({
    lock: true, // 是否锁定屏幕（禁止用户交互）
    text: '正在删除...', // 加载提示文本
    background: 'rgba(0, 0, 0, 0.2)', // 背景遮罩颜色
  });
  deleteGroup(row)
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
    // 添加分页参数
    const res = await getGroupList({
      page: currentPage.value,
      page_size: pageSize.value,
    });

    // 根据实际API返回结构调整
    if (res) {
      tableData.value = res.results || [];
      total.value = res.count || 0;
    }
  } catch (error) {
    console.error('获取角色列表失败:', error);
  } finally {
    // loading.value = false;
  }
}

// 分页相关方法
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchMenuList();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  fetchMenuList();
};

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

      <ElTable :data="tableData" style="width: 100%" row-key="id" lazy>
        <ElTableColumn prop="id" label="编号" width="70px" />
        <ElTableColumn prop="name" label="名称" width="120px" />
        <ElTableColumn prop="remark" label="备注" />
        <ElTableColumn prop="create_time" label="创建时间" width="100px" />
        <!-- 状态列 -->
        <ElTableColumn prop="status" label="状态" width="70px">
          <template #default="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <!-- 操作列 -->
        <ElTableColumn fixed="right" label="操作" width="130px">
          <template #default="{ row }">
            <ElSpace>
              <ElButton link @click="onEdit(row)" type="primary">修改</ElButton>
              <ElPopconfirm
                placement="bottom-end"
                width="200"
                :title="`确定删除 ${$t(row.name)} 吗？`"
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

      <!-- 分页组件 -->
      <div style="display: flex; justify-content: flex-end; margin-top: 20px">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>
  </Page>
</template>
