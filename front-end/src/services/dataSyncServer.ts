import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'

const API_BASE_URL = 'https://appstore.api.lazycat.cloud/api'
const SYNC_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds
const DB_PATH = path.join(process.cwd(), 'database')

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
}

class DataSyncServer {
  private syncStatus: SyncStatus

  constructor() {
    // 确保数据库目录存在
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(DB_PATH, { recursive: true })
      console.log('Created database directory:', DB_PATH)
    }

    this.syncStatus = this.loadSyncStatus()
    this.startSyncTimer()
  }

  private loadSyncStatus(): SyncStatus {
    try {
      const syncFile = path.join(DB_PATH, 'appsync.json')
      if (fs.existsSync(syncFile)) {
        const data = fs.readFileSync(syncFile, 'utf-8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
    return {
      lastSyncTime: null,
      nextSyncTime: null
    }
  }

  private saveSyncStatus(status: SyncStatus) {
    const syncFile = path.join(DB_PATH, 'appsync.json')
    fs.writeFileSync(syncFile, JSON.stringify(status, null, 2))
  }

  private async fetchCategories() {
    try {
      console.log('Fetching categories from API...')
      const response = await axios.get<Category[]>(`${API_BASE_URL}/app/categories`)
      
      const data: DataFile<Category[]> = {
        data: response.data,
        timestamp: new Date().toISOString()
      }
      
      const filePath = path.join(DB_PATH, 'categories.json')
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      console.log('Categories saved to:', filePath)
    } catch (error) {
      console.error('Failed to sync categories:', error)
    }
  }

  private async fetchAppList() {
    try {
      console.log('Fetching app list from API...')
      const response = await axios.get<App[]>(`${API_BASE_URL}/app/list`)
      
      const data: DataFile<App[]> = {
        data: response.data,
        timestamp: new Date().toISOString()
      }
      
      const filePath = path.join(DB_PATH, 'applist.json')
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      console.log('App list saved to:', filePath)
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
      const file = path.join(DB_PATH, 'categories.json')
      if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, 'utf-8')
        return JSON.parse(data).data
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
    return []
  }

  public getAppList(): App[] {
    try {
      const file = path.join(DB_PATH, 'applist.json')
      if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, 'utf-8')
        return JSON.parse(data).data
      }
    } catch (error) {
      console.error('Failed to load app list:', error)
    }
    return []
  }
}

export const dataSyncServer = new DataSyncServer() 