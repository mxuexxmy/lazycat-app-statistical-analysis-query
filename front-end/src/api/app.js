import axios from 'axios'

const API_BASE_URL = '/api'

export const appApi = {
  // 获取所有应用列表
  async getAllApps() {
    try {
      console.log('正在请求应用列表...')
      const response = await axios.get(`${API_BASE_URL}/app/list`)
      console.log('应用列表响应:', response)
      
      if (!response.data) {
        throw new Error('API 响应数据为空')
      }
      
      return response.data
    } catch (error) {
      console.error('获取应用列表失败:', error)
      if (error.response) {
        // 服务器响应错误
        throw new Error(`服务器错误 (${error.response.status}): ${error.response.data?.message || '未知错误'}`)
      } else if (error.request) {
        // 请求发送失败
        throw new Error('无法连接到服务器，请检查网络连接')
      } else {
        // 其他错误
        throw new Error(`请求失败: ${error.message}`)
      }
    }
  },

  // 获取应用分类
  async getCategories() {
    try {
      console.log('正在请求分类列表...')
      const response = await axios.get(`${API_BASE_URL}/app/categories`)
      console.log('分类列表响应:', response)
      
      if (!response.data) {
        throw new Error('API 响应数据为空')
      }
      
      return response.data
    } catch (error) {
      console.error('获取分类列表失败:', error)
      if (error.response) {
        throw new Error(`服务器错误 (${error.response.status}): ${error.response.data?.message || '未知错误'}`)
      } else if (error.request) {
        throw new Error('无法连接到服务器，请检查网络连接')
      } else {
        throw new Error(`请求失败: ${error.message}`)
      }
    }
  }
} 