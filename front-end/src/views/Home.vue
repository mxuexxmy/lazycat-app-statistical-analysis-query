<template>
  <div class="home-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>应用列表</span>
          <el-button type="primary" @click="syncApps">同步应用</el-button>
        </div>
      </template>
      <vxe-table
        :data="appList"
        :loading="loading"
        border
        height="600"
      >
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="name" title="应用名称"></vxe-column>
        <vxe-column field="developer" title="开发者"></vxe-column>
        <vxe-column field="category" title="分类"></vxe-column>
        <vxe-column field="createTime" title="上架时间"></vxe-column>
      </vxe-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const appList = ref([])
const loading = ref(false)

const syncApps = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/app/list')
    appList.value = response.data
  } catch (error) {
    console.error('Failed to sync apps:', error)
    ElMessage.error('同步应用失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  syncApps()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 