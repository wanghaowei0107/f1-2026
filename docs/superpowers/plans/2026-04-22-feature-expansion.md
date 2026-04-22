# F1 2026 功能拓展实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将单文件 F1 赛季中心拆分为 ES Modules 多文件结构，新增车手详情、实时比赛、赛道可视化、历史对比、天气集成五个功能。

**Architecture:** 纯前端 ES Modules（无打包工具）。`app.js` 作为入口协调各模块，`api.js` 封装所有外部 API 调用（Jolpica/OpenF1/Open-Meteo），各功能模块只通过 `api.js` 获取数据。全局状态（当前赛季、主题）通过 `app.js` 导出的变量和事件管理。

**Tech Stack:** Vanilla JS (ES Modules), CSS Custom Properties, Canvas API, SVG, Jolpica API, OpenF1 API, Open-Meteo API

---

## Task 1: 拆分 CSS 到独立文件

**Files:**
- Create: `css/style.css`
- Create: `css/components.css`
- Modify: `index.html`

- [ ] **Step 1: 创建 css/style.css**

从 `index.html` 的 `<style>` 标签中提取所有 CSS（第 9-342 行），写入 `css/style.css`。内容保持不变。

- [ ] **Step 2: 创建空的 css/components.css**

```css
/* 新功能组件样式 — 后续任务逐步添加 */
```

- [ ] **Step 3: 修改 index.html 引用外部 CSS**

将 `<style>...</style>` 替换为：

```html
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/components.css">
```

- [ ] **Step 4: 浏览器验证样式正常**

用 `python3 -m http.server 8000` 启动，打开浏览器确认页面样式与拆分前一致。

- [ ] **Step 5: Commit**

```bash
git add css/style.css css/components.css index.html
git commit -m "refactor: 提取 CSS 到独立文件"
```

---

## Task 2: 拆分 JS 数据层 (data.js)

**Files:**
- Create: `js/data.js`

- [ ] **Step 1: 创建 js/data.js**

从 `index.html` 提取 `races`、`teamColors`、`teamColor()`、`circuitInfo`、`driverFlag()` 并导出。同时为每个赛道补充经纬度坐标（天气功能需要）。

```js
// js/data.js

export const races = [
  { r:1,  name:'澳大利亚大奖赛',       flag:'🇦🇺', date:'2026-03-08', end:'2026-03-08', sprint:false, cancelled:false },
  { r:2,  name:'中国大奖赛',           flag:'🇨🇳', date:'2026-03-13', end:'2026-03-15', sprint:true,  cancelled:false },
  { r:3,  name:'日本大奖赛',           flag:'🇯🇵', date:'2026-03-27', end:'2026-03-29', sprint:false, cancelled:false },
  { r:4,  name:'巴林大奖赛',           flag:'🇧🇭', date:'2026-04-12', end:'2026-04-12', sprint:false, cancelled:true  },
  { r:5,  name:'沙特阿拉伯大奖赛',     flag:'🇸🇦', date:'2026-04-19', end:'2026-04-19', sprint:false, cancelled:true  },
  { r:6,  name:'迈阿密大奖赛',         flag:'🇺🇸', date:'2026-05-01', end:'2026-05-03', sprint:true,  cancelled:false },
  { r:7,  name:'加拿大大奖赛',         flag:'🇨🇦', date:'2026-05-22', end:'2026-05-24', sprint:true,  cancelled:false },
  { r:8,  name:'摩纳哥大奖赛',         flag:'🇲🇨', date:'2026-06-05', end:'2026-06-07', sprint:false, cancelled:false },
  { r:9,  name:'巴塞罗那大奖赛',       flag:'🇪🇸', date:'2026-06-12', end:'2026-06-14', sprint:false, cancelled:false },
  { r:10, name:'奥地利大奖赛',         flag:'🇦🇹', date:'2026-06-26', end:'2026-06-28', sprint:false, cancelled:false },
  { r:11, name:'英国大奖赛',           flag:'🇬🇧', date:'2026-07-03', end:'2026-07-05', sprint:true,  cancelled:false },
  { r:12, name:'比利时大奖赛',         flag:'🇧🇪', date:'2026-07-17', end:'2026-07-19', sprint:false, cancelled:false },
  { r:13, name:'匈牙利大奖赛',         flag:'🇭🇺', date:'2026-07-24', end:'2026-07-26', sprint:false, cancelled:false },
  { r:14, name:'荷兰大奖赛',           flag:'🇳🇱', date:'2026-08-21', end:'2026-08-23', sprint:true,  cancelled:false },
  { r:15, name:'意大利大奖赛',         flag:'🇮🇹', date:'2026-09-04', end:'2026-09-06', sprint:false, cancelled:false },
  { r:16, name:'西班牙大奖赛(马德里)', flag:'🇪🇸', date:'2026-09-11', end:'2026-09-13', sprint:false, cancelled:false },
  { r:17, name:'阿塞拜疆大奖赛',       flag:'🇦🇿', date:'2026-09-25', end:'2026-09-27', sprint:false, cancelled:false },
  { r:18, name:'新加坡大奖赛',         flag:'🇸🇬', date:'2026-10-02', end:'2026-10-04', sprint:true,  cancelled:false },
  { r:19, name:'美国大奖赛',           flag:'🇺🇸', date:'2026-10-16', end:'2026-10-18', sprint:false, cancelled:false },
  { r:20, name:'墨西哥大奖赛',         flag:'🇲🇽', date:'2026-10-23', end:'2026-10-25', sprint:false, cancelled:false },
  { r:21, name:'巴西大奖赛',           flag:'🇧🇷', date:'2026-10-30', end:'2026-11-01', sprint:false, cancelled:false },
  { r:22, name:'拉斯维加斯大奖赛',     flag:'🇺🇸', date:'2026-11-21', end:'2026-11-21', sprint:false, cancelled:false },
  { r:23, name:'卡塔尔大奖赛',         flag:'🇶🇦', date:'2026-11-27', end:'2026-11-29', sprint:false, cancelled:false },
  { r:24, name:'阿布扎比大奖赛',       flag:'🇦🇪', date:'2026-12-04', end:'2026-12-06', sprint:false, cancelled:false },
];

export const teamColors = {
  'Mercedes': '#00D2BE', 'Ferrari': '#E8002D', 'McLaren': '#FF8000',
  'Red Bull': '#3671C6', 'Haas': '#B6BABD', 'Alpine': '#0093CC',
  'Racing Bulls': '#6692FF', 'Audi': '#BB9966', 'Williams': '#00A3E0',
  'Aston Martin': '#358C75', 'Cadillac': '#CC0000',
};

export function teamColor(name) {
  for (const k in teamColors) if (name && name.includes(k)) return teamColors[k];
  return '#888';
}

export const circuitInfo = {
  1:  { circuit:'Albert Park Grand Prix Circuit', city:'Melbourne', laps:58, length:'5.278 km', lat:-37.8497, lng:144.9680 },
  2:  { circuit:'Shanghai International Circuit', city:'Shanghai', laps:56, length:'5.451 km', lat:31.3389, lng:121.2197 },
  3:  { circuit:'Suzuka International Racing Course', city:'Suzuka', laps:53, length:'5.807 km', lat:34.8431, lng:136.5407 },
  4:  { circuit:'Bahrain International Circuit', city:'Sakhir', laps:57, length:'5.412 km', lat:26.0325, lng:50.5106 },
  5:  { circuit:'Jeddah Corniche Circuit', city:'Jeddah', laps:50, length:'6.174 km', lat:21.6319, lng:39.1044 },
  6:  { circuit:'Miami International Autodrome', city:'Miami', laps:57, length:'5.412 km', lat:25.9581, lng:-80.2389 },
  7:  { circuit:'Circuit Gilles Villeneuve', city:'Montreal', laps:70, length:'4.361 km', lat:45.5000, lng:-73.5228 },
  8:  { circuit:'Circuit de Monaco', city:'Monte Carlo', laps:78, length:'3.337 km', lat:43.7347, lng:7.4206 },
  9:  { circuit:'Circuit de Barcelona-Catalunya', city:'Barcelona', laps:66, length:'4.657 km', lat:41.5700, lng:2.2611 },
  10: { circuit:'Red Bull Ring', city:'Spielberg', laps:71, length:'4.318 km', lat:47.2197, lng:14.7647 },
  11: { circuit:'Silverstone Circuit', city:'Silverstone', laps:52, length:'5.891 km', lat:52.0786, lng:-1.0169 },
  12: { circuit:'Circuit de Spa-Francorchamps', city:'Spa', laps:44, length:'7.004 km', lat:50.4372, lng:5.9714 },
  13: { circuit:'Hungaroring', city:'Budapest', laps:70, length:'4.381 km', lat:47.5789, lng:19.2486 },
  14: { circuit:'Circuit Zandvoort', city:'Zandvoort', laps:72, length:'4.259 km', lat:52.3888, lng:4.5409 },
  15: { circuit:'Autodromo Nazionale di Monza', city:'Monza', laps:53, length:'5.793 km', lat:45.6156, lng:9.2811 },
  16: { circuit:'Madrid Street Circuit', city:'Madrid', laps:66, length:'5.473 km', lat:40.4168, lng:-3.7038 },
  17: { circuit:'Baku City Circuit', city:'Baku', laps:51, length:'6.003 km', lat:40.3725, lng:49.8533 },
  18: { circuit:'Marina Bay Street Circuit', city:'Singapore', laps:62, length:'4.940 km', lat:1.2914, lng:103.8640 },
  19: { circuit:'Circuit of the Americas', city:'Austin', laps:56, length:'5.513 km', lat:30.1328, lng:-97.6411 },
  20: { circuit:'Autódromo Hermanos Rodríguez', city:'Mexico City', laps:71, length:'4.304 km', lat:19.4042, lng:-99.0907 },
  21: { circuit:'Autódromo José Carlos Pace', city:'São Paulo', laps:71, length:'4.309 km', lat:-23.7036, lng:-46.6997 },
  22: { circuit:'Las Vegas Strip Circuit', city:'Las Vegas', laps:50, length:'6.201 km', lat:36.1147, lng:-115.1728 },
  23: { circuit:'Lusail International Circuit', city:'Lusail', laps:57, length:'5.419 km', lat:25.4900, lng:51.4542 },
  24: { circuit:'Yas Marina Circuit', city:'Abu Dhabi', laps:58, length:'5.281 km', lat:24.4672, lng:54.6031 },
};

export function driverFlag(nat) {
  const map = {
    'Italian':'🇮🇹','British':'🇬🇧','Monegasque':'🇲🇨','Australian':'🇦🇺',
    'Dutch':'🇳🇱','French':'🇫🇷','Spanish':'🇪🇸','German':'🇩🇪',
    'Finnish':'🇫🇮','Mexican':'🇲🇽','Canadian':'🇨🇦','Japanese':'🇯🇵',
    'Chinese':'🇨🇳','American':'🇺🇸','Brazilian':'🇧🇷','Danish':'🇩🇰',
    'Thai':'🇹🇭','New Zealander':'🇳🇿','Argentine':'🇦🇷','Swiss':'🇨🇭',
    'Swedish':'🇸🇪',
  };
  return map[nat] || '🏁';
}

export function posClass(p) {
  return p === 1 ? 'gold' : p === 2 ? 'silver' : p === 3 ? 'bronze' : '';
}

// WMO weather code → emoji 映射
export const weatherIcons = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
  80: '🌧️', 81: '🌧️', 82: '🌧️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

export function weatherIcon(code) {
  return weatherIcons[code] || '❓';
}
```

