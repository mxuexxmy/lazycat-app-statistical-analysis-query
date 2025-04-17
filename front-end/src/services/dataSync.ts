import axios from 'axios'

const API_BASE_URL = '/api'
const SYNC_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds

interface SyncStatus {
  lastSyncTime: string | null
  nextSyncTime: string | null
}

interface DataFile<T> {
  data: T
  timestamp: string
}

interface Category {
  id: number
  name: string
}

interface App {
  id: number
  name: string
  category: number
  creator?: string
  creatorId?: number
  creatorAvatar?: string
  downloads?: number
  rating?: number
}

interface ApiResponse<T> {
  errorCode: number
  message: string
  data: T
  success: boolean
}

class DataSyncService {
  private syncStatus: SyncStatus

  constructor() {
    console.log('Initializing DataSyncService...')
    this.syncStatus = this.loadSyncStatus()
    this.startSyncTimer()
  }

  private loadSyncStatus(): SyncStatus {
    try {
      console.log('Loading sync status from localStorage...')
      const status = localStorage.getItem('appsync')
      if (status) {
        console.log('Found existing sync status:', status)
        return JSON.parse(status)
      }
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
    console.log('No existing sync status found, using default')
    return {
      lastSyncTime: null,
      nextSyncTime: null
    }
  }

  private saveSyncStatus(status: SyncStatus) {
    console.log('Saving sync status:', status)
    localStorage.setItem('appsync', JSON.stringify(status))
  }

  private async fetchCategories() {
    try {
      console.log('Fetching categories from API...')
      const response = await axios.get<ApiResponse<Category[]>>(`${API_BASE_URL}/app/categories`)
      console.log('Categories response:', response.data)
      
      const data: DataFile<Category[]> = {
        data: response.data.data,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem('categories', JSON.stringify(data))
      console.log('Categories saved successfully')
    } catch (error) {
      console.error('Failed to sync categories:', error)
    }
  }

  private async fetchAppList() {
    try {
      console.log('Fetching app list from API...')
      const response = await axios.get<ApiResponse<App[]>>(`${API_BASE_URL}/app/list`)
      console.log('App list response:', response.data)
      
      const data: DataFile<App[]> = {
        data: response.data.data,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem('applist', JSON.stringify(data))
      console.log('App list saved successfully')
    } catch (error) {
      console.error('Failed to sync app list:', error)
    }
  }

  private async syncData() {
    console.log('Starting data sync...')
    await Promise.all([this.fetchCategories(), this.fetchAppList()])
    
    const now = new Date()
    const nextSync = new Date(now.getTime() + SYNC_INTERVAL)
    
    this.syncStatus = {
      lastSyncTime: now.toISOString(),
      nextSyncTime: nextSync.toISOString()
    }
    
    this.saveSyncStatus(this.syncStatus)
    console.log('Data sync completed')
  }

  private startSyncTimer() {
    console.log('Starting sync timer with interval:', SYNC_INTERVAL, 'ms')
    setInterval(() => {
      this.syncData()
    }, SYNC_INTERVAL)
  }

  public async initialize() {
    console.log('Initializing data sync service...')
    if (!this.syncStatus.lastSyncTime) {
      console.log('No previous sync found, performing initial sync')
      await this.syncData()
    } else {
      console.log('Previous sync found at:', this.syncStatus.lastSyncTime)
    }
  }

  public getCategories(): Category[] {
    try {
      console.log('Getting categories from localStorage...')
      const data = localStorage.getItem('categories')
      if (data) {
        const parsed = JSON.parse(data)
        console.log('Retrieved categories:', parsed.data)
        return parsed.data
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
    console.log('No categories found')
    return []
  }

  public getAppList(): App[] {
    try {
      console.log('Getting app list from localStorage...')
      const data = localStorage.getItem('applist')
      if (data) {
        const parsed = JSON.parse(data)
        console.log('Retrieved app list:', parsed.data)
        return parsed.data
      }
    } catch (error) {
      console.error('Failed to load app list:', error)
    }
    console.log('No app list found')
    return []
  }
}

export const dataSyncService = new DataSyncService() 