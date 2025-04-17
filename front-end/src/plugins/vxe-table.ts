import type { App } from 'vue'
import VXETable from 'vxe-table'
import {
  // 核心
  VXETable as VXETableCore,
  // 表格组件
  Table,
  // 列组件
  Column,
  // 分页组件
  Pager
} from 'vxe-table'
import 'vxe-table/lib/style.css'

// 配置默认参数
VXETableCore.setup({
  // 全局配置
  table: {
    // 自动监听父元素的变化去重新计算表格
    autoResize: true,
    // 显示边框
    border: true,
    // 所有数据行高亮显示
    highlightHoverRow: true,
    // 奇数行背景色
    stripe: true
  }
})

export function useVXETable(app: App) {
  // 注册所需组件
  app.use(Table)
    .use(Column)
    .use(Pager)
} 