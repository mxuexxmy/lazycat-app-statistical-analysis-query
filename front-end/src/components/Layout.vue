<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo" @click="goToHome" role="button">
          <img src="@/assets/favicon.png" alt="Logo" class="logo-img" />
          <h1 class="text-xl font-bold">懒猫应用</h1>
        </div>
        <nav class="main-nav">
          <router-link to="/app-list" class="nav-item">
            <el-icon><List /></el-icon>
            <span>应用列表</span>
          </router-link>
          <router-link to="/popular-apps" class="nav-item">
            <el-icon><Star /></el-icon>
            <span>最受欢迎</span>
          </router-link>
          <router-link to="/statistics" class="nav-item">
            <el-icon><DataLine /></el-icon>
            <span>统计分析</span>
          </router-link>
          <router-link to="/developer-ranking" class="nav-item">
            <el-icon><User /></el-icon>
            <span>开发者排名</span>
          </router-link>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { List, DataLine, User, Star } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push('/app-list')
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.3s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.main-nav {
  display: flex;
  gap: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: #f5f7fa;
}

.nav-item.router-link-active {
  color: #409EFF;
  background-color: #ecf5ff;
}

.app-main {
  flex: 1;
  margin-top: 60px;
  padding: 20px;
  background-color: #f5f7fa;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 10px;
  }
  
  .main-nav {
    gap: 10px;
  }
  
  .nav-item span {
    display: none;
  }
}
</style> 