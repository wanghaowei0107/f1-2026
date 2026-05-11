# F1 2026 赛季信息中心 - 史诗级更新设计文档

## 概述

本文档描述 F1 2026 赛季信息中心的全面升级设计，采用分阶段实施方案，涵盖视觉体验、功能扩展和性能优化三个维度。

**设计原则**：
- 极简专业风格（F1 官网风格）
- 保持纯静态页面，无需服务器
- 渐进式增强，优雅降级

---

## 阶段 1：视觉大升级 + 赛道图 + PWA

### 1.1 视觉设计升级

#### 设计语言
- **布局**：采用 CSS Grid 和 Flexbox 重新布局，更大的留白，更清晰的信息层次
- **卡片设计**：统一的卡片设计语言，带微阴影（`box-shadow: 0 1px 3px rgba(0,0,0,0.1)`）和圆角（`border-radius: 8px`）
- **间距系统**：使用 8px 基准网格（8, 16, 24, 32, 48px）

#### 色彩系统
```css
:root {
  /* 中性色阶 */
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #eeeeee;
  --gray-300: #e0e0e0;
  --gray-400: #bdbdbd;
  --gray-500: #9e9e9e;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;

  /* 强调色 */
  --red: #E8002D;
  --red-dark: #a8001f;
  --red-light: #ff1744;

  /* 语义色 */
  --success: #00c853;
  --warning: #ff9100;
  --error: #ff1744;
}

[data-theme="dark"] {
  --bg: #0a0a0c;
  --surface: #141416;
  --surface2: #1c1c1e;
  --border: rgba(255,255,255,0.06);
  --text: #f0f0f0;
  --muted: #666;
}
```

#### 字体系统
```css
/* 标题 */
h1, h2, h3 {
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.04em;
  line-height: 1.1;
}

/* 正文 */
body {
  font-family: 'DM Sans', sans-serif;
  font-weight: 300;
  line-height: 1.6;
}

/* 字号层次 */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
```

#### 动画系统
```css
/* 骨架屏 */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeleton {
  background: linear-gradient(90deg, var(--surface2) 25%, var(--surface) 50%, var(--surface2) 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* 列表项依次出现 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.race-row, .driver-row, .cons-row {
  animation: fadeInUp 0.3s ease-out forwards;
  opacity: 0;
}

/* 依次出现延迟 */
.race-row:nth-child(1) { animation-delay: 0.05s; }
.race-row:nth-child(2) { animation-delay: 0.1s; }
.race-row:nth-child(3) { animation-delay: 0.15s; }
.race-row:nth-child(4) { animation-delay: 0.2s; }
.race-row:nth-child(5) { animation-delay: 0.25s; }
.race-row:nth-child(6) { animation-delay: 0.3s; }
.race-row:nth-child(7) { animation-delay: 0.35s; }
.race-row:nth-child(8) { animation-delay: 0.4s; }
.race-row:nth-child(9) { animation-delay: 0.45s; }
.race-row:nth-child(10) { animation-delay: 0.5s; }
/* 超过10项时，使用JavaScript动态设置延迟 */

/* 卡片 hover 效果 */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 数据更新过渡 */
.data-value {
  transition: color 0.3s ease;
}

.data-value.updated {
  color: var(--red);
}
```

### 1.2 准确赛道图

#### 数据来源
使用以下数据源获取赛道 SVG 数据：
1. **OpenF1 API**：提供赛道的基本布局数据
2. **公开的赛道 SVG 资源**：从 F1 官方或开源项目获取
3. **手动绘制**：对于无法获取的数据，手动绘制 SVG 路径

每个赛道包含：
- 赛道布局（SVG 路径）
- DRS 区域（绿色高亮）
- 起终点线（红色标记）
- 关键弯道编号

