import { defineStore } from 'pinia'
import { appApi } from '@/api/app'
import { ElMessage } from 'element-plus'

export const useAppStore = defineStore('app', {
  state: () => ({
    apps: [],
    categories: [],
    loading: false,
    error: null,
    hasInitialLoad: false
  }),

  getters: {
    // 获取开发者列表
    developers: (state) => {
      const developers = new Set()
      for (const app of state.apps) {
        if (app.creator) {
          developers.add(app.creator)
        }
      }
      return Array.from(developers)
    },

    // 获取每个开发者的应用数量
    developerAppCount: (state) => {
      const count = {}
      for (const app of state.apps) {
        if (app.creator) {
          count[app.creator] = (count[app.creator] || 0) + 1
        }
      }
      return count
    },

    // 获取每日上架应用数量
    dailyAppCount: (state) => {
      const count = {}
      for (const app of state.apps) {
        if (app.updateDate) {
          const date = app.updateDate.split('T')[0]
          count[date] = (count[date] || 0) + 1
        }
      }
      return count
    }
  },

  actions: {
    // 同步应用数据
    async syncApps() {
      this.loading = true
      this.error = null
      try {
        const [appsResponse, categoriesResponse] = await Promise.all([
          appApi.getAllApps(),
          appApi.getCategories()
        ])

        // 确保返回的数据结构正确
        if (appsResponse.success && Array.isArray(appsResponse.data)) {
          this.apps = appsResponse.data
        } else {
          throw new Error('应用数据格式错误')
        }

        if (Array.isArray(categoriesResponse)) {
          this.categories = categoriesResponse
        }
        
        ElMessage.success('数据同步成功')
      } catch (error) {
        console.error('数据同步失败:', error)
        this.error = error.message
        ElMessage.error(`数据同步失败: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    setInitialLoad() {
      this.hasInitialLoad = true
    }
  }
}) 