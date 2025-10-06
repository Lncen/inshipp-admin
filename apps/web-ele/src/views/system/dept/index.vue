<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';

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

import { deleteDept, getDeptList } from '#/api/system/dept';

import Form from './modules/form.vue';

const tableData = ref<SystemDeptApi.SystemDept[]>([]);
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示的记录数
const total = ref(0); // 总记录数

// #region API访问
function onEdit(row: SystemDeptApi.SystemDept) {
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
function onAppend(row: SystemDeptApi.SystemDept) {
  formDrawerApi.setData({ pid: row.id, type: 'menu' }).open();
}
const onDelete = (row: string) => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在删除...',
    background: 'rgba(0, 0, 0, 0.2)',
  });
  deleteDept(row)
    .then(() => {
      fetchMenuList();
    })
    .catch(() => {})
    .finally(() => {
      loadingInstance.close();
    });
};
// #endregion

// #region 数据加载
async function fetchMenuList() {
  try {
    // 如果API支持分页，需要传入分页参数
    const res = await getDeptList({
      page: currentPage.value,
      page_size: pageSize.value,
    });
    // 根据实际API返回结构调整
    if (res) {
      // 假设返回的是 { list: [], total: number } 结构
      tableData.value = res.results;
      total.value = res.count || 0;
    }
  } catch (error) {
    console.error('获取部门列表失败:', error);
  }
}

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
  fetchMenuList();
};
// #endregion

// #region 抽屉组件
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
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <ElTableColumn prop="name" label="部门名称" width="150px" />

        <ElTableColumn prop="markup_type" label="加价类型" width="100px">
          <template #default="{ row }">
            <ElTag v-if="row.markup_type === 'percentage'">百分比</ElTag>
            <ElTag v-else>固定</ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="percentage" label="加价比例" width="100px" />
        <ElTableColumn prop="fixed" label="固定加价" width="100px" />

        <!-- 状态列 -->
        <ElTableColumn prop="status" label="状态" width="80px">
          <template #default="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="create_time" label="创建时间" width="150px" />
        <ElTableColumn prop="remark" label="备注" />
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
                :title="`确定删除 ${row.name} 吗？`"
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
