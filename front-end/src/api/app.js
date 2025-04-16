import axios from 'axios'

const API_BASE_URL = '/api'

export const appApi = {
  // 获取所有应用列表
  async getAllApps() {
    try {
      const response = await axios.get(`${API_BASE_URL}/app/list`)
      return response.data
    } catch (error) {
      console.error('获取应用列表失败:', error)
      throw error
    }
  },

  // 获取应用分类
  async getCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/app/categories`)
      return response.data
    } catch (error) {
      console.error('获取分类列表失败:', error)
      throw error
    }
  }
} 