- [ ] **Step 2: Commit**

```bash
git add js/data.js
git commit -m "refactor: 提取数据层到 js/data.js，补充赛道经纬度"
```

---

## Task 3: 拆分 API 封装层 (api.js)

**Files:**
- Create: `js/api.js`

- [ ] **Step 1: 创建 js/api.js**

封装所有外部 API 调用，含内存缓存。

```js
// js/api.js

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';
const METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

const cache = new Map();

function cacheKey(url) { return url; }

async function fetchCached(url, ttlMs) {
  const key = cacheKey(url);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < ttlMs) return cached.data;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

// ─── Jolpica (Ergast) ──────────────────────────────────────────────────────

export async function getDriverStandings(year = 2026) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/driverStandings.json`, 5 * 60000);
  return data.MRData?.StandingsTable?.StandingsLists?.[0] || null;
}

export async function getConstructorStandings(year = 2026) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/constructorStandings.json`, 5 * 60000);
  return data.MRData?.StandingsTable?.StandingsLists?.[0] || null;
}

export async function getRaceResults(year = 2026, round) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/${round}/results.json`, 5 * 60000);
  return data.MRData?.RaceTable?.Races?.[0]?.Results || null;
}

export async function getQualifyingResults(year = 2026, round) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/${round}/qualifying.json`, 5 * 60000);
  return data.MRData?.RaceTable?.Races?.[0]?.QualifyingResults || null;
}

export async function getSprintResults(year = 2026, round) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/${round}/sprint.json`, 5 * 60000);
  return data.MRData?.RaceTable?.Races?.[0]?.SprintResults || null;
}

export async function getRaceSchedule(year = 2026, round) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/${round}.json`, 5 * 60000);
  return data.MRData?.RaceTable?.Races?.[0] || null;
}

export async function getSeasonSchedule(year) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}.json`, 60 * 60000);
  return data.MRData?.RaceTable?.Races || [];
}

export async function getAllResults(year = 2026) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/results.json?limit=1000`, 5 * 60000);
  return data.MRData?.RaceTable?.Races || [];
}

export async function getAllSprintResults(year = 2026) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/sprint.json?limit=1000`, 5 * 60000);
  return data.MRData?.RaceTable?.Races || [];
}

export async function getDriverResults(year = 2026, driverId) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/drivers/${driverId}/results.json`, 5 * 60000);
  return data.MRData?.RaceTable?.Races || [];
}

export async function getDriverSprintResults(year = 2026, driverId) {
  const data = await fetchCached(`${JOLPICA_BASE}/${year}/drivers/${driverId}/sprint.json`, 5 * 60000);
  return data.MRData?.RaceTable?.Races || [];
}

// ─── OpenF1 ────────────────────────────────────────────────────────────────

export async function getLatestSession() {
  const data = await fetchCached(`${OPENF1_BASE}/sessions?session_key=latest`, 30000);
  return Array.isArray(data) ? data[0] : null;
}

export async function getLivePositions(sessionKey) {
  const res = await fetch(`${OPENF1_BASE}/position?session_key=${sessionKey}`);
  return res.ok ? res.json() : [];
}

export async function getLiveLaps(sessionKey, driverNumber) {
  const url = driverNumber
    ? `${OPENF1_BASE}/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
    : `${OPENF1_BASE}/laps?session_key=${sessionKey}`;
  const res = await fetch(url);
  return res.ok ? res.json() : [];
}

export async function getLiveIntervals(sessionKey) {
  const res = await fetch(`${OPENF1_BASE}/intervals?session_key=${sessionKey}`);
  return res.ok ? res.json() : [];
}

