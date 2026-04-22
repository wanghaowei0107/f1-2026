# F1 2026 赛季中心 — 功能拓展设计文档

## 概述

在现有单页 F1 赛季信息中心基础上，拆分为多文件 ES Modules 结构，新增五个功能模块：车手/车队详情页、实时比赛状态、赛道可视化、历史赛季对比、天气集成。所有外部 API 均为免费无需 key。

## 文件结构

```
index.html                 — HTML 骨架（精简，只保留结构）
css/
  style.css                — 主样式 + CSS 变量主题
  components.css           — 新组件样式
js/
  app.js                   — 入口：初始化、主题切换、赛季切换协调
  data.js                  — 硬编码数据：races[], circuitInfo{}, teamColors{}, driverFlag()
  api.js                   — API 封装层（Jolpica / OpenF1 / Open-Meteo），含缓存
  schedule.js              — 赛程列表 + 倒计时
  standings.js             — 积分榜（车手/车队）渲染
  chart.js                 — 积分趋势图（Canvas 绘制）
  race-detail.js           — 已完赛点击展开详情
  driver-detail.js         — [新] 车手/车队详情面板
  live.js                  — [新] 实时比赛状态
  circuit.js               — [新] 赛道 SVG 可视化
  history.js               — [新] 历史赛季对比
  weather.js               — [新] 天气集成
  ics.js                   — ICS 日历导出
```

模块间通信方式：ES Module 的 import/export。`app.js` 作为入口协调各模块初始化。`api.js` 作为唯一的网络请求层，各功能模块不直接 fetch。

## API 封装层 (api.js)

统一封装三个数据源，提供缓存和错误处理：

| 数据源 | 基础 URL | 用途 |
|--------|---------|------|
| Jolpica | `https://api.jolpi.ca/ergast/f1/{year}` | 积分榜、比赛成绩、车手信息、历史数据 |
| OpenF1 | `https://api.openf1.org/v1` | 实时比赛数据、赛道位置点 |
| Open-Meteo | `https://api.open-meteo.com/v1/forecast` | 天气预报 |

缓存策略：
- 积分榜/成绩数据：内存缓存，5 分钟有效期
- 实时数据：不缓存
- 天气数据：内存缓存，30 分钟有效期
- 赛道位置点：localStorage 持久缓存（赛道数据不变）

## 功能 A：车手/车队详情页

### 交互
- 积分榜中点击车手行 → 在该行下方展开详情面板（与已完赛展开风格一致）
- 面板内包含 tab 切换：「赛季成绩」|「积分曲线」
- 车队积分榜中点击车队 → 展开显示旗下车手对比

### 数据
- 车手各站成绩：`GET /f1/{year}/drivers/{driverId}/results.json`
- 车手冲刺成绩：`GET /f1/{year}/drivers/{driverId}/sprint.json`
- 复用 `chart.js` 绘制个人积分累计曲线

### UI 组件
- `.driver-detail-panel` — 展开面板容器
- 成绩表格复用 `.result-table` 样式
- 个人积分曲线用小型 Canvas（高 160px）

## 功能 B：实时比赛状态

### 检测逻辑
1. 页面加载时调用 OpenF1 `GET /sessions?session_key=latest`
2. 判断 session 的 `date_end` 是否在未来（或为 null 表示进行中）
3. 如果有活跃 session → 显示 LIVE 横幅，开始轮询

### 轮询数据
- 位置排名：`GET /position?session_key=latest&meeting_key=latest`（每 10 秒）
- 最新圈速：`GET /laps?session_key=latest&driver_number={n}`（每 15 秒）
- 间隔时间：`GET /intervals?session_key=latest`（每 10 秒）

### UI
- 页面顶部 `.live-banner`：红色脉冲动画 LIVE 标识 + session 名称
- 展开显示实时排名表：位置、车手、间隔、最新圈速
- 无活跃 session 时完全隐藏，不占空间

### 资源管理
- 页面不可见时（`visibilitychange`）暂停轮询
- 用户可手动关闭 LIVE 面板

## 功能 C：赛道可视化

### 方案
采用预制 SVG 路径方案：在 `data.js` 中为每条赛道存储简化的 SVG path 数据。

### 数据结构
```js
circuitInfo[round].svgPath = "M 0,0 C ..."  // 简化赛道轮廓
circuitInfo[round].drsZones = [
  { start: 0.15, end: 0.25 },  // 归一化位置 0-1
]
```

### 渲染
- 赛道详情展开时，在赛道信息区域上方显示 SVG 赛道图
- 赛道轮廓：描边线条
- DRS 区域：用不同颜色高亮标注
- 起终点：标记点
- 尺寸：宽度跟随容器，高度 180px，`viewBox` 自适应

### 数据来源
从 OpenF1 历史 location 数据提取轮廓，转为简化 path 后硬编码。仅针对主要赛道提供（部分新赛道如马德里可能无历史数据，显示占位图）。

## 功能 D：历史赛季对比

### 交互
- header 区域添加赛季选择器（下拉菜单），支持 2024 / 2025 / 2026
- 切换赛季后，重新加载：积分榜、赛程列表、积分趋势图
- 赛程数据：`GET /f1/{year}.json` 获取该赛季赛程

### 数据流
- `app.js` 维护全局状态 `currentSeason`
- 切换时触发各模块的 `reload(year)` 方法
- `data.js` 中的硬编码 `races[]` 仅用于 2026 赛季，其他赛季从 API 动态获取

### 趋势图对比模式
- 趋势图区域添加「对比」按钮
- 点击后可选择另一个赛季叠加显示
- 对比赛季的线条使用虚线样式区分
- 图例标注赛季年份

## 功能 F：天气集成

### 数据
在 `data.js` 中为每条赛道补充经纬度坐标：
```js
circuitInfo[round].lat = -37.8497   // Albert Park
circuitInfo[round].lng = 144.9680
```

Open-Meteo API 调用：
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lng}
  &daily=temperature_2m_max,temperature_2m_min,weathercode
  &timezone=auto
  &forecast_days=7
```

### 展示逻辑
- 赛程列表：未来 7 天内的比赛，在日期旁显示天气图标 + 温度范围
- 赛道详情展开：显示比赛周末三天的详细天气（每天：图标、温/湿度、风速、降水概率）
- 已过去的比赛不请求天气数据
- 天气图标映射：WMO weather code → emoji（晴 ☀ / 多云 ⛅ / 雨 🌧 等）

### WMO Code 映射表（存在 data.js）
| Code | 含义 | 图标 |
|------|------|------|
| 0 | 晴 | ☀️ |
| 1-3 | 少云/多云 | ⛅ |
| 45,48 | 雾 | 🌫️ |
| 51-55 | 毛毛雨 | 🌦️ |
| 61-65 | 雨 | 🌧️ |
| 71-77 | 雪 | 🌨️ |
| 80-82 | 阵雨 | 🌧️ |
| 95-99 | 雷暴 | ⛈️ |

## 拆分迁移策略

首先从现有 `index.html` 中抽取代码到模块文件，确保现有功能正常后，再逐个添加新功能。

拆分顺序：
1. 抽取 CSS → `css/style.css`
2. 抽取 JS 数据 → `js/data.js`
3. 抽取 API 层 → `js/api.js`
4. 抽取各功能模块 → 对应 JS 文件
5. 精简 `index.html` 为骨架
6. 验证现有功能正常
7. 并行开发新功能 A/B/C/D/F