#### 赛道数据结构
```javascript
// js/circuit-data.js
export const circuitSvgData = {
  1: { // 澳大利亚 - Albert Park
    name: 'Albert Park Grand Prix Circuit',
    city: 'Melbourne',
    country: 'Australia',
    viewBox: '0 0 800 600',
    paths: [
      {
        d: 'M 150,450 C 200,400 250,350 300,300 C 350,250 400,200 450,180 C 500,160 550,170 580,200 C 610,230 620,280 600,330 C 580,380 540,420 490,440 C 440,460 380,470 320,460 C 260,450 200,430 150,450 Z',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 300,300 C 350,250 400,200 450,180',
        type: 'drs',
        style: { stroke: '#00cc44', strokeWidth: 4 }
      }
    ],
    markers: [
      { x: 150, y: 450, type: 'start', label: 'S/F' },
      { x: 450, y: 180, type: 'drs', label: 'DRS 1' },
      { x: 600, y: 330, type: 'drs', label: 'DRS 2' }
    ],
    corners: [
      { x: 300, y: 300, number: '1', label: 'Turn 1' },
      { x: 450, y: 180, number: '3', label: 'Turn 3' },
      { x: 580, y: 200, number: '6', label: 'Turn 6' },
      { x: 600, y: 330, number: '9', label: 'Turn 9' },
      { x: 490, y: 440, number: '11', label: 'Turn 11' },
      { x: 320, y: 460, number: '13', label: 'Turn 13' }
    ]
  },
  2: { // 中国 - Shanghai
    name: 'Shanghai International Circuit',
    city: 'Shanghai',
    country: 'China',
    viewBox: '0 0 800 600',
    paths: [
      {
        d: 'M 200,500 L 200,200 C 200,150 250,100 300,100 L 500,100 C 550,100 600,150 600,200 L 600,300 C 600,350 550,400 500,400 L 300,400 C 250,400 200,350 200,300 Z',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 200,500 L 200,200',
        type: 'drs',
        style: { stroke: '#00cc44', strokeWidth: 4 }
      }
    ],
    markers: [
      { x: 200, y: 500, type: 'start', label: 'S/F' },
      { x: 200, y: 200, type: 'drs', label: 'DRS' }
    ],
    corners: [
      { x: 300, y: 100, number: '1', label: 'Turn 1' },
      { x: 600, y: 200, number: '6', label: 'Turn 6' },
      { x: 600, y: 300, number: '7', label: 'Turn 7' },
      { x: 500, y: 400, number: '10', label: 'Turn 10' },
      { x: 300, y: 400, number: '13', label: 'Turn 13' }
    ]
  },
  // 其他赛道数据将在实施阶段补充
  // 目前先提供澳大利亚和中国的示例数据
};
```

#### 渲染实现
```javascript
// js/circuit.js
export function renderCircuitSvg(round, container) {
  const data = circuitSvgData[round];
  if (!data) {
    container.innerHTML = '<span class="no-circuit">赛道图暂未收录</span>';
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  let svg = `<svg viewBox="${data.viewBox}" xmlns="http://www.w3.org/2000/svg">`;

  // 渲染赛道
  for (const path of data.paths) {
    const color = isDark ? '#555' : '#ccc';
    svg += `<path d="${path.d}" fill="none" stroke="${color}" stroke-width="${path.style.strokeWidth}" stroke-linecap="round"/>`;
  }

  // 渲染 DRS 区域
  for (const path of data.paths.filter(p => p.type === 'drs')) {
    svg += `<path d="${path.d}" fill="none" stroke="#00cc44" stroke-width="4" opacity="0.7"/>`;
  }

  // 渲染标记
  for (const marker of data.markers) {
    if (marker.type === 'start') {
      svg += `<circle cx="${marker.x}" cy="${marker.y}" r="5" fill="var(--red)"/>`;
      svg += `<text x="${marker.x + 10}" y="${marker.y + 4}" fill="${isDark ? '#aaa' : '#666'}" font-size="11">${marker.label}</text>`;
    }
  }

  // 渲染弯道编号
  for (const corner of data.corners) {
    svg += `<circle cx="${corner.x}" cy="${corner.y}" r="12" fill="none" stroke="${isDark ? '#666' : '#999'}" stroke-width="1"/>`;
    svg += `<text x="${corner.x}" y="${corner.y + 4}" text-anchor="middle" fill="${isDark ? '#aaa' : '#666'}" font-size="10">${corner.number}</text>`;
  }

  svg += '</svg>';
  container.innerHTML = svg;
}
```

