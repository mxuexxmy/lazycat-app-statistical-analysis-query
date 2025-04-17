<template>
  <div class="developer-ranking-container">
    <div class="header-actions">
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="syncApps"
        size="small"
      >
        <el-icon><Refresh /></el-icon>
        同步数据
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <el-result
        icon="error"
        title="加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="syncApps">重试</el-button>
        </template>
      </el-result>
    </div>

    <!-- 开发者排名列表 -->
    <div v-else class="ranking-list">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="title">开发者排行榜</span>
            <el-tag type="info" effect="plain">
              共 {{ developers.length }} 位开发者
            </el-tag>
          </div>
        </template>

        <vxe-table 
          :data="developers" 
          :row-config="{
            height: 60,
            isHover: true
          }"
          :column-config="{
            resizable: true
          }"
          :scroll-x="{
            enabled: true
          }"
          :scroll-y="{
            enabled: true,
            gt: isMobile ? 400 : 600
          }"
        >
          <vxe-column type="seq" title="排名" width="60" fixed="left">
            <template #default="{ rowIndex }">
              <div class="rank-cell">
                <span :class="['rank-number', getRankClass(rowIndex + 1)]">
                  {{ rowIndex + 1 }}
                </span>
              </div>
            </template>
          </vxe-column>
          
          <vxe-column field="name" title="开发者名称" min-width="180" fixed="left">
            <template #default="{ row }">
              <div class="developer-info">
                <el-avatar 
                  :size="32" 
                  :src="row.avatar"
                  :alt="row.name"
                >
                  {{ row.name.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="developer-detail">
                  <span class="name">{{ row.name }}</span>
                  <small class="apps-count">{{ row.appCount }} 个应用</small>
                </div>
              </div>
            </template>
          </vxe-column>
          
          <vxe-column 
            field="appCount" 
            title="应用数量" 
            width="95" 
            sortable
            v-if="!isMobile"
          >
            <template #default="{ row }">
              <el-tag size="small" type="success" effect="plain">{{ row.appCount }}</el-tag>
            </template>
          </vxe-column>
          
          <vxe-column 
            field="totalDownloads" 
            title="总下载量" 
            width="100" 
            sortable
            v-if="!isMobile"
          >
            <template #default="{ row }">
              <span>{{ formatNumber(row.totalDownloads) }}</span>
            </template>
          </vxe-column>
          
          <vxe-column 
            field="averageRating" 
            title="平均评分" 
            width="150" 
            sortable
          >
            <template #default="{ row }">
              <div class="rating-cell">
                <el-rate 
                  v-model="row.averageRating" 
                  disabled 
                  :max="5"
                  :colors="['#ffd21e', '#ffd21e', '#ffd21e']"
                  :size="isMobile ? 'small' : 'default'"
                />
                <span class="rating-score">{{ row.averageRating.toFixed(1) }}</span>
              </div>
            </template>
          </vxe-column>
          
          <vxe-column title="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="viewDeveloperApps(row)">
                查看
              </el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/appStore'
import { storeToRefs } from 'pinia'

interface App {
  id: number
  name: string
  creator?: string
  creatorId?: number
  creatorAvatar?: string
  downloads?: number
  rating?: number
  category?: string[]
  description?: string
  version?: string
  updateDate?: string
  supportPC?: boolean
  supportMobile?: boolean
  price?: number
}

interface Developer {
  id: number
  name: string
  avatar: string
  appCount: number
  totalDownloads: number
  averageRating: number
  apps: App[]
}

const router = useRouter()
const appStore = useAppStore()
const { apps, loading, error } = storeToRefs(appStore)
const { syncApps } = appStore

// 处理开发者数据
const developers = computed(() => {
  if (!apps.value?.length) {
    return []
  }

  const devMap = new Map<string, Developer>()
  
  for (const app of apps.value as App[]) {
    if (app.creator) {
      const dev = devMap.get(app.creator) || {
        id: app.creatorId || 0,
        name: app.creator,
        avatar: app.creatorAvatar || '',
        appCount: 0,
        totalDownloads: 0,
        averageRating: 0,
        apps: [] as App[]
      }
      
      dev.appCount++
      dev.totalDownloads += app.downloads || 0
      dev.averageRating = ((dev.averageRating * (dev.appCount - 1)) + (app.rating || 0)) / dev.appCount
      dev.apps.push(app)
      
      devMap.set(app.creator, dev)
    }
  }
  
  return Array.from(devMap.values())
    .sort((a, b) => b.appCount - a.appCount)
})

// 获取排名样式
const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

// 格式化数字
const formatNumber = (num: number) => {
  if (!num) return '0'
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toString()
}

// 查看开发者的应用
const viewDeveloperApps = (developer: Developer) => {
  router.push({
    name: 'AppList',
    query: { creator: developer.name }
  })
}

// 检测是否为移动端
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onBeforeMount(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onMounted(async () => {
  await syncApps()
})
</script>

<style scoped>
.developer-ranking-container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.loading-state,
.error-state {
  padding: 40px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header .title {
  font-size: 18px;
  font-weight: bold;
}

.rank-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
}

.rank-1 {
  background-color: #f7ba2a;
  color: white;
}

.rank-2 {
  background-color: #95a5a6;
  color: white;
}

.rank-3 {
  background-color: #cd7f32;
  color: white;
}

.developer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.developer-detail {
  display: flex;
  flex-direction: column;
}

.developer-detail .name {
  font-weight: 500;
  color: #333;
}

.developer-detail .apps-count {
  color: #999;
  font-size: 12px;
}

.rating-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-score {
  color: #f7ba2a;
  font-weight: bold;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table .cell) {
  padding: 8px 0;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .developer-ranking-container {
    padding: 10px;
  }

  .header-actions {
    margin-bottom: 10px;
  }

  .developer-info {
    gap: 8px;
  }

  .developer-detail .name {
    font-size: 14px;
  }

  .developer-detail .apps-count {
    font-size: 11px;
  }

  .rating-cell {
    gap: 4px;
  }

  .rating-score {
    font-size: 12px;
  }

  .hidden-column {
    display: none;
  }

  :deep(.el-card__header) {
    padding: 10px;
  }

  .card-header .title {
    font-size: 16px;
  }
}

/* 确保表格在移动端可以横向滚动 */
:deep(.el-table) {
  overflow-x: auto !important;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto !important;
}
</style> 