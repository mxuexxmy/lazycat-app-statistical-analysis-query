<template>
  <div class="popular-apps-container">
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

    <!-- 最受欢迎应用列表 -->
    <div v-else class="category-list">
      <div v-for="category in popularByCategory" :key="category.name" class="category-section">
        <div class="category-header">
          <h2 class="category-title">{{ category.name }}</h2>
          <el-tag type="info" effect="plain">
            Top {{ category.apps.length }}
          </el-tag>
        </div>
        
        <div class="apps-grid">
          <el-card 
            v-for="(app, index) in category.apps" 
            :key="app.id" 
            class="app-card"
            :body-style="{ padding: '0px' }"
            shadow="hover"
          >
            <div class="app-card-content">
              <!-- 应用图标 -->
              <div class="app-icon">
                <span class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</span>
              </div>
              
              <!-- 应用信息 -->
              <div class="app-info">
                <h3 class="app-name">{{ app.name }}</h3>
                <div class="app-meta">
                  <span class="downloads">{{ formatNumber(app.downloads) }}下载</span>
                  <span class="separator">·</span>
                  <span class="creator">{{ app.creator }}</span>
                </div>
                <div class="app-rating">
                  <el-rate 
                    v-model="app.rating" 
                    disabled 
                    :max="5"
                    :colors="['#ffd21e', '#ffd21e', '#ffd21e']"
                    :size="16"
                  />
                  <span class="rating-score">{{ app.rating?.toFixed(1) }}</span>
                </div>
                <div class="app-platforms">
                  <el-tag v-if="app.supportPC" size="small" type="success" effect="plain">PC</el-tag>
                  <el-tag v-if="app.supportMobile" size="small" type="success" effect="plain">移动端</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/appStore'
import { storeToRefs } from 'pinia'

interface App {
  id: number
  name: string
  creator?: string
  downloads?: number
  rating?: number
  category?: string[]
  updateDate?: string
  supportPC?: boolean
  supportMobile?: boolean
}

interface CategoryApps {
  name: string
  apps: App[]
}

const appStore = useAppStore()
const { apps, loading, error } = storeToRefs(appStore)
const { syncApps } = appStore

// 按分类获取最受欢迎的应用
const popularByCategory = computed(() => {
  if (!apps.value?.length) {
    return []
  }

  const categoryMap = new Map<string, App[]>()
  
  // 按分类分组应用
  for (const app of apps.value as App[]) {
    if (Array.isArray(app.category)) {
      for (const cat of app.category) {
        const categoryApps = categoryMap.get(cat) || []
        categoryApps.push(app)
        categoryMap.set(cat, categoryApps)
      }
    }
  }

  // 对每个分类的应用按下载量排序并取前10个
  return Array.from(categoryMap.entries())
    .map(([name, categoryApps]) => ({
      name,
      apps: categoryApps
        .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        .slice(0, 10)
    }))
    .sort((a, b) => {
      const aDownloads = a.apps[0]?.downloads || 0
      const bDownloads = b.apps[0]?.downloads || 0
      return bDownloads - aDownloads
    }) // 按第一名的下载量排序分类
})

// 获取排名样式
const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

// 格式化数字
const formatNumber = (num?: number) => {
  if (!num) return '0'
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toString()
}

// 格式化日期
const formatDate = (dateStr?: string) => {
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

onMounted(async () => {
  await syncApps()
})
</script>

<style scoped>
.popular-apps-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.loading-state,
.error-state {
  padding: 40px;
  background: #fff;
  border-radius: 8px;
}

.category-section {
  margin-bottom: 30px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.app-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.app-card:hover {
  transform: translateY(-2px);
}

.app-card-content {
  padding: 16px;
  display: flex;
  gap: 16px;
}

.app-icon {
  width: 48px;
  height: 48px;
  background: #f0f2f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  font-size: 20px;
  font-weight: bold;
  color: #666;
}

.rank-1 {
  color: #f7ba2a;
}

.rank-2 {
  color: #95a5a6;
}

.rank-3 {
  color: #cd7f32;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-meta {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.separator {
  color: #ddd;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.rating-score {
  font-size: 12px;
  color: #f7ba2a;
  font-weight: bold;
}

.app-platforms {
  display: flex;
  gap: 4px;
}

:deep(.el-tag--small) {
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .popular-apps-container {
    padding: 10px;
  }

  .category-title {
    font-size: 18px;
  }

  .apps-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
  }

  .app-card-content {
    padding: 12px;
  }

  .app-icon {
    width: 40px;
    height: 40px;
  }

  .app-name {
    font-size: 14px;
  }
}
</style> 