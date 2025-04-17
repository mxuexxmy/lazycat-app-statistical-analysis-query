import { createRouter, createWebHistory } from 'vue-router'
import AppList from '../views/AppList.vue'
import Statistics from '../views/Statistics.vue'
import DeveloperRanking from '../views/DeveloperRanking.vue'
import PopularApps from '../views/PopularApps.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/app-list'
    },
    {
      path: '/app-list',
      name: 'AppList',
      component: AppList,
      meta: {
        title: '应用列表',
        icon: 'List'
      }
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: Statistics,
      meta: {
        title: '统计分析',
        icon: 'DataLine'
      }
    },
    {
      path: '/developer-ranking',
      name: 'DeveloperRanking',
      component: DeveloperRanking,
      meta: {
        title: '开发者排名',
        icon: 'User'
      }
    },
    {
      path: '/popular-apps',
      name: 'PopularApps',
      component: PopularApps
    }
  ]
})

export default router 