export async function getLocationData(sessionKey) {
  const key = `circuit-loc-${sessionKey}`;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  const res = await fetch(`${OPENF1_BASE}/location?session_key=${sessionKey}&driver_number=1`);
  if (!res.ok) return [];
  const data = await res.json();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

// ─── Open-Meteo ────────────────────────────────────────────────────────────

export async function getWeatherForecast(lat, lng) {
  const url = `${METEO_BASE}?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,windspeed_10m_max&timezone=auto&forecast_days=14`;
  const data = await fetchCached(url, 30 * 60000);
  return data;
}

export function clearCache() {
  cache.clear();
}
```

- [ ] **Step 2: Commit**

```bash
git add js/api.js
git commit -m "refactor: 创建 API 封装层 js/api.js"
```

---

## Task 4: 拆分现有功能模块

**Files:**
- Create: `js/schedule.js`
- Create: `js/standings.js`
- Create: `js/chart.js`
- Create: `js/race-detail.js`
- Create: `js/ics.js`
- Create: `js/app.js`
- Modify: `index.html`

- [ ] **Step 1: 创建 js/schedule.js**

```js
// js/schedule.js
import { races, circuitInfo } from './data.js';

let countdownInterval;

function startCountdown(target) {
  clearInterval(countdownInterval);
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-d','cd-h','cd-m','cd-s'].forEach(id => document.getElementById(id).textContent = '0');
      return;
    }
    document.getElementById('cd-d').textContent = Math.floor(diff / 86400000);
    document.getElementById('cd-h').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
    document.getElementById('cd-m').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
    document.getElementById('cd-s').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

export function buildSchedule(raceList, onRaceClick) {
  const activeRaces = raceList || races;
  const today = new Date().toISOString().slice(0, 10);
  let nextRace = null;

  for (const rc of activeRaces) {
    if (!rc.cancelled && rc.end >= today && !nextRace) { nextRace = rc; }
  }

  if (nextRace) {
    document.getElementById('nr-name').textContent = nextRace.name;
    const sd = new Date(nextRace.date);
    const ed = new Date(nextRace.end);
    const fmt = d => d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    document.getElementById('nr-date').textContent =
      `${fmt(sd)} — ${ed.getDate()}日 · ${nextRace.flag}`;
    startCountdown(new Date(nextRace.date + 'T06:00:00Z'));
  } else {
    document.getElementById('nr-name').textContent = '赛季已结束';
    document.getElementById('nr-date').textContent = '期待下赛季';
  }

  const list = document.getElementById('schedule-list');
  list.innerHTML = '';

  activeRaces.forEach(rc => {
    const isPast = rc.end < today;
    const isNext = nextRace && rc.r === nextRace.r;
    const div = document.createElement('div');
    div.className = 'race-row' + (isPast && !rc.cancelled ? ' is-past clickable' : '') + (isNext ? ' is-next' : '');

    const d = new Date(rc.date);
    const dateStr = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

    let statusHtml = '';
    if (rc.cancelled) {
      statusHtml = '<span class="status-pill status-cancelled">已取消</span>';
    } else if (isPast) {
      statusHtml = '<span class="status-pill status-done">已完赛</span>';
    } else if (isNext) {
      statusHtml = '<span class="status-pill status-next">下一站</span>';
    }

    // 天气占位 — weather.js 会填充
    const weatherSpanId = `weather-r${rc.r}`;
    const weatherHtml = !isPast && !rc.cancelled ? `<span id="${weatherSpanId}" class="weather-inline"></span>` : '';

    div.innerHTML = `
      <span class="rr-round">R${rc.r}</span>
      <span class="rr-flag">${rc.flag}</span>
      <div>
        <div class="rr-name">${rc.name}</div>
      </div>
      ${rc.sprint ? '<span class="sprint-pill">冲刺</span>' : '<span></span>'}
      <div style="display:flex;align-items:center;gap:8px;">
        ${weatherHtml}
        <span class="rr-date">${dateStr}</span>
        ${statusHtml}
      </div>
    `;

    if (isPast && !rc.cancelled && onRaceClick) {
      div.addEventListener('click', () => onRaceClick(rc, div));
    }

    list.appendChild(div);
  });
}
```

- [ ] **Step 2: 创建 js/standings.js**

```js
// js/standings.js
import { teamColor, driverFlag, posClass } from './data.js';
import * as api from './api.js';

export async function loadStandings(year = 2026) {
  // Driver standings
  try {
    const list = await api.getDriverStandings(year);
    if (list) {
      renderDrivers(list.DriverStandings);
      document.getElementById('last-update').textContent =
        `积分更新至第${list.round}站 · ${new Date().toLocaleDateString('zh-CN')}`;
    }
  } catch(e) {
    document.getElementById('standings-drivers').innerHTML =
      '<div class="error-msg">加载失败，请检查网络后点击刷新</div>';
  }

  // Constructor standings
  try {
    const list2 = await api.getConstructorStandings(year);
    if (list2) renderConstructors(list2.ConstructorStandings);
  } catch(e) {
    document.getElementById('standings-constructors').innerHTML =
      '<div class="error-msg">加载失败，请检查网络后点击刷新</div>';
  }
}

function renderDrivers(standings) {
  const el = document.getElementById('standings-drivers');
  el.innerHTML = '';
  const maxPts = parseFloat(standings[0]?.points || 1);
  standings.forEach(s => {
    const pos = parseInt(s.position);
    const pts = parseFloat(s.points);
    const pct = Math.round((pts / maxPts) * 100);
    const color = teamColor(s.Constructors[0]?.name);
    const d = s.Driver;
    const flag = driverFlag(d.nationality);
    const row = document.createElement('div');
    row.className = 'driver-row clickable';
    row.dataset.driverId = d.driverId;
    row.innerHTML = `
      <span class="st-pos ${posClass(pos)}">${pos}</span>
      <span class="st-flag">${flag}</span>
      <div>
        <div class="st-name">${d.givenName} ${d.familyName}</div>
        <div class="st-team">${s.Constructors[0]?.name || ''}</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="st-pts">${pts}</span>
    `;
    el.appendChild(row);
  });
}

function renderConstructors(standings) {
  const el = document.getElementById('standings-constructors');
  el.innerHTML = '';
  const maxPts = parseFloat(standings[0]?.points || 1);
  standings.forEach(s => {
    const pos = parseInt(s.position);
    const pts = parseFloat(s.points);
    const pct = maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0;
    const color = teamColor(s.Constructor.name);
    const row = document.createElement('div');
    row.className = 'cons-row clickable';
    row.dataset.constructorId = s.Constructor.constructorId;
    row.innerHTML = `
      <span class="st-pos ${posClass(pos)}">${pos}</span>
      <div class="cons-dot" style="background:${color}"></div>
      <div class="st-name">${s.Constructor.name}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="st-pts">${pts}</span>
    `;
    el.appendChild(row);
  });
}

export function showStandings(type) {
  document.getElementById('standings-drivers').style.display = type === 'drivers' ? 'flex' : 'none';
  document.getElementById('standings-constructors').style.display = type === 'constructors' ? 'flex' : 'none';
  document.getElementById('standings-drivers').style.flexDirection = 'column';
  document.getElementById('standings-constructors').style.flexDirection = 'column';
}
```

- [ ] **Step 3: 创建 js/chart.js**

```js
// js/chart.js
import { teamColor } from './data.js';
import * as api from './api.js';

let chartData = null;
let chartMode = 'drivers';

async function loadChartData(year = 2026) {
  chartData = { drivers: {}, constructors: {}, rounds: [] };

  try {
    const allRaces = await api.getAllResults(year);
    const roundNums = [...new Set(allRaces.map(r => parseInt(r.round)))].sort((a,b) => a-b);
    chartData.rounds = roundNums;

    const driverPts = {};
    const consPts = {};

    for (const race of allRaces) {
      const rnd = parseInt(race.round);
      for (const result of (race.Results || [])) {
        const dName = result.Driver.code;
        const cName = result.Constructor.name;
        const pts = parseFloat(result.points) || 0;
        if (!driverPts[dName]) driverPts[dName] = { pts: {}, team: cName };
        driverPts[dName].pts[rnd] = (driverPts[dName].pts[rnd] || 0) + pts;
        if (!consPts[cName]) consPts[cName] = {};
        consPts[cName][rnd] = (consPts[cName][rnd] || 0) + pts;
      }
    }

    try {
      const sRaces = await api.getAllSprintResults(year);
      for (const race of sRaces) {
        const rnd = parseInt(race.round);
        for (const result of (race.SprintResults || [])) {
          const dName = result.Driver.code;
          const cName = result.Constructor.name;
          const pts = parseFloat(result.points) || 0;
          if (driverPts[dName]) driverPts[dName].pts[rnd] = (driverPts[dName].pts[rnd] || 0) + pts;
          if (consPts[cName]) consPts[cName][rnd] = (consPts[cName][rnd] || 0) + pts;
        }
      }
    } catch(e) {}

    for (const [name, data] of Object.entries(driverPts)) {
      let cum = 0;
      const series = [];
      for (const rnd of roundNums) { cum += (data.pts[rnd] || 0); series.push(cum); }
      chartData.drivers[name] = { series, team: data.team, total: cum };
    }
    for (const [name, pts] of Object.entries(consPts)) {
      let cum = 0;
      const series = [];
      for (const rnd of roundNums) { cum += (pts[rnd] || 0); series.push(cum); }
      chartData.constructors[name] = { series, total: cum };
    }
  } catch(e) {}

  return chartData;
}

export async function drawChart(mode, year = 2026, compareData = null) {
  chartMode = mode || chartMode;
  const data = await loadChartData(year);
  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const pad = { top: 10, right: 80, bottom: 30, left: 36 };

  ctx.clearRect(0, 0, W, H);

  const rounds = data.rounds;
  if (!rounds.length) return;

  let entries;
  if (chartMode === 'drivers') {
    entries = Object.entries(data.drivers)
      .sort((a,b) => b[1].total - a[1].total).slice(0, 8)
      .map(([name, d]) => ({ name, series: d.series, color: teamColor(d.team) }));
  } else {
    entries = Object.entries(data.constructors)
      .sort((a,b) => b[1].total - a[1].total)
      .map(([name, d]) => ({ name, series: d.series, color: teamColor(name) }));
  }

  const maxPts = Math.max(...entries.map(e => Math.max(...e.series)), 1);
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#666' : '#aaa';

  // Grid
  ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + plotH - (plotH * i / 5);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '10px DM Sans'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxPts * i / 5), pad.left - 6, y + 3);
  }

  // X labels
  ctx.textAlign = 'center';
  rounds.forEach((rnd, i) => {
    const x = pad.left + (plotW * i / (rounds.length - 1 || 1));
    ctx.fillStyle = textColor; ctx.font = '10px DM Sans';
    ctx.fillText('R' + rnd, x, H - pad.bottom + 16);
  });

  // Compare data (dashed lines)
  if (compareData?.rounds?.length) {
    const cEntries = chartMode === 'drivers'
      ? Object.entries(compareData.drivers).sort((a,b) => b[1].total - a[1].total).slice(0, 8)
          .map(([name, d]) => ({ name, series: d.series, color: teamColor(d.team) }))
      : Object.entries(compareData.constructors).sort((a,b) => b[1].total - a[1].total)
          .map(([name, d]) => ({ name, series: d.series, color: teamColor(name) }));

    cEntries.forEach(entry => {
      ctx.strokeStyle = entry.color; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      entry.series.forEach((pts, i) => {
        const x = pad.left + (plotW * i / (compareData.rounds.length - 1 || 1));
        const y = pad.top + plotH - (plotH * pts / maxPts);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  // Main lines
  entries.forEach(entry => {
    ctx.strokeStyle = entry.color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    entry.series.forEach((pts, i) => {
      const x = pad.left + (plotW * i / (rounds.length - 1 || 1));
      const y = pad.top + plotH - (plotH * pts / maxPts);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    const lastPts = entry.series[entry.series.length - 1];
    const lx = pad.left + plotW;
    const ly = pad.top + plotH - (plotH * lastPts / maxPts);
    ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fillStyle = entry.color; ctx.fill();
    ctx.fillStyle = isDark ? '#ccc' : '#333'; ctx.font = '10px DM Sans'; ctx.textAlign = 'left';
    ctx.fillText(entry.name, lx + 6, ly + 3);
  });
}

export function getChartMode() { return chartMode; }
export { loadChartData };
```

- [ ] **Step 4: 创建 js/race-detail.js**

```js
// js/race-detail.js
import { teamColor, circuitInfo } from './data.js';
import * as api from './api.js';

const detailCache = {};

export function toggleRaceDetail(rc, rowEl, year = 2026) {
  const existing = rowEl.nextElementSibling;
  if (existing && existing.classList.contains('race-detail')) {
    existing.remove();
    return;
  }
  const detail = document.createElement('div');
  detail.className = 'race-detail';
  detail.innerHTML = '<div class="detail-loading">加载成绩中...</div>';
  rowEl.after(detail);
  loadRaceDetail(rc, detail, year);
}

async function loadRaceDetail(rc, el, year) {
  const round = rc.r;
  const key = `${year}-r${round}`;
  if (detailCache[key]) { renderDetail(detailCache[key], rc, el); return; }

  const data = {};
  const fetches = [
    api.getQualifyingResults(year, round).then(r => { if (r) data.qualifying = r; }).catch(()=>{}),
    api.getRaceResults(year, round).then(r => { if (r) data.race = r; }).catch(()=>{}),
    api.getRaceSchedule(year, round).then(r => { if (r) data.schedule = r; }).catch(()=>{}),
  ];
  if (rc.sprint) {
    fetches.push(api.getSprintResults(year, round).then(r => { if (r) data.sprint = r; }).catch(()=>{}));
  }

  await Promise.all(fetches);
  detailCache[key] = data;
  renderDetail(data, rc, el);
}

function renderDetail(data, rc, el) {
  let html = '';

  const ci = circuitInfo[rc.r];
  if (ci) {
    html += `<div class="circuit-info">
      <span>${ci.circuit}</span><span>${ci.city}</span><span>${ci.laps} 圈</span><span>${ci.length}</span>
    </div>`;
    // 赛道 SVG 占位 — circuit.js 会填充
    html += `<div id="circuit-svg-r${rc.r}" class="circuit-svg-container"></div>`;
  }

  if (data.schedule) {
    const s = data.schedule;
    const fmtTime = (obj) => {
      if (!obj) return null;
      const d = new Date(obj.date + 'T' + obj.time);
      return d.toLocaleString('zh-CN', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:false });
    };
    const sessions = [];
    if (s.FirstPractice) sessions.push(['FP1', fmtTime(s.FirstPractice)]);
    if (s.SecondPractice) sessions.push(['FP2', fmtTime(s.SecondPractice)]);
    if (s.ThirdPractice) sessions.push(['FP3', fmtTime(s.ThirdPractice)]);
    if (s.Sprint) sessions.push(['冲刺赛', fmtTime(s.Sprint)]);
    if (s.SprintQualifying) sessions.push(['冲刺排位', fmtTime(s.SprintQualifying)]);
    if (s.Qualifying) sessions.push(['排位赛', fmtTime(s.Qualifying)]);
    sessions.push(['正赛', fmtTime({ date: s.date, time: s.time })]);
    if (sessions.length) {
      html += `<div class="session-schedule">`;
      sessions.forEach(([name, time]) => {
        if (time) html += `<div class="session-item"><strong>${name}</strong> ${time}</div>`;
      });
      html += `</div>`;
    }
  }

  // 天气详情占位 — weather.js 会填充
  html += `<div id="weather-detail-r${rc.r}" class="weather-detail-container"></div>`;

  if (data.qualifying) {
    html += buildResultTable('排位赛', data.qualifying, ['P','车手','车队','Q1','Q2','Q3'], q => {
      const color = teamColor(q.Constructor?.name);
      return `<td>${q.position}</td><td>${q.Driver.code}</td>
        <td><span class="team-dot" style="background:${color}"></span>${q.Constructor?.name||''}</td>
        <td>${q.Q1||'-'}</td><td>${q.Q2||'-'}</td><td>${q.Q3||'-'}</td>`;
    });
  }

  if (data.sprint) {
    html += buildResultTable('冲刺赛', data.sprint, ['P','车手','车队','成绩/状态','积分'], s => {
      const color = teamColor(s.Constructor?.name);
      const time = s.Time?.time || s.status || '-';
      return `<td>${s.position}</td><td>${s.Driver.code}</td>
        <td><span class="team-dot" style="background:${color}"></span>${s.Constructor?.name||''}</td>
        <td>${time}</td><td>${s.points}</td>`;
    });
  }

  if (data.race) {
    html += buildResultTable('正赛', data.race, ['P','车手','车队','成绩/状态','积分'], r => {
      const color = teamColor(r.Constructor?.name);
      const time = r.Time?.time || r.status || '-';
      return `<td>${r.position}</td><td>${r.Driver.code}</td>
        <td><span class="team-dot" style="background:${color}"></span>${r.Constructor?.name||''}</td>
        <td>${time}</td><td>${r.points}</td>`;
    });
  }

  if (!html) html = '<div class="detail-loading">暂无成绩数据</div>';
  el.innerHTML = html;

  el.querySelectorAll('.show-more-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const table = btn.previousElementSibling;
      table.querySelectorAll('tr.hidden-row').forEach(tr => tr.style.display = '');
      btn.remove();
    });
  });
}

function buildResultTable(label, items, headers, rowFn) {
  let html = `<div class="detail-section"><div class="detail-label">${label}</div>`;
  html += `<table class="result-table"><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>`;
  items.forEach((item, i) => {
    const pos = parseInt(item.position);
    const cls = pos <= 3 ? `pos-${pos}` : '';
    const hidden = i >= 10 ? ' hidden-row" style="display:none' : '';
    html += `<tr class="${cls}${hidden}">${rowFn(item)}</tr>`;
  });
  html += `</table>`;
  if (items.length > 10) {
    html += `<button class="show-more-btn">查看全部 ${items.length} 名车手</button>`;
  }
  html += `</div>`;
  return html;
}
```

- [ ] **Step 5: 创建 js/ics.js**

```js
// js/ics.js
import { races, circuitInfo } from './data.js';

export function exportICS() {
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//F1 2026//CN\r\nCALSCALE:GREGORIAN\r\n';
  races.forEach(rc => {
    if (rc.cancelled) return;
    const start = rc.date.replace(/-/g, '');
    const endD = new Date(rc.end);
    endD.setDate(endD.getDate() + 1);
    const end = endD.toISOString().slice(0,10).replace(/-/g, '');
    ics += `BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\n`;
    ics += `SUMMARY:F1 R${rc.r} ${rc.name}${rc.sprint ? ' (冲刺周末)' : ''}\r\n`;
    const ci = circuitInfo[rc.r];
    if (ci) ics += `LOCATION:${ci.circuit}, ${ci.city}\r\n`;
    ics += `END:VEVENT\r\n`;
  });
  ics += 'END:VCALENDAR\r\n';
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'F1-2026-Calendar.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}
```

- [ ] **Step 6: 创建 js/app.js（入口协调器）**

```js
// js/app.js
import { races } from './data.js';
import { buildSchedule } from './schedule.js';
import { loadStandings, showStandings } from './standings.js';
import { drawChart, getChartMode } from './chart.js';
import { toggleRaceDetail } from './race-detail.js';
import { exportICS } from './ics.js';
import { initWeather } from './weather.js';
import { initLive } from './live.js';
import { initDriverDetail } from './driver-detail.js';

// ─── 全局状态 ──────────────────────────────────────────────────────────────
export let currentSeason = 2026;

// ─── 主题切换 ──────────────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? '' : 'dark');
  document.querySelector('.theme-toggle').textContent = isDark ? '☀' : '☾';
  localStorage.setItem('f1-theme', isDark ? 'light' : 'dark');
  drawChart(getChartMode(), currentSeason);
}

(function initTheme() {
  const saved = localStorage.getItem('f1-theme');
  if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme:dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '☾';
  }
})();

// ─── 赛季切换 ──────────────────────────────────────────────────────────────
async function switchSeason(year) {
  currentSeason = year;
  if (year === 2026) {
    buildSchedule(races, (rc, div) => toggleRaceDetail(rc, div, year));
  } else {
    // 历史赛季由 history.js 处理
    const { loadHistorySeason } = await import('./history.js');
    loadHistorySeason(year);
  }
  loadStandings(year);
  drawChart(getChartMode(), year);
}

// ─── 绑定全局事件 ──────────────────────────────────────────────────────────
window.toggleTheme = toggleTheme;
window.exportICS = exportICS;
window.showStandings = (type, btn) => {
  showStandings(type);
  document.querySelectorAll('.standings-tabs .s-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
};
window.refreshStandings = () => loadStandings(currentSeason);
window.switchSeason = switchSeason;
window.drawChartTab = (mode, btn) => {
  document.querySelectorAll('.chart-tabs .s-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  drawChart(mode, currentSeason);
};

// ─── 初始化 ──────────────────────────────────────────────────────────────
buildSchedule(races, (rc, div) => toggleRaceDetail(rc, div, currentSeason));
loadStandings(currentSeason);
drawChart('drivers', currentSeason);
window.addEventListener('resize', () => drawChart(getChartMode(), currentSeason));

// 新功能初始化
initWeather();
initLive();
initDriverDetail();
```

- [ ] **Step 7: 修改 index.html**

将 `index.html` 中整个 `<script>...</script>` 块（第 414-1030 行）替换为：

```html
<script type="module" src="js/app.js"></script>
```

在 header 中添加赛季选择器（`.season-badge` 后面）：

```html
<select id="season-select" class="season-select" onchange="switchSeason(parseInt(this.value))">
  <option value="2026" selected>2026</option>
  <option value="2025">2025</option>
  <option value="2024">2024</option>
</select>
```

在 `<main>` 开头添加 LIVE 横幅占位：

```html
<div id="live-banner" class="live-banner" style="display:none"></div>
```

修改积分榜 tabs 按钮 onclick 为：

```html
<button class="s-tab active" onclick="showStandings('drivers', this)">车手</button>
<button class="s-tab" onclick="showStandings('constructors', this)">车队</button>
<button class="refresh-btn" onclick="refreshStandings()" style="margin:0;margin-left:auto;">↻ 刷新</button>
```

修改趋势图 tabs 按钮 onclick 为：

```html
<button class="s-tab active" onclick="drawChartTab('drivers', this)">车手 Top 8</button>
<button class="s-tab" onclick="drawChartTab('constructors', this)">车队</button>
```

在趋势图 tabs 中添加对比按钮：

```html
<button class="s-tab" id="compare-btn" onclick="toggleCompare()">对比</button>
```

- [ ] **Step 8: 浏览器验证所有现有功能正常**

启动 `python3 -m http.server 8000`，逐一验证：
- 页面加载，倒计时正常
- 积分榜车手/车队切换
- 赛程列表显示
- 点击已完赛展开详情
- 积分趋势图
- 深色模式切换
- ICS 导出

- [ ] **Step 9: Commit**

```bash
git add js/app.js js/schedule.js js/standings.js js/chart.js js/race-detail.js js/ics.js index.html
git commit -m "refactor: 拆分 JS 为 ES Modules 多文件结构"
```

---

## Task 5: 功能 A — 车手/车队详情页

**Files:**
- Create: `js/driver-detail.js`
- Modify: `css/components.css`

- [ ] **Step 1: 添加组件样式到 css/components.css**

```css
/* ─── 车手/车队详情面板 ─── */
.driver-detail-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 4px 4px;
  padding: 1rem 14px;
  margin-top: -5px;
  margin-bottom: 4px;
}
.driver-detail-panel .detail-label {
  font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--red); font-weight: 500; margin-bottom: 0.5rem;
}
.driver-detail-tabs {
  display: flex; gap: 6px; margin-bottom: 1rem;
}
.driver-mini-chart {
  width: 100%; height: 160px;
}
.driver-season-table {
  width: 100%; border-collapse: collapse; font-size: 0.8rem;
}
.driver-season-table th {
  text-align: left; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--muted); font-weight: 500; padding: 4px 6px; border-bottom: 1px solid var(--border);
}
.driver-season-table td {
  padding: 5px 6px; border-bottom: 1px solid rgba(0,0,0,0.04);
}
.constructor-compare {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}
```

- [ ] **Step 2: 创建 js/driver-detail.js**

```js
// js/driver-detail.js
import { teamColor } from './data.js';
import * as api from './api.js';

