import { dataSyncServer } from '../src/services/dataSyncServer'

console.log('Starting data sync server...')
dataSyncServer.initialize().catch(error => {
  console.error('Failed to initialize sync server:', error)
  process.exit(1)
}) 