### 1.3 PWA 基础

#### Manifest 文件
```json
// manifest.json
{
  "name": "F1 2026 赛季中心",
  "short_name": "F1 2026",
  "description": "F1 2026 赛季信息中心",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0c",
  "theme_color": "#E8002D",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker
```javascript
// sw.js
const CACHE_NAME = 'f1-2026-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/components.css',
  '/js/app.js',
  '/js/data.js',
  '/js/api.js',
  '/js/schedule.js',
  '/js/standings.js',
  '/js/chart.js',
  '/js/race-detail.js',
  '/js/driver-detail.js',
  '/js/live.js',
  '/js/circuit.js',
  '/js/history.js',
  '/js/weather.js',
  '/js/ics.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// 请求拦截，缓存优先策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        // 缓存 API 响应
        if (event.request.url.includes('api.')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
```

#### 离线体验
- 离线时显示最后加载的数据
- 离线时隐藏需要实时数据的功能（实时比赛状态）
- 网络恢复后自动刷新
- 显示离线提示条

---

## 阶段 2：车手/车队对比器 + 车手档案

### 2.1 车手/车队对比器

#### 功能设计
- 选择两位车手或两个车队进行详细对比
- 并排显示各项数据
- 可视化差异（柱状图、雷达图）

#### 对比维度

**车手对比**：
| 维度 | 数据来源 | 展示方式 |
|------|---------|---------|
| 当前积分 | Jolpica API | 数字对比 |
| 当前排名 | Jolpica API | 数字对比 |
| 胜场数 | Jolpica API | 数字对比 |
| 领奖台数 | Jolpica API | 数字对比 |
| 杆位数 | Jolpica API | 数字对比 |
| 最快圈速数 | Jolpica API | 数字对比 |
| 平均排位成绩 | 计算得出 | 数字对比 |
| 平均正赛成绩 | 计算得出 | 数字对比 |
| 积分趋势 | 计算得出 | 图表对比 |

**车队对比**：
| 维度 | 数据来源 | 展示方式 |
|------|---------|---------|
| 当前积分 | Jolpica API | 数字对比 |
| 当前排名 | Jolpica API | 数字对比 |
| 胜场数 | Jolpica API | 数字对比 |
| 领奖台数 | Jolpica API | 数字对比 |
| 车手积分分布 | Jolpica API | 柱状图 |
| 积分趋势 | 计算得出 | 图表对比 |

#### 数据结构
```javascript
// js/comparison.js
export async function getDriverComparison(driver1Id, driver2Id, year) {
  const [standings1, standings2, results1, results2] = await Promise.all([
    api.getDriverStandings(year),
    api.getDriverStandings(year),
    api.getDriverResults(year, driver1Id),
    api.getDriverResults(year, driver2Id)
  ]);

  const driver1 = standings1.DriverStandings.find(s => s.Driver.driverId === driver1Id);
  const driver2 = standings2.DriverStandings.find(s => s.Driver.driverId === driver2Id);

  return {
    driver1: {
      ...driver1,
      results: results1,
      stats: calculateDriverStats(results1)
    },
    driver2: {
      ...driver2,
      results: results2,
      stats: calculateDriverStats(results2)
    }
  };
}

function calculateDriverStats(results) {
  let wins = 0, podiums = 0, poles = 0, fastestLaps = 0;
  let totalQualiPos = 0, totalRacePos = 0;

  for (const race of results) {
    const result = race.Results?.[0];
    if (!result) continue;

    const pos = parseInt(result.position);
    const grid = parseInt(result.grid);

    if (pos === 1) wins++;
    if (pos <= 3) podiums++;
    if (grid === 1) poles++;
    if (result.FastestLap?.rank === '1') fastestLaps++;

    totalQualiPos += grid;
    totalRacePos += pos;
  }

  return {
    wins,
    podiums,
    poles,
    fastestLaps,
    avgQualiPos: results.length ? (totalQualiPos / results.length).toFixed(1) : 0,
    avgRacePos: results.length ? (totalRacePos / results.length).toFixed(1) : 0
  };
}
```

#### UI 设计
```html
<!-- 对比选择器 -->
<div class="comparison-selector">
  <div class="driver-select">
    <select id="driver1-select">
      <option value="">选择车手 1</option>
      <!-- 动态生成 -->
    </select>
  </div>
  <div class="vs-badge">VS</div>
  <div class="driver-select">
    <select id="driver2-select">
      <option value="">选择车手 2</option>
      <!-- 动态生成 -->
    </select>
  </div>
  <button class="compare-btn">开始对比</button>
</div>

<!-- 对比结果 -->
<div class="comparison-result">
  <div class="comparison-header">
    <div class="driver1-info">
      <span class="driver-flag">🇳🇱</span>
      <span class="driver-name">Max Verstappen</span>
    </div>
    <div class="comparison-title">车手对比</div>
    <div class="driver2-info">
      <span class="driver-flag">🇬🇧</span>
      <span class="driver-name">Lewis Hamilton</span>
    </div>
  </div>

  <div class="comparison-stats">
    <div class="stat-row">
      <div class="stat-value driver1">150</div>
      <div class="stat-label">积分</div>
      <div class="stat-value driver2">120</div>
    </div>
    <!-- 更多统计行 -->
  </div>

  <div class="comparison-chart">
    <canvas id="radar-chart"></canvas>
  </div>
</div>
```

#### 样式
```css
/* 对比选择器 */
.comparison-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.driver-select select {
  width: 200px;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface2);
  color: var(--text);
}

