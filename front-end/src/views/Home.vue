<template>
  <div class="home-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-area">
            <el-input
              v-model="searchKey"
              placeholder="搜索应用名称/开发者/描述"
              style="width: 300px"
              clearable
              @clear="handleSearch"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              clearable
              style="margin-left: 10px; width: 150px"
              @change="handleSearch"
            >
              <el-option
                v-for="cat in allCategories"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
            <el-select
              v-model="platformFilter"
              placeholder="支持平台"
              clearable
              style="margin-left: 10px; width: 150px"
              @change="handleSearch"
            >
              <el-option label="PC" value="pc" />
              <el-option label="移动端" value="mobile" />
            </el-select>
          </div>
          <el-button type="primary" @click="syncApps" :loading="loading">
            同步应用
          </el-button>
        </div>
      </template>
      
      <!-- 调试信息 -->
      <div v-if="apps.length === 0" class="debug-info">
        <p>当前没有数据</p>
        <p>Loading 状态: {{ loading }}</p>
      </div>

      <vxe-table
        v-else
        ref="xTable"
        :data="filteredApps"
        :loading="loading"
        border
        stripe
        height="600"
        :scroll-y="scrollConfig"
        :row-config="{ isHover: true }"
        :border-config="{ showHeaderOverflow: true, showOverflow: true }"
        :sort-config="{ trigger: 'cell', remote: false }"
      >
        <vxe-column type="seq" width="60" title="序号"></vxe-column>
        <vxe-column field="name" title="应用名称" min-width="120" sortable show-overflow></vxe-column>
        <vxe-column field="brief" title="简介" min-width="120" show-overflow></vxe-column>
        <vxe-column field="creator" title="开发者" min-width="100" sortable show-overflow></vxe-column>
        <vxe-column field="category" title="分类" min-width="120" show-overflow>
          <template #default="{ row }">
            {{ Array.isArray(row.category) ? row.category.join(', ') : row.category }}
          </template>
        </vxe-column>
        <vxe-column field="updateDate" title="更新时间" min-width="160" sortable>
          <template #default="{ row }">
            {{ formatDate(row.updateDate) }}
          </template>
        </vxe-column>
        <vxe-column field="version" title="版本" min-width="80" show-overflow></vxe-column>
        <vxe-column title="支持平台" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row.supportPC" size="small" type="success" style="margin-right: 4px">PC</el-tag>
            <el-tag v-if="row.supportMobile" size="small" type="success">移动端</el-tag>
          </template>
        </vxe-column>
        <vxe-column field="price" title="价格" min-width="80" sortable>
          <template #default="{ row }">
            {{ row.price === 0 ? '免费' : `￥${row.price}` }}
          </template>
        </vxe-column>
        <vxe-column field="description" title="详细描述" min-width="300" show-overflow></vxe-column>
      </vxe-table>

      <!-- 分页 -->
      <vxe-pager
        v-if="filteredApps.length > 0"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredApps.length"
        :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
        @page-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'
import { VXETable } from 'vxe-table'

const appStore = useAppStore()
const { apps, loading } = storeToRefs(appStore)
const { syncApps } = appStore

// 搜索和筛选
const searchKey = ref('')
const selectedCategory = ref('')
const platformFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 虚拟滚动配置
const scrollConfig = {
  enabled: true, // 启用虚拟滚动
  gt: 30, // 当数据超过 30 条时启用
  oSize: 6, // 缓冲区域的数据条数
  scrollToTopOnChange: true // 当数据变化时滚动到顶部
}

// 获取所有分类
const allCategories = computed(() => {
  const categories = new Set()
  for (const app of apps.value) {
    if (Array.isArray(app.category)) {
      for (const cat of app.category) {
        categories.add(cat)
      }
    }
  }
  return Array.from(categories)
})

// 过滤后的应用列表
const filteredApps = computed(() => {
  let result = apps.value

  // 搜索关键字过滤
  if (searchKey.value) {
    const key = searchKey.value.toLowerCase()
    result = result.filter(app => 
      app.name?.toLowerCase().includes(key) ||
      app.creator?.toLowerCase().includes(key) ||
      app.description?.toLowerCase().includes(key) ||
      app.brief?.toLowerCase().includes(key)
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    result = result.filter(app => 
      Array.isArray(app.category) && app.category.includes(selectedCategory.value)
    )
  }

  // 平台过滤
  if (platformFilter.value) {
    result = result.filter(app => 
      platformFilter.value === 'pc' ? app.supportPC : app.supportMobile
    )
  }

  return result
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理分页
const handlePageChange = ({ currentPage: newPage, pageSize: newSize }) => {
  currentPage.value = newPage
  pageSize.value = newSize
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听数据变化
watch(apps, (newApps) => {
  console.log('Apps data changed:', newApps)
  currentPage.value = 1
}, { deep: true })

// 组件挂载时自动同步数据
onMounted(() => {
  console.log('Component mounted, syncing apps...')
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

.search-area {
  display: flex;
  align-items: center;
}

.debug-info {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.debug-info p {
  margin: 5px 0;
  color: #666;
}

:deep(.el-tag) {
  margin: 2px;
}

:deep(.vxe-pager) {
  margin-top: 20px;
}

:deep(.vxe-table--render-default .vxe-body--row) {
  height: 48px;
}
</style> 