export function initDriverDetail() {
  // 车手行点击
  document.getElementById('standings-drivers').addEventListener('click', e => {
    const row = e.target.closest('.driver-row');
    if (!row) return;
    const driverId = row.dataset.driverId;
    if (!driverId) return;
    toggleDriverPanel(driverId, row);
  });

  // 车队行点击
  document.getElementById('standings-constructors').addEventListener('click', e => {
    const row = e.target.closest('.cons-row');
    if (!row) return;
    const constructorId = row.dataset.constructorId;
    if (!constructorId) return;
    toggleConstructorPanel(constructorId, row);
  });
}

function toggleDriverPanel(driverId, rowEl) {
  const existing = rowEl.nextElementSibling;
  if (existing && existing.classList.contains('driver-detail-panel')) {
    existing.remove();
    return;
  }
  // 关闭其他已打开的面板
  document.querySelectorAll('.driver-detail-panel').forEach(p => p.remove());

  const panel = document.createElement('div');
  panel.className = 'driver-detail-panel';
  panel.innerHTML = '<div class="detail-loading">加载车手数据...</div>';
  rowEl.after(panel);
  loadDriverDetail(driverId, panel);
}

async function loadDriverDetail(driverId, el) {
  const year = (await import('./app.js')).currentSeason;

  try {
    const [raceResults, sprintResults] = await Promise.all([
      api.getDriverResults(year, driverId),
      api.getDriverSprintResults(year, driverId).catch(() => []),
    ]);

    let html = '';

    // 赛季成绩表
    html += `<div class="detail-label">赛季成绩</div>`;
    html += `<table class="driver-season-table">`;
    html += `<tr><th>站</th><th>大奖赛</th><th>排位</th><th>正赛</th><th>积分</th></tr>`;

    for (const race of raceResults) {
      const result = race.Results?.[0];
      if (!result) continue;
      html += `<tr>
        <td>R${race.round}</td>
        <td>${race.raceName}</td>
        <td>${result.grid}</td>
        <td>P${result.position}</td>
        <td>${result.points}</td>
      </tr>`;
    }
    html += `</table>`;

    // 积分累计曲线
    html += `<div style="margin-top:1rem"><div class="detail-label">积分趋势</div>`;
    html += `<canvas class="driver-mini-chart" id="driver-chart-${driverId}"></canvas></div>`;

    el.innerHTML = html;

    // 绘制小图
    drawMiniChart(driverId, raceResults, sprintResults);
  } catch(e) {
    el.innerHTML = '<div class="error-msg">加载失败</div>';
  }
}