.vs-badge {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  color: var(--red);
  letter-spacing: 0.1em;
}

/* 对比结果 */
.comparison-result {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
}

.comparison-stats {
  padding: 1.5rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  text-align: center;
}

.stat-value.driver1 {
  color: var(--red);
}

.stat-value.driver2 {
  color: var(--blue);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  align-self: center;
}
```

### 2.2 车手档案/历史记录

#### 功能设计
- 车手职业生涯概览
- 历史赛季成绩
- 关键统计数据

#### 数据结构
```javascript
// js/driver-profile.js
export async function getDriverProfile(driverId) {
  // 获取当前赛季数据
  const currentStandings = await api.getDriverStandings(2026);
  const driverStanding = currentStandings.DriverStandings.find(
    s => s.Driver.driverId === driverId
  );

  // 获取历史赛季数据（最近 5 年）
  const historyYears = [2025, 2024, 2023, 2022, 2021];
  const history = [];

  for (const year of historyYears) {
    try {
      const standings = await api.getDriverStandings(year);
      const driver = standings.DriverStandings.find(
        s => s.Driver.driverId === driverId
      );
      if (driver) {
        history.push({
          year,
          position: parseInt(driver.position),
          points: parseFloat(driver.points),
          wins: parseInt(driver.wins)
        });
      }
    } catch (e) {
      // 跳过该年份
    }
  }

  return {
    driver: driverStanding?.Driver,
    current: driverStanding ? {
      position: parseInt(driverStanding.position),
      points: parseFloat(driverStanding.points),
      wins: parseInt(driverStanding.wins)
    } : null,
    history,
    career: calculateCareerStats(history)
  };
}

