<template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>开发者应用数量统计</span>
            </div>
          </template>
          <div ref="developerChart" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>每日上架应用数量</span>
            </div>
          </template>
          <div ref="dailyChart" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const developerChart = ref(null)
const dailyChart = ref(null)

const initDeveloperChart = (data) => {
  const chart = echarts.init(developerChart.value)
  const option = {
    title: {
      text: '开发者应用数量'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.developer)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(item => item.count),
      type: 'bar'
    }]
  }
  chart.setOption(option)
}

const initDailyChart = (data) => {
  const chart = echarts.init(dailyChart.value)
  const option = {
    title: {
      text: '每日上架应用数量'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(item => item.count),
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
}

const fetchStatistics = async () => {
  try {
    const [developerResponse, dailyResponse] = await Promise.all([
      axios.get('/api/statistics/developer'),
      axios.get('/api/statistics/daily')
    ])
    initDeveloperChart(developerResponse.data)
    initDailyChart(dailyResponse.data)
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    ElMessage.error('获取统计数据失败')
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 