function drawMiniChart(driverId, raceResults, sprintResults) {
  const canvas = document.getElementById(`driver-chart-${driverId}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const pad = { top: 8, right: 40, bottom: 24, left: 30 };

  // 累计积分
  const points = [];
  let cum = 0;
  const rounds = [];
  for (const race of raceResults) {
    const pts = parseFloat(race.Results?.[0]?.points || 0);
    // 加上对应冲刺积分
    const sprintRace = sprintResults.find(s => s.round === race.round);
    const sprintPts = parseFloat(sprintRace?.SprintResults?.[0]?.points || 0);
    cum += pts + sprintPts;
    points.push(cum);
    rounds.push('R' + race.round);
  }

  if (!points.length) return;

  const maxPts = Math.max(...points, 1);
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#666' : '#aaa';
  const color = teamColor(raceResults[0]?.Results?.[0]?.Constructor?.name);

  // Grid
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = pad.top + plotH - (plotH * i / 3);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '9px DM Sans'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxPts * i / 3), pad.left - 4, y + 3);
  }

  // X labels
  ctx.textAlign = 'center'; ctx.font = '9px DM Sans'; ctx.fillStyle = textColor;
  rounds.forEach((label, i) => {
    const x = pad.left + (plotW * i / (rounds.length - 1 || 1));
    ctx.fillText(label, x, H - pad.bottom + 14);
  });

  // Line
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((pts, i) => {
    const x = pad.left + (plotW * i / (points.length - 1 || 1));
    const y = pad.top + plotH - (plotH * pts / maxPts);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // End label
  const lastPts = points[points.length - 1];
  const lx = pad.left + plotW;
  const ly = pad.top + plotH - (plotH * lastPts / maxPts);
  ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = isDark ? '#ccc' : '#333'; ctx.font = '10px DM Sans'; ctx.textAlign = 'left';
  ctx.fillText(lastPts, lx + 6, ly + 3);
}

function toggleConstructorPanel(constructorId, rowEl) {
  const existing = rowEl.nextElementSibling;
  if (existing && existing.classList.contains('driver-detail-panel')) {
    existing.remove();
    return;
  }
  document.querySelectorAll('.driver-detail-panel').forEach(p => p.remove());

  const panel = document.createElement('div');
  panel.className = 'driver-detail-panel';
  panel.innerHTML = '<div class="detail-loading">加载车队数据...</div>';
  rowEl.after(panel);
  loadConstructorDetail(constructorId, panel);
}

async function loadConstructorDetail(constructorId, el) {
  const year = (await import('./app.js')).currentSeason;

  try {
    const data = await api.getConstructorStandings(year);
    if (!data) { el.innerHTML = '<div class="error-msg">无数据</div>'; return; }

    const team = data.ConstructorStandings.find(s => s.Constructor.constructorId === constructorId);
    if (!team) { el.innerHTML = '<div class="error-msg">未找到车队</div>'; return; }

    // 获取该车队的车手积分榜
    const driverData = await api.getDriverStandings(year);
    const teamDrivers = driverData?.DriverStandings?.filter(
      s => s.Constructors[0]?.constructorId === constructorId
    ) || [];

    let html = `<div class="detail-label">${team.Constructor.name} · ${year} 赛季</div>`;
    html += `<div class="constructor-compare">`;

    for (const ds of teamDrivers) {
      const d = ds.Driver;
      const color = teamColor(team.Constructor.name);
      html += `<div>
        <div style="font-size:0.9rem;font-weight:500;margin-bottom:4px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle;"></span>
          ${d.givenName} ${d.familyName}
        </div>
        <div style="font-size:0.8rem;color:var(--muted);">
          P${ds.position} · ${ds.points} 分 · ${ds.wins} 胜
        </div>
      </div>`;
    }

    html += `</div>`;
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<div class="error-msg">加载失败</div>';
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add js/driver-detail.js css/components.css
git commit -m "feat: 车手/车队详情面板（点击积分榜展开）"
```

---

## Task 6: 功能 B — 实时比赛状态

**Files:**
- Create: `js/live.js`
- Modify: `css/components.css`

- [ ] **Step 1: 添加 LIVE 样式到 css/components.css**

追加以下内容：

```css
/* ─── 实时比赛横幅 ─── */
.live-banner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--red);
  border-radius: 4px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}
.live-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 0.75rem;
}
.live-dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--red);
  animation: livePulse 1.5s ease-in-out infinite;
}
@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.live-label {
  font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem;
  letter-spacing: 0.08em; color: var(--red);
}
.live-session-name {
  font-size: 0.85rem; color: var(--muted);
}
.live-close {
  margin-left: auto; background: none; border: none; color: var(--muted);
  cursor: pointer; font-size: 1.1rem;
}
.live-table {
  width: 100%; border-collapse: collapse; font-size: 0.8rem;
}
.live-table th {
  text-align: left; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--muted); font-weight: 500; padding: 4px 6px; border-bottom: 1px solid var(--border);
}
.live-table td {
  padding: 5px 6px; border-bottom: 1px solid rgba(0,0,0,0.04);
}
```

- [ ] **Step 2: 创建 js/live.js**

```js
// js/live.js
import * as api from './api.js';
import { teamColor } from './data.js';

let pollTimer = null;
let currentSessionKey = null;

export async function initLive() {
  try {
    const session = await api.getLatestSession();
    if (!session) return;

    // 判断是否进行中：date_end 为 null 或在未来
    const endTime = session.date_end ? new Date(session.date_end) : null;
    const isLive = !endTime || endTime > new Date();

    if (isLive) {
      currentSessionKey = session.session_key;
      showLiveBanner(session);
      startPolling();
    }
  } catch(e) {
    // OpenF1 不可用时静默失败
  }
}

function showLiveBanner(session) {
  const banner = document.getElementById('live-banner');
  if (!banner) return;
  banner.style.display = 'block';
  banner.innerHTML = `
    <div class="live-header">
      <div class="live-dot"></div>
      <span class="live-label">LIVE</span>
      <span class="live-session-name">${session.session_name || ''} — ${session.meeting_name || ''}</span>
      <button class="live-close" onclick="closeLive()">✕</button>
    </div>
    <table class="live-table">
      <tr><th>P</th><th>车手</th><th>间隔</th><th>最新圈速</th></tr>
      <tbody id="live-positions"><tr><td colspan="4" style="color:var(--muted)">加载中...</td></tr></tbody>
    </table>
  `;
}

async function updatePositions() {
  if (!currentSessionKey) return;

  try {
    const [positions, intervals] = await Promise.all([
      api.getLivePositions(currentSessionKey),
      api.getLiveIntervals(currentSessionKey),
    ]);

    // 取每个车手最新位置
    const latestPos = {};
    for (const p of positions) {
      if (!latestPos[p.driver_number] || new Date(p.date) > new Date(latestPos[p.driver_number].date)) {
        latestPos[p.driver_number] = p;
      }
    }

    // 取每个车手最新间隔
    const latestInt = {};
    for (const iv of intervals) {
      if (!latestInt[iv.driver_number] || new Date(iv.date) > new Date(latestInt[iv.driver_number].date)) {
        latestInt[iv.driver_number] = iv;
      }
    }

    const sorted = Object.values(latestPos).sort((a, b) => a.position - b.position);

    const tbody = document.getElementById('live-positions');
    if (!tbody) return;

    tbody.innerHTML = sorted.slice(0, 20).map(p => {
      const iv = latestInt[p.driver_number];
      const gap = iv ? (iv.gap_to_leader != null ? `+${iv.gap_to_leader}s` : '-') : '-';
      const lapTime = iv?.lap_time || '-';
      return `<tr>
        <td>${p.position}</td>
        <td>#${p.driver_number}</td>
        <td>${gap}</td>
        <td>${lapTime}</td>
      </tr>`;
    }).join('');
  } catch(e) {}
}

function startPolling() {
  updatePositions();
  pollTimer = setInterval(updatePositions, 10000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(pollTimer);
      pollTimer = null;
    } else if (!pollTimer && currentSessionKey) {
      updatePositions();
      pollTimer = setInterval(updatePositions, 10000);
    }
  });
}

window.closeLive = function() {
  const banner = document.getElementById('live-banner');
  if (banner) banner.style.display = 'none';
  clearInterval(pollTimer);
  pollTimer = null;
  currentSessionKey = null;
};
```

- [ ] **Step 3: Commit**

```bash
git add js/live.js css/components.css
git commit -m "feat: 实时比赛状态（OpenF1 API 轮询）"
```

---

## Task 7: 功能 C — 赛道 SVG 可视化

**Files:**
- Create: `js/circuit.js`
- Modify: `css/components.css`

- [ ] **Step 1: 添加赛道样式到 css/components.css**

```css
/* ─── 赛道可视化 ─── */
.circuit-svg-container {
  width: 100%; height: 180px; margin-bottom: 0.75rem;
  display: flex; align-items: center; justify-content: center;
}
.circuit-svg-container svg {
  max-width: 100%; max-height: 100%;
}
.circuit-svg-container .no-circuit {
  font-size: 0.75rem; color: var(--muted);
}
```

- [ ] **Step 2: 创建 js/circuit.js**

```js
// js/circuit.js

// 简化的赛道 SVG 路径数据（代表性赛道）
// 每条赛道用一个 SVG path d 属性值表示轮廓
const circuitPaths = {
  1:  { // Albert Park
    viewBox: '0 0 400 300',
    path: 'M 80,250 C 60,200 50,150 70,100 C 90,50 140,30 200,25 C 260,20 320,40 350,80 C 380,120 370,180 340,220 C 310,260 250,280 200,275 C 150,270 100,260 80,250 Z',
    drs: [{ x1: 200, y1: 25, x2: 320, y2: 40 }, { x1: 80, y1: 250, x2: 70, y2: 150 }],
    start: { x: 100, y: 260 },
  },
  2:  { // Shanghai
    viewBox: '0 0 400 300',
    path: 'M 50,200 L 50,100 C 50,60 80,40 120,40 L 250,40 C 280,40 300,60 300,80 L 300,120 C 300,140 320,150 340,140 L 370,120 C 380,115 390,130 380,145 L 340,200 C 330,220 300,230 280,220 L 200,180 C 180,170 160,180 160,200 L 160,240 C 160,260 140,270 120,260 L 70,230 C 55,220 50,210 50,200 Z',
    drs: [{ x1: 50, y1: 200, x2: 50, y2: 100 }],
    start: { x: 50, y: 180 },
  },
  3:  { // Suzuka (figure 8)
    viewBox: '0 0 400 300',
    path: 'M 60,180 C 40,140 50,80 100,50 C 150,20 220,30 260,70 C 280,90 260,130 230,140 C 200,150 180,170 200,200 C 220,230 280,240 320,220 C 360,200 380,150 360,110 C 340,70 300,60 280,80 L 260,70 C 300,30 370,40 390,100 C 410,160 380,240 320,260 C 260,280 180,270 140,240 C 100,210 80,220 60,180 Z',
    drs: [{ x1: 60, y1: 180, x2: 100, y2: 50 }],
    start: { x: 80, y: 200 },
  },
  8:  { // Monaco
    viewBox: '0 0 400 300',
    path: 'M 40,200 L 40,100 C 40,70 60,50 90,50 L 300,50 C 330,50 350,70 350,100 L 350,130 C 350,150 340,160 320,160 L 200,160 C 180,160 170,170 170,190 L 170,240 C 170,260 150,270 130,260 L 60,220 C 45,215 40,210 40,200 Z',
    drs: [],
    start: { x: 40, y: 180 },
  },
  11: { // Silverstone
    viewBox: '0 0 400 300',
    path: 'M 100,260 L 40,200 C 25,185 30,160 50,150 L 120,120 C 140,110 150,90 140,70 L 130,50 C 125,35 140,25 160,30 L 280,60 C 300,65 320,55 330,40 C 340,25 360,25 370,40 L 380,80 C 385,100 370,120 350,120 L 300,130 C 280,135 270,150 280,170 L 320,240 C 330,260 310,280 290,270 L 200,230 C 180,220 160,230 150,250 L 140,260 C 130,275 110,275 100,260 Z',
    drs: [{ x1: 100, y1: 260, x2: 40, y2: 200 }, { x1: 280, y1: 170, x2: 320, y2: 240 }],
    start: { x: 120, y: 260 },
  },
  15: { // Monza
    viewBox: '0 0 400 300',
    path: 'M 80,260 L 60,80 C 55,50 80,30 110,35 L 300,60 C 330,65 350,90 340,120 L 320,180 C 310,210 330,240 350,240 C 370,240 380,220 370,200 L 360,160 C 355,140 365,120 380,120 C 395,120 400,140 390,160 L 350,270 C 340,290 310,290 300,270 L 260,200 C 250,180 220,180 200,200 L 120,270 C 110,280 90,275 80,260 Z',
    drs: [{ x1: 80, y1: 260, x2: 60, y2: 80 }, { x1: 300, y1: 270, x2: 350, y2: 270 }],
    start: { x: 80, y: 240 },
  },
};

export function renderCircuitSvg(round) {
  const container = document.getElementById(`circuit-svg-r${round}`);
  if (!container) return;

  const data = circuitPaths[round];
  if (!data) {
    container.innerHTML = '<span class="no-circuit">赛道图暂未收录</span>';
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const trackColor = isDark ? '#555' : '#ccc';
  const drsColor = '#00cc44';
  const startColor = 'var(--red)';

  let svg = `<svg viewBox="${data.viewBox}" xmlns="http://www.w3.org/2000/svg">`;

  // 赛道轮廓
  svg += `<path d="${data.path}" fill="none" stroke="${trackColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;

  // DRS 区域高亮
  for (const drs of data.drs) {
    svg += `<line x1="${drs.x1}" y1="${drs.y1}" x2="${drs.x2}" y2="${drs.y2}" stroke="${drsColor}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
  }

  // 起终点
  if (data.start) {
    svg += `<circle cx="${data.start.x}" cy="${data.start.y}" r="5" fill="${startColor}"/>`;
    svg += `<text x="${data.start.x + 10}" y="${data.start.y + 4}" fill="${isDark ? '#aaa' : '#666'}" font-size="11" font-family="DM Sans">S/F</text>`;
  }

  // 图例
  svg += `<rect x="10" y="270" width="16" height="3" rx="1" fill="${drsColor}" opacity="0.7"/>`;
  svg += `<text x="30" y="274" fill="${isDark ? '#777' : '#999'}" font-size="9" font-family="DM Sans">DRS</text>`;

  svg += `</svg>`;
  container.innerHTML = svg;
}

// 监听赛道详情展开，自动渲染 SVG
export function initCircuitObserver() {
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.classList?.contains('race-detail')) {
          const svgContainer = node.querySelector('[id^="circuit-svg-r"]');
          if (svgContainer) {
            const round = parseInt(svgContainer.id.replace('circuit-svg-r', ''));
            renderCircuitSvg(round);
          }
        }
      }
    }
  });
  const scheduleList = document.getElementById('schedule-list');
  if (scheduleList) observer.observe(scheduleList, { childList: true });
}
```

- [ ] **Step 3: 在 app.js 中初始化赛道观察器**

在 `js/app.js` 的初始化部分添加：

```js
import { initCircuitObserver } from './circuit.js';
// ... 在初始化区域末尾添加：
initCircuitObserver();
```

- [ ] **Step 4: Commit**

```bash
git add js/circuit.js css/components.css js/app.js
git commit -m "feat: 赛道 SVG 可视化（展开详情自动显示）"
```

---

## Task 8: 功能 D — 历史赛季对比

**Files:**
- Create: `js/history.js`
- Modify: `css/components.css`

- [ ] **Step 1: 添加赛季选择器样式到 css/components.css**

```css
/* ─── 赛季选择器 ─── */
.season-select {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem; font-weight: 500; letter-spacing: 0.06em;
  background: var(--surface); color: var(--text);
  border: 1px solid var(--border); border-radius: 2px;
  padding: 4px 8px; cursor: pointer;
  appearance: auto;
}
.season-select:hover { border-color: var(--red); }
```

- [ ] **Step 2: 创建 js/history.js**

```js
// js/history.js
import * as api from './api.js';
import { teamColor } from './data.js';
import { buildSchedule } from './schedule.js';
import { toggleRaceDetail } from './race-detail.js';
import { loadChartData, drawChart, getChartMode } from './chart.js';

export async function loadHistorySeason(year) {
  // 从 API 获取历史赛程
  try {
    const apiRaces = await api.getSeasonSchedule(year);
    const raceList = apiRaces.map((r, i) => ({
      r: parseInt(r.round),
      name: r.raceName,
      flag: '🏁',
      date: r.date,
      end: r.date,
      sprint: !!r.Sprint,
      cancelled: false,
    }));

    buildSchedule(raceList, (rc, div) => toggleRaceDetail(rc, div, year));
  } catch(e) {
    document.getElementById('schedule-list').innerHTML =
      '<div class="error-msg">加载历史赛程失败</div>';
  }
}

// 对比模式
let compareYear = null;
let compareChartData = null;

export async function toggleCompare() {
  if (compareYear) {
    compareYear = null;
    compareChartData = null;
    const { currentSeason } = await import('./app.js');
    drawChart(getChartMode(), currentSeason);
    document.getElementById('compare-btn').textContent = '对比';
    return;
  }

  const { currentSeason } = await import('./app.js');
  // 选择对比赛季：如果当前是 2026 则对比 2025，反之对比 2026
  compareYear = currentSeason === 2026 ? 2025 : 2026;

  try {
    compareChartData = await loadChartData(compareYear);
    drawChart(getChartMode(), currentSeason, compareChartData);
    document.getElementById('compare-btn').textContent = `对比 ${compareYear} ✕`;
  } catch(e) {
    compareYear = null;
  }
}

window.toggleCompare = toggleCompare;
```

- [ ] **Step 3: Commit**

```bash
git add js/history.js css/components.css
git commit -m "feat: 历史赛季切换 + 趋势图对比模式"
```

---

## Task 9: 功能 F — 天气集成

**Files:**
- Create: `js/weather.js`
- Modify: `css/components.css`

- [ ] **Step 1: 添加天气样式到 css/components.css**

```css
/* ─── 天气 ─── */
.weather-inline {
  font-size: 0.75rem; white-space: nowrap; color: var(--muted);
}
.weather-detail-container {
  margin-bottom: 0.75rem;
}
.weather-detail-grid {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.weather-day {
  background: var(--surface2); border: 1px solid var(--border); border-radius: 4px;
  padding: 8px 12px; text-align: center; min-width: 80px;
}
.weather-day-label {
  font-size: 0.65rem; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase;
  margin-bottom: 4px;
}
.weather-day-icon { font-size: 1.4rem; margin-bottom: 2px; }
.weather-day-temp { font-size: 0.75rem; }
.weather-day-detail { font-size: 0.65rem; color: var(--muted); margin-top: 2px; }
```

- [ ] **Step 2: 创建 js/weather.js**

```js
// js/weather.js
import { races, circuitInfo, weatherIcon } from './data.js';
import * as api from './api.js';

export async function initWeather() {
  const today = new Date();
  const in14Days = new Date(today);
  in14Days.setDate(in14Days.getDate() + 14);
  const todayStr = today.toISOString().slice(0, 10);
  const futureStr = in14Days.toISOString().slice(0, 10);

  // 找未来 14 天内的比赛
  const upcoming = races.filter(rc =>
    !rc.cancelled && rc.date >= todayStr && rc.date <= futureStr
  );

  for (const rc of upcoming) {
    const ci = circuitInfo[rc.r];
    if (!ci?.lat || !ci?.lng) continue;

    try {
      const weather = await api.getWeatherForecast(ci.lat, ci.lng);
      if (!weather?.daily) continue;

      // 内联天气（赛程列表）
      const raceIdx = weather.daily.time.indexOf(rc.date);
      if (raceIdx !== -1) {
        const code = weather.daily.weathercode[raceIdx];
        const hi = Math.round(weather.daily.temperature_2m_max[raceIdx]);
        const lo = Math.round(weather.daily.temperature_2m_min[raceIdx]);
        const span = document.getElementById(`weather-r${rc.r}`);
        if (span) {
          span.textContent = `${weatherIcon(code)} ${lo}-${hi}°C`;
        }
      }
    } catch(e) {}
  }

  // 监听赛道详情展开，填充天气详情
  observeWeatherDetail();
}

function observeWeatherDetail() {
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.classList?.contains('race-detail')) {
          const container = node.querySelector('[id^="weather-detail-r"]');
          if (container) {
            const round = parseInt(container.id.replace('weather-detail-r', ''));
            fillWeatherDetail(round, container);
          }
        }
      }
    }
  });
  const scheduleList = document.getElementById('schedule-list');
  if (scheduleList) observer.observe(scheduleList, { childList: true });
}

async function fillWeatherDetail(round, container) {
  const rc = races.find(r => r.r === round);
  if (!rc || rc.cancelled) return;

  const ci = circuitInfo[round];
  if (!ci?.lat || !ci?.lng) return;

  const today = new Date().toISOString().slice(0, 10);
  // 只为未来的比赛显示天气
  if (rc.end < today) return;

  try {
    const weather = await api.getWeatherForecast(ci.lat, ci.lng);
    if (!weather?.daily) return;

    // 找比赛周末的天气（date 到 end）
    const startDate = new Date(rc.date);
    const endDate = new Date(rc.end);
    const days = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const idx = weather.daily.time.indexOf(dateStr);
      if (idx !== -1) {
        days.push({
          label: d.toLocaleDateString('zh-CN', { weekday: 'short', month: 'numeric', day: 'numeric' }),
          code: weather.daily.weathercode[idx],
          hi: Math.round(weather.daily.temperature_2m_max[idx]),
          lo: Math.round(weather.daily.temperature_2m_min[idx]),
          precip: weather.daily.precipitation_probability_max?.[idx] ?? '-',
          wind: weather.daily.windspeed_10m_max?.[idx] ? Math.round(weather.daily.windspeed_10m_max[idx]) : '-',
        });
      }
    }

    if (!days.length) return;

    let html = `<div class="detail-label">比赛周末天气</div>`;
    html += `<div class="weather-detail-grid">`;
    for (const day of days) {
      html += `<div class="weather-day">
        <div class="weather-day-label">${day.label}</div>
        <div class="weather-day-icon">${weatherIcon(day.code)}</div>
        <div class="weather-day-temp">${day.lo}° / ${day.hi}°</div>
        <div class="weather-day-detail">降水 ${day.precip}% · 风 ${day.wind}km/h</div>
      </div>`;
    }
    html += `</div>`;
    container.innerHTML = html;
  } catch(e) {}
}
```

- [ ] **Step 3: Commit**

```bash
git add js/weather.js css/components.css
git commit -m "feat: 天气集成（赛程内联 + 详情展开显示周末天气）"
```

---

## Task 10: 集成验证与收尾

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 浏览器全面验证**

启动 `python3 -m http.server 8000` 并验证：
1. 页面正常加载，无 console 错误
2. 积分榜加载，点击车手/车队展开详情面板
3. 赛程列表显示，近期比赛显示天气图标
4. 已完赛点击展开 → 赛道 SVG 显示 + 成绩表
5. 赛季选择器切换到 2025 → 数据刷新
6. 趋势图对比按钮工作
7. LIVE 横幅（无比赛时不显示即正确）
8. 深色模式切换后所有组件样式正常
9. 移动端响应式布局正常
10. ICS 导出功能正常

- [ ] **Step 2: 更新 CLAUDE.md**

更新项目文档反映新的多文件结构和新功能。

- [ ] **Step 3: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: 更新 CLAUDE.md 反映多文件结构和新功能"
```