function calculateCareerStats(history) {
  let totalPoints = 0, totalWins = 0, bestPosition = 20;

  for (const season of history) {
    totalPoints += season.points;
    totalWins += season.wins;
    if (season.position < bestPosition) {
      bestPosition = season.position;
    }
  }

  return {
    totalPoints: Math.round(totalPoints),
    totalWins,
    bestPosition,
    seasons: history.length
  };
}
```

#### UI 设计
```html
<div class="driver-profile">
  <div class="profile-header">
    <div class="driver-info">
      <span class="driver-flag">🇳🇱</span>
      <div>
        <h1 class="driver-name">Max Verstappen</h1>
        <div class="driver-meta">
          <span class="team">Red Bull Racing</span>
          <span class="number">#1</span>
        </div>
      </div>
    </div>
    <div class="current-standing">
      <div class="standing-position">P1</div>
      <div class="standing-points">150 分</div>
    </div>
  </div>

  <div class="profile-content">
    <div class="career-stats">
      <div class="stat-card">
        <div class="stat-value">3</div>
        <div class="stat-label">世界冠军</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">62</div>
        <div class="stat-label">胜场</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">110</div>
        <div class="stat-label">领奖台</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">40</div>
        <div class="stat-label">杆位</div>
      </div>
    </div>

    <div class="season-history">
      <h2>赛季历史</h2>
      <table class="history-table">
        <thead>
          <tr>
            <th>赛季</th>
            <th>排名</th>
            <th>积分</th>
            <th>胜场</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026</td>
            <td>P1</td>
            <td>150</td>
            <td>5</td>
          </tr>
          <!-- 更多赛季 -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## 阶段 3：比赛回放 + 车载摄像头集成

### 3.1 比赛回放（排名变化图）

#### 功能设计
- 可视化每圈排名变化的动态图表
- 支持播放、暂停、快进
- 高亮特定车手

#### 数据来源
使用 OpenF1 API 的位置数据：
```javascript
// js/race-replay.js
export async function getRacePositions(sessionKey) {
  const positions = await api.getLivePositions(sessionKey);

  // 按圈数分组
  const byLap = {};
  for (const pos of positions) {
    if (!byLap[pos.lap]) {
      byLap[pos.lap] = {};
    }
    byLap[pos.lap][pos.driver_number] = pos.position;
  }

  return byLap;
}
```

#### 图表实现
```javascript
// js/replay-chart.js
export class ReplayChart {
  constructor(canvas, positions, drivers) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.positions = positions;
    this.drivers = drivers;
    this.currentLap = 1;
    this.maxLap = Math.max(...Object.keys(positions).map(Number));
    this.isPlaying = false;
    this.playSpeed = 1000; // ms per lap
    this.highlightedDriver = null;

    this.init();
  }

  init() {
    this.setupCanvas();
    this.draw();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  draw() {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;
    const pad = { top: 20, right: 80, bottom: 30, left: 40 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    // 绘制网格
    this.drawGrid(pad, plotW, plotH);

    // 绘制每条线
    for (const driverNum of Object.keys(this.drivers)) {
      this.drawDriverLine(driverNum, pad, plotW, plotH);
    }

    // 绘制当前圈指示器
    this.drawLapIndicator(pad, plotW, plotH);
  }

  drawGrid(pad, plotW, plotH) {
    const ctx = this.ctx;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#666' : '#aaa';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Y 轴（排名）
    for (let i = 1; i <= 20; i++) {
      const y = pad.top + (plotH * (i - 1) / 19);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '10px DM Sans';
      ctx.textAlign = 'right';
      ctx.fillText(`P${i}`, pad.left - 6, y + 3);
    }

    // X 轴（圈数）
    const lapStep = Math.ceil(this.maxLap / 10);
    for (let lap = 1; lap <= this.maxLap; lap += lapStep) {
      const x = pad.left + (plotW * (lap - 1) / (this.maxLap - 1));
      ctx.fillStyle = textColor;
      ctx.font = '10px DM Sans';
      ctx.textAlign = 'center';
      ctx.fillText(`L${lap}`, x, H - pad.bottom + 16);
    }
  }

  drawDriverLine(driverNum, pad, plotW, plotH) {
    const ctx = this.ctx;
    const driver = this.drivers[driverNum];
    const color = driver.color;
    const isHighlighted = this.highlightedDriver === driverNum;

    ctx.strokeStyle = color;
    ctx.lineWidth = isHighlighted ? 3 : 1.5;
    ctx.globalAlpha = this.highlightedDriver && !isHighlighted ? 0.3 : 1;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    for (let lap = 1; lap <= this.currentLap; lap++) {
      const pos = this.positions[lap]?.[driverNum];
      if (!pos) continue;

      const x = pad.left + (plotW * (lap - 1) / (this.maxLap - 1));
      const y = pad.top + (plotH * (pos - 1) / 19);

      if (lap === 1) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 终点标签
    if (this.currentLap > 0) {
      const lastPos = this.positions[this.currentLap]?.[driverNum];
      if (lastPos) {
        const x = pad.left + plotW;
        const y = pad.top + (plotH * (lastPos - 1) / 19);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isDark ? '#ccc' : '#333';
        ctx.font = '10px DM Sans';
        ctx.textAlign = 'left';
        ctx.fillText(driver.code, x + 8, y + 3);
      }
    }

    ctx.globalAlpha = 1;
  }

  drawLapIndicator(pad, plotW, plotH) {
    const ctx = this.ctx;
    const x = pad.left + (plotW * (this.currentLap - 1) / (this.maxLap - 1));

    ctx.strokeStyle = 'var(--red)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playInterval = setInterval(() => {
      if (this.currentLap >= this.maxLap) {
        this.pause();
        return;
      }
      this.currentLap++;
      this.draw();
      this.updateUI();
    }, this.playSpeed);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
  }

  setLap(lap) {
    this.currentLap = Math.max(1, Math.min(lap, this.maxLap));
    this.draw();
    this.updateUI();
  }

  highlightDriver(driverNum) {
    this.highlightedDriver = driverNum;
    this.draw();
  }

  updateUI() {
    // 更新进度条、当前圈数显示等
    const lapDisplay = document.getElementById('current-lap');
    if (lapDisplay) {
      lapDisplay.textContent = `L${this.currentLap}`;
    }

    const progressBar = document.getElementById('lap-progress');
    if (progressBar) {
      progressBar.value = this.currentLap;
    }
  }
}
```

