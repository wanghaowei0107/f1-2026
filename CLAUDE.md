# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

F1 2026 赛季信息中心 — 纯静态单页应用，ES Modules 多文件结构，无构建工具、无框架依赖。通过 GitHub Pages 部署，推送到 `main` 分支即自动部署。

## 架构

```
index.html              — HTML 骨架
css/
  style.css             — 主样式 + CSS 变量主题（亮/暗模式）
  components.css        — 新功能组件样式
js/
  app.js                — 入口：初始化、主题切换、赛季切换、全局事件绑定
  data.js               — 硬编码数据：races[], circuitInfo{}（含经纬度）, teamColors{}, driverFlag()
  api.js                — API 封装层（Jolpica/OpenF1/Open-Meteo），含内存缓存
  schedule.js           — 赛程列表 + 倒计时
  standings.js          — 积分榜（车手/车队）渲染
  chart.js              — 积分趋势图（Canvas 绘制），支持对比叠加
  race-detail.js        — 已完赛点击展开详情
  driver-detail.js      — 车手/车队详情面板（点击积分榜展开）
  live.js               — 实时比赛状态（OpenF1 API 轮询）
  circuit.js            — 赛道 SVG 可视化
  history.js            — 历史赛季对比 + 趋势图对比模式
  weather.js            — 天气集成（Open-Meteo API）
  ics.js                — ICS 日历导出
```

使用 `<script type="module">` 加载，模块间通过 ES import/export 通信。`app.js` 作为入口协调各模块。`api.js` 是唯一的网络请求层。

### 数据来源

| 数据源 | 基础 URL | 用途 |
|--------|---------|------|
| Jolpica (Ergast) | `api.jolpi.ca/ergast/f1/{year}` | 积分榜、比赛成绩、历史数据 |
| OpenF1 | `api.openf1.org/v1` | 实时比赛数据 |
| Open-Meteo | `api.open-meteo.com/v1/forecast` | 天气预报 |

硬编码数据（`data.js`）：赛程 `races[]`、赛道信息 `circuitInfo{}`（含经纬度）、车队颜色 `teamColors{}`。

### 全局状态

`app.js` 导出 `currentSeason` 变量。HTML 中的 `onclick` 通过 `window.*` 绑定调用模块函数（ES Modules 不创建全局变量）。

### 车队颜色

`teamColors` 对象定义车队颜色映射，通过 `teamColor()` 函数做模糊匹配（`name.includes(key)`）。

## 开发

启动本地服务器（需要 HTTP 服务器，ES Modules 不支持 `file://`）：

```bash
python3 -m http.server 8765
# 或
npx serve .
```

无构建步骤、无测试、无 lint。修改文件后刷新浏览器即可。

## 部署

推送到 `main` 分支后，GitHub Actions 自动部署到 GitHub Pages（`.github/workflows/deploy.yml`）。
