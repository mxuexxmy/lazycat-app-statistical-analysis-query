<template>
  <el-container class="app-container">
    <el-header>
      <h1>懒猫微服应用统计分析查询</h1>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu
          :router="true"
          default-active="/"
          class="el-menu-vertical"
        >
          <el-menu-item index="/">
            <el-icon><DataLine /></el-icon>
            <span>应用列表</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><PieChart /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { DataLine, PieChart } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.el-header {
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.el-aside {
  background-color: #f5f7fa;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style> 