#### UI 设计
```html
<div class="replay-container">
  <div class="replay-header">
    <h2>比赛回放</h2>
    <div class="replay-controls">
      <button id="play-btn" class="control-btn">▶</button>
      <button id="pause-btn" class="control-btn">⏸</button>
      <input type="range" id="lap-progress" min="1" max="50" value="1">
      <span id="current-lap">L1</span>
    </div>
  </div>

  <div class="replay-chart">
    <canvas id="replay-canvas"></canvas>
  </div>

  <div class="driver-legend">
    <div class="legend-item" data-driver="1">
      <span class="legend-color" style="background: #3671C6"></span>
      <span class="legend-code">VER</span>
    </div>
    <!-- 更多车手 -->
  </div>
</div>
```

### 3.2 车载摄像头集成

#### 功能设计
- 嵌入 F1 官方的车载摄像头直播流
- 支持选择不同车手的视角
- 显示当前车手的实时数据

#### 数据来源
使用 OpenF1 API 的车载摄像头数据：
```javascript
// js/onboard.js
export async function getOnboardStreams(sessionKey) {
  const response = await fetch(`https://api.openf1.org/v1/car_data?session_key=${sessionKey}`);
  const data = await response.json();

  // 提取唯一的车手
  const drivers = [...new Set(data.map(d => d.driver_number))];

  return drivers.map(driverNum => ({
    driverNumber: driverNum,
    // OpenF1 不直接提供视频流 URL，需要其他方式获取
    // 这里返回车手的实时数据
    data: data.filter(d => d.driver_number === driverNum)
  }));
}
```

#### 实现方案
由于 OpenF1 API 不直接提供视频流 URL，我们有两种方案：

**方案 A：嵌入 F1 官方 YouTube 直播**
- 在比赛期间嵌入 F1 官方的 YouTube 直播
- 使用 YouTube IFrame API
- 优点：简单可靠
- 缺点：无法选择车手视角

**方案 B：使用 F1 TV API（需要订阅）**
- 需要用户登录 F1 TV
- 可以选择车手视角
- 缺点：需要付费订阅

**推荐方案 A**，因为：
- 无需用户登录
- 免费
- 实现简单

#### UI 设计
```html
<div class="onboard-container">
  <div class="onboard-header">
    <h2>车载摄像头</h2>
    <div class="onboard-status">
      <span class="live-dot"></span>
      <span>LIVE</span>
    </div>
  </div>

  <div class="onboard-video">
    <iframe
      id="onboard-iframe"
      src="https://www.youtube.com/embed/VIDEO_ID"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>

  <div class="onboard-data">
    <div class="data-item">
      <span class="data-label">速度</span>
      <span class="data-value" id="speed">320 km/h</span>
    </div>
    <div class="data-item">
      <span class="data-label">档位</span>
      <span class="data-value" id="gear">8</span>
    </div>
    <div class="data-item">
      <span class="data-label">DRS</span>
      <span class="data-value" id="drs">ON</span>
    </div>
  </div>
