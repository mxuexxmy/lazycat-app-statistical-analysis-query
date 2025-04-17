<template>
  <div class="statistics-container">
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

    <!-- 图表展示 -->
    <el-row v-else :gutter="20">
      <!-- 开发者应用数量统计 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>开发者应用数量统计</span>
              <el-tooltip content="显示开发者上传的应用数量分布">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="developerChart" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 每日上架应用数量 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>每日上架应用数量趋势</span>
              <el-tooltip content="显示每日新上架的应用数量变化趋势">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="dailyChart" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 应用分类分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>应用分类分布</span>
              <el-tooltip content="显示不同分类的应用数量占比">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="categoryChart" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 平台支持情况 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>平台支持情况</span>
              <el-tooltip content="显示应用对不同平台的支持情况">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="platformChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'
import { InfoFilled, Refresh } from '@element-plus/icons-vue'
import { throttle } from 'lodash-es'

const appStore = useAppStore()
const { apps, loading, error } = storeToRefs(appStore)
const { syncApps } = appStore

// 图表引用
const developerChart = ref(null)
const dailyChart = ref(null)
const categoryChart = ref(null)
const platformChart = ref(null)

// 图表实例
let developerChartInstance = null
let dailyChartInstance = null
let categoryChartInstance = null
let platformChartInstance = null

// 初始化图表的基础配置
const initChartBase = (chartRef) => {
  if (!chartRef.value) return null
  
  // 如果已经初始化过，先销毁
  const existingInstance = echarts.getInstanceByDom(chartRef.value)
  if (existingInstance) {
    existingInstance.dispose()
  }
  
  return echarts.init(chartRef.value)
}

// 初始化开发者统计图表
const initDeveloperChart = () => {
  if (!developerChart.value || !apps.value?.length) return

  developerChartInstance = initChartBase(developerChart)
  if (!developerChartInstance) return

  // 统计开发者数据
  const devMap = new Map()
  for (const app of apps.value) {
    if (app.creator) {
      devMap.set(app.creator, (devMap.get(app.creator) || 0) + 1)
    }
  }

  // 转换为数组并排序
  const data = Array.from(devMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20) // 只显示前20名开发者

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(([name]) => name),
      axisLabel: {
        interval: 0,
        rotate: 30,
        textStyle: {
          fontSize: 12
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '应用数量',
      minInterval: 1
    },
    series: [
      {
        name: '应用数量',
        type: 'bar',
        data: data.map(([, count]) => count),
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  developerChartInstance.setOption(option)
}

// 初始化每日上架统计图表
const initDailyChart = () => {
  if (!dailyChart.value || !apps.value?.length) return

  dailyChartInstance = initChartBase(dailyChart)
  if (!dailyChartInstance) return

  // 统计每日上架数量
  const dailyStats = {}
  for (const app of apps.value) {
    if (app.updateDate) {
      const date = app.updateDate.split('T')[0]
      dailyStats[date] = (dailyStats[date] || 0) + 1
    }
  }

  // 转换数据格式并排序
  const data = Object.entries(dailyStats)
    .sort((a, b) => a[0].localeCompare(b[0]))

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(([date]) => date),
      axisLabel: {
        interval: 'auto',
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '应用数量'
    },
    series: [
      {
        name: '上架数量',
        type: 'line',
        data: data.map(([, count]) => count),
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,194,58,0.3)' },
            { offset: 1, color: 'rgba(103,194,58,0.1)' }
          ])
        }
      }
    ]
  }

  dailyChartInstance.setOption(option)
}

// 初始化分类统计图表
const initCategoryChart = () => {
  if (!categoryChart.value || !apps.value?.length) return

  categoryChartInstance = initChartBase(categoryChart)
  if (!categoryChartInstance) return

  // 统计分类数量
  const categoryStats = {}
  for (const app of apps.value) {
    if (Array.isArray(app.category)) {
      for (const cat of app.category) {
        categoryStats[cat] = (categoryStats[cat] || 0) + 1
      }
    }
  }

  const data = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      type: 'scroll'
    },
    series: [
      {
        name: '分类分布',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  categoryChartInstance.setOption(option)
}

// 初始化平台支持统计图表
const initPlatformChart = () => {
  if (!platformChart.value || !apps.value?.length) return

  platformChartInstance = initChartBase(platformChart)
  if (!platformChartInstance) return

  // 统计平台支持情况
  const platformStats = {
    pcAndMobile: 0,
    pcOnly: 0,
    mobileOnly: 0
  }

  for (const app of apps.value) {
    if (app.supportPC && app.supportMobile) {
      platformStats.pcAndMobile++
    } else if (app.supportPC) {
      platformStats.pcOnly++
    } else if (app.supportMobile) {
      platformStats.mobileOnly++
    }
  }

  const data = [
    { name: 'PC + 移动端', value: platformStats.pcAndMobile },
    { name: '仅 PC', value: platformStats.pcOnly },
    { name: '仅移动端', value: platformStats.mobileOnly }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '平台支持',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }

  platformChartInstance.setOption(option)
}

// 使用节流处理窗口调整
const handleResize = throttle(() => {
  requestAnimationFrame(() => {
    developerChartInstance?.resize()
    dailyChartInstance?.resize()
    categoryChartInstance?.resize()
    platformChartInstance?.resize()
  })
}, 200)

// 初始化所有图表
const initCharts = () => {
  if (!apps.value?.length) return
  
  // 使用 requestAnimationFrame 优化渲染
  requestAnimationFrame(() => {
    initDeveloperChart()
    initDailyChart()
    initCategoryChart()
    initPlatformChart()
  })
}

// 监听数据变化
watch(() => apps.value, () => {
  initCharts()
}, { deep: true })

onMounted(async () => {
  await syncApps()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  developerChartInstance?.dispose()
  dailyChartInstance?.dispose()
  categoryChartInstance?.dispose()
  platformChartInstance?.dispose()
})
</script>

<style scoped>
.statistics-container {
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

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart {
  height: 400px;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}
</style> 