</div>
```

---

## 实施计划

### 阶段 1：视觉大升级 + 赛道图 + PWA（2-3 周）

#### 第 1 周：视觉设计升级
- [ ] 重构 CSS 变量系统（色彩、间距、字体）
- [ ] 实现骨架屏加载效果
- [ ] 添加列表项依次出现动画
- [ ] 实现卡片 hover 微交互
- [ ] 优化响应式布局

#### 第 2 周：准确赛道图
- [ ] 收集 24 条赛道的 SVG 数据
- [ ] 实现赛道图渲染组件
- [ ] 添加 DRS 区域高亮
- [ ] 实现暗色/亮色模式适配
- [ ] 测试移动端显示效果

#### 第 3 周：PWA 基础
- [ ] 创建 manifest.json
- [ ] 实现 Service Worker
- [ ] 配置缓存策略
- [ ] 添加离线提示条
- [ ] 测试 PWA 安装和离线功能

### 阶段 2：车手/车队对比器 + 车手档案（2-3 周）

#### 第 1 周：数据层和对比器基础
- [ ] 实现车手对比数据获取
- [ ] 实现车队对比数据获取
- [ ] 创建对比选择器 UI
- [ ] 实现对比结果展示

#### 第 2 周：可视化和交互
- [ ] 实现雷达图可视化
- [ ] 实现柱状图对比
- [ ] 添加动画过渡效果
- [ ] 优化移动端体验

#### 第 3 周：车手档案
- [ ] 实现车手档案数据获取
- [ ] 创建车手档案 UI
- [ ] 实现赛季历史表格
- [ ] 添加职业生涯统计

### 阶段 3：比赛回放 + 车载摄像头（2-3 周）

#### 第 1 周：比赛回放数据
- [ ] 实现 OpenF1 位置数据获取
- [ ] 实现数据按圈数分组
- [ ] 创建回放图表组件
- [ ] 实现播放/暂停控制

#### 第 2 周：回放交互
- [ ] 实现进度条控制
- [ ] 添加车手高亮功能
- [ ] 实现动态播放效果
- [ ] 优化性能和内存使用

#### 第 3 周：车载摄像头
- [ ] 集成 YouTube IFrame API
- [ ] 实现直播流嵌入
- [ ] 添加实时数据显示
- [ ] 测试不同网络环境

---

## 技术约束

1. **纯静态页面**：保持无服务器、无构建工具
   - 所有代码都是纯 HTML、CSS、JavaScript
   - 使用 ES Modules 组织代码
   - 通过 GitHub Pages 部署

2. **ES Modules**：继续使用原生 ES Modules
   - 使用 `<script type="module">` 加载
   - 模块间通过 import/export 通信
   - 保持现有的模块结构

3. **API 限制**：注意 Jolpica 和 OpenF1 的速率限制
   - Jolpica API：每分钟 60 次请求
   - OpenF1 API：每分钟 30 次请求
   - 实现请求缓存和节流
   - 优雅降级处理

4. **浏览器兼容**：支持现代浏览器
   - Chrome 80+
   - Firefox 75+
   - Safari 13+
   - Edge 80+

5. **移动优先**：响应式设计，移动端优先
   - 使用 CSS Grid 和 Flexbox
   - 媒体查询断点：560px、860px、1280px
   - 触摸友好的交互设计

6. **性能要求**：
   - 首屏加载时间 < 2 秒
   - 动画流畅 60fps
   - 内存使用 < 100MB
   - Lighthouse 评分 > 90

---

## 风险和缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| API 速率限制 | 功能不可用 | 中 | 实现缓存策略，优雅降级，显示最后加载的数据 |
| 赛道图数据不准确 | 用户体验差 | 低 | 使用多个数据源验证，手动校对关键赛道 |
| PWA 兼容性 | 部分浏览器不支持 | 低 | 渐进式增强，降级到普通网页 |
| 车载摄像头版权限制 | 无法嵌入 | 中 | 使用官方 YouTube 直播，提供链接跳转 |
| 性能问题 | 页面卡顿 | 中 | 优化动画性能，使用 requestAnimationFrame |
| 移动端体验差 | 用户流失 | 低 | 移动优先设计，触摸友好交互 |

---

## 成功标准

### 阶段 1 成功标准
- [ ] 页面加载时间 < 2 秒
- [ ] 动画流畅 60fps
- [ ] 所有 24 条赛道图正确显示
- [ ] PWA 可安装并支持离线
- [ ] Lighthouse 评分 > 90

### 阶段 2 成功标准
- [ ] 车手/车队对比器功能完整
- [ ] 雷达图可视化正确
- [ ] 车手档案数据准确
- [ ] 移动端体验良好

### 阶段 3 成功标准
- [ ] 比赛回放功能正常
- [ ] 排名变化图清晰直观
- [ ] 车载摄像头可嵌入
- [ ] 实时数据显示正常

### 整体成功标准
- [ ] 用户满意度 > 80%
- [ ] 无严重 bug
- [ ] 性能指标达标
- [ ] 代码质量良好

---

## 附录

### A. 参考资源
- [F1 官网](https://www.formula1.com/)
- [OpenF1 API](https://openf1.org/)
- [Jolpica API](https://jolpi.ca/)
- [PWA 文档](https://web.dev/progressive-web-apps/)
- [CSS Grid 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Canvas API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Service Worker 文档](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### B. 术语表
- **PWA**：Progressive Web App，渐进式 Web 应用
- **Service Worker**：后台脚本，用于缓存和离线支持
- **DRS**：Drag Reduction System，减少阻力系统
- **杆位**：排位赛第一名
- **领奖台**：前三名车手
- **最快圈速**：比赛中单圈最快时间
- **冲刺赛**：短距离比赛，积分较少

### C. 文件结构
```
f1-2026/
├── index.html
├── manifest.json
├── sw.js
├── css/
│   ├── style.css
│   └── components.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── api.js
│   ├── schedule.js
│   ├── standings.js
│   ├── chart.js
│   ├── race-detail.js
│   ├── driver-detail.js
│   ├── live.js
│   ├── circuit.js
│   ├── history.js
│   ├── weather.js
│   ├── ics.js
│   ├── comparison.js      (新增)
│   ├── driver-profile.js  (新增)
│   ├── race-replay.js     (新增)
│   └── onboard.js         (新增)
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-11-epic-update-design.md
```

### D. API 端点
#### Jolpica API
- 车手积分榜：`https://api.jolpi.ca/ergast/f1/{year}/driverStandings.json`
- 车队积分榜：`https://api.jolpi.ca/ergast/f1/{year}/constructorStandings.json`
- 比赛结果：`https://api.jolpi.ca/ergast/f1/{year}/{round}/results.json`
- 排位赛结果：`https://api.jolpi.ca/ergast/f1/{year}/{round}/qualifying.json`

#### OpenF1 API
- 最新会话：`https://api.openf1.org/v1/sessions?session_key=latest`
- 实时位置：`https://api.openf1.org/v1/position?session_key={session_key}`
- 实时间隔：`https://api.openf1.org/v1/intervals?session_key={session_key}`
- 车载数据：`https://api.openf1.org/v1/car_data?session_key={session_key}`

#### Open-Meteo API
- 天气预报：`https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=weathercode,temperature_2m_max,temperature_2m_min`

---

*文档版本：1.0*
*最后更新：2026-05-11*
*作者：Claude Code*
