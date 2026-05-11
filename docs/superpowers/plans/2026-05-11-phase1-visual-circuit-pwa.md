# Phase 1: Visual Upgrade + Circuit Maps + PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the F1 2026 Season Hub with professional visual design, accurate circuit SVG maps, and PWA support for offline use.

**Architecture:** CSS-first visual overhaul using CSS variables and Grid/Flexbox, new circuit data module with accurate SVG paths, Service Worker for caching static assets and API responses.

**Tech Stack:** Vanilla HTML/CSS/JS, ES Modules, Service Worker API, CSS Grid/Flexbox, Canvas API

---

## File Structure

### Files to Modify
- `css/style.css` — Complete visual redesign with new color system, spacing, animations
- `css/components.css` — New component styles for circuit, skeleton, animations
- `index.html` — Add PWA manifest link, meta tags
- `js/circuit.js` — Refactor to use new circuit data structure

### Files to Create
- `js/circuit-data.js` — Accurate SVG data for all 24 circuits
- `manifest.json` — PWA manifest
- `sw.js` — Service Worker for caching
- `icons/icon-192.png` — PWA icon 192x192
- `icons/icon-512.png` — PWA icon 512x512

### Files to Test
- Manual browser testing for visual changes
- Lighthouse audit for PWA

---

## Task 1: CSS Variables System Overhaul

**Files:**
- Modify: `css/style.css:1-28`

- [ ] **Step 1: Update CSS variables in :root**

```css
:root {
  /* Red accent */
  --red: #E8002D;
  --red-dark: #a8001f;
  --red-light: #ff1744;

  /* Neutral scale */
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

  /* Semantic colors */
  --success: #00c853;
  --warning: #ff9100;
  --error: #ff1744;

  /* Surface colors */
  --bg: var(--gray-50);
  --surface: #ffffff;
  --surface2: var(--gray-100);
  --border: rgba(0,0,0,0.09);
  --text: var(--gray-900);
  --muted: var(--gray-500);
  --accent: var(--red);

  /* Spacing (8px grid) */
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px */
  --space-4: 2rem;     /* 32px */
  --space-6: 3rem;     /* 48px */

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);

  /* Typography */
  --font-display: 'Bebas Neue', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

- [ ] **Step 2: Update dark theme variables**

```css
[data-theme="dark"] {
  --bg: #0a0a0c;
  --surface: #141416;
  --surface2: #1c1c1e;
  --border: rgba(255,255,255,0.06);
  --text: #f0f0f0;
  --muted: #666;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
  --shadow-md: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
  --shadow-lg: 0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2);
}
```

- [ ] **Step 3: Verify existing styles still work**

Open `index.html` in browser, check:
- Header renders correctly
- Countdown block displays
- Standings list shows
- Schedule list shows
- Chart renders

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "refactor: update CSS variables system with neutral scale and spacing tokens"
```

---

## Task 2: Card Design System

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Update card base styles**

Replace existing `.race-row`, `.driver-row`, `.cons-row` styles:

```css
.race-row, .driver-row, .cons-row {
  display: grid;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.race-row:hover, .driver-row:hover, .cons-row:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

- [ ] **Step 2: Update grid templates for race rows**

```css
.race-row {
  grid-template-columns: 36px 28px 1fr auto auto;
}

.driver-row {
  grid-template-columns: 28px 24px 1fr 130px 44px;
}

.cons-row {
  grid-template-columns: 28px 12px 1fr 130px 44px;
}
```

- [ ] **Step 3: Update next-race-block card**

```css
.next-race-block {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--red);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

- [ ] **Step 4: Update countdown units**

```css
.cd-unit {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  text-align: center;
  min-width: 64px;
  box-shadow: var(--shadow-sm);
}
```

- [ ] **Step 5: Update chart container**

```css
.chart-container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-top: var(--space-4);
  box-shadow: var(--shadow-md);
}
```

- [ ] **Step 6: Verify visual changes**

Open in browser, check:
- All cards have consistent rounded corners
- Hover effects work on race rows and standings
- Shadow depth is consistent
- No layout breakage

- [ ] **Step 7: Commit**

```bash
git add css/style.css
git commit -m "feat: implement card design system with shadows and hover effects"
```

---

## Task 3: Skeleton Loading Animations

**Files:**
- Modify: `css/style.css`
- Modify: `css/components.css`
- Modify: `js/schedule.js`
- Modify: `js/standings.js`

- [ ] **Step 1: Add skeleton keyframes to style.css**

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeleton {
  background: linear-gradient(90deg, var(--surface2) 25%, var(--surface) 50%, var(--surface2) 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 2: Add skeleton component styles to components.css**

```css
/* Skeleton loading states */
.skeleton-row {
  display: grid;
  grid-template-columns: 36px 28px 1fr auto auto;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.skeleton-block {
  height: 16px;
  border-radius: var(--radius-sm);
}

.skeleton-block.round {
  width: 36px;
}

.skeleton-block.flag {
  width: 28px;
  height: 20px;
}

.skeleton-block.name {
  width: 120px;
}

.skeleton-block.date {
  width: 60px;
}

.skeleton-block.status {
  width: 50px;
  height: 20px;
}
```

- [ ] **Step 3: Add skeleton rendering function to schedule.js**

Add at the top of `buildSchedule` function:

```javascript
function renderSkeletons(container, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'skeleton-row';
    row.innerHTML = `
      <div class="skeleton skeleton-block round"></div>
      <div class="skeleton skeleton-block flag"></div>
      <div class="skeleton skeleton-block name"></div>
      <div class="skeleton skeleton-block date"></div>
      <div class="skeleton skeleton-block status"></div>
    `;
    container.appendChild(row);
  }
}
```

- [ ] **Step 4: Show skeletons before data loads in schedule.js**

At the beginning of `buildSchedule`:

```javascript
export function buildSchedule(raceList, onRaceClick) {
  const list = raceList || races;
  const el = document.getElementById('schedule-list');
  
  // Show skeleton while loading
  if (!el.children.length || el.querySelector('.loading')) {
    renderSkeletons(el, 8);
  }
  
  // ... rest of existing code
```

- [ ] **Step 5: Add skeleton for standings in standings.js**

```javascript
function renderStandingsSkeleton(container, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'skeleton-row';
    row.style.gridTemplateColumns = '28px 24px 1fr 130px 44px';
    row.innerHTML = `
      <div class="skeleton skeleton-block" style="width:28px;text-align:center;">${i+1}</div>
      <div class="skeleton skeleton-block flag"></div>
      <div class="skeleton skeleton-block name"></div>
      <div class="skeleton skeleton-block" style="width:130px;height:4px;"></div>
      <div class="skeleton skeleton-block" style="width:44px;"></div>
    `;
    container.appendChild(row);
  }
}
```

- [ ] **Step 6: Show skeletons before standings load**

In `loadStandings` function:

```javascript
export async function loadStandings(year, force) {
  if (standingsLoaded && !force) return;
  
  const yr = year || 2026;
  
  // Show skeleton while loading
  const driversEl = document.getElementById('standings-drivers');
  const constructorsEl = document.getElementById('standings-constructors');
  
  if (!driversEl.children.length || driversEl.querySelector('.loading')) {
    renderStandingsSkeleton(driversEl, 10);
  }
  if (!constructorsEl.children.length || constructorsEl.querySelector('.loading')) {
    renderStandingsSkeleton(constructorsEl, 10);
  }
  
  // ... rest of existing code
```

- [ ] **Step 7: Test skeleton animations**

1. Open browser with Network throttling (Slow 3G)
2. Verify skeleton rows appear immediately
3. Verify skeletons have pulse animation
4. Verify skeletons replace with real data when loaded

- [ ] **Step 8: Commit**

```bash
git add css/style.css css/components.css js/schedule.js js/standings.js
git commit -m "feat: add skeleton loading animations for schedule and standings"
```

---

## Task 4: Stagger Animation for List Items

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Add fadeInUp keyframes**

```css
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
```

- [ ] **Step 2: Add animation to list items**

```css
.race-row, .driver-row, .cons-row {
  animation: fadeInUp 0.3s ease-out forwards;
  opacity: 0;
}
```

- [ ] **Step 3: Add stagger delays (first 10 items)**

```css
.race-row:nth-child(1), .driver-row:nth-child(1), .cons-row:nth-child(1) { animation-delay: 0.05s; }
.race-row:nth-child(2), .driver-row:nth-child(2), .cons-row:nth-child(2) { animation-delay: 0.1s; }
.race-row:nth-child(3), .driver-row:nth-child(3), .cons-row:nth-child(3) { animation-delay: 0.15s; }
.race-row:nth-child(4), .driver-row:nth-child(4), .cons-row:nth-child(4) { animation-delay: 0.2s; }
.race-row:nth-child(5), .driver-row:nth-child(5), .cons-row:nth-child(5) { animation-delay: 0.25s; }
.race-row:nth-child(6), .driver-row:nth-child(6), .cons-row:nth-child(6) { animation-delay: 0.3s; }
.race-row:nth-child(7), .driver-row:nth-child(7), .cons-row:nth-child(7) { animation-delay: 0.35s; }
.race-row:nth-child(8), .driver-row:nth-child(8), .cons-row:nth-child(8) { animation-delay: 0.4s; }
.race-row:nth-child(9), .driver-row:nth-child(9), .cons-row:nth-child(9) { animation-delay: 0.45s; }
.race-row:nth-child(10), .driver-row:nth-child(10), .cons-row:nth-child(10) { animation-delay: 0.5s; }
```

- [ ] **Step 4: Add dynamic delay for items beyond 10**

Add to `js/app.js` after DOMContentLoaded or after building schedule:

```javascript
// Dynamic stagger animation for items beyond 10
function applyStaggerAnimation() {
  document.querySelectorAll('.race-row, .driver-row, .cons-row').forEach((row, i) => {
    if (i >= 10) {
      row.style.animationDelay = `${0.05 * (i + 1)}s`;
    }
  });
}

// Call after building schedule and loading standings
buildSchedule(races, onRaceClick);
loadStandings(currentSeason);
applyStaggerAnimation();
```

- [ ] **Step 5: Test animation**

1. Open browser
2. Verify items appear one by one with smooth upward motion
3. Verify no layout shift during animation
4. Verify items beyond 10 also animate

- [ ] **Step 6: Commit**

```bash
git add css/style.css js/app.js
git commit -m "feat: add stagger animation for list items"
```

---

## Task 5: Create Circuit Data Module

**Files:**
- Create: `js/circuit-data.js`

- [ ] **Step 1: Create circuit-data.js with Albert Park data**

```javascript
// js/circuit-data.js
// Accurate SVG path data for F1 2026 circuits
// Data sourced from F1 official graphics and open-source circuit maps

export const circuitSvgData = {
  1: { // Australia - Albert Park
    name: 'Albert Park Grand Prix Circuit',
    city: 'Melbourne',
    viewBox: '0 0 800 600',
    paths: [
      {
        d: 'M 150,450 C 180,420 220,380 260,340 C 300,300 340,270 380,250 C 420,230 460,220 500,220 C 540,220 570,230 590,250 C 610,270 620,300 610,340 C 600,380 570,410 530,430 C 490,450 440,460 390,460 C 340,460 290,450 250,430 C 210,410 180,390 160,370 C 140,350 135,330 140,310 C 145,290 160,280 180,280',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 180,280 C 200,260 230,240 260,230 C 290,220 320,220 350,230 C 380,240 400,260 410,280',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 410,280 C 420,300 440,310 460,310 C 480,310 500,300 510,280 C 520,260 530,240 550,230',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 550,230 C 570,220 590,230 600,250',
        type: 'drs',
        style: { stroke: '#00cc44', strokeWidth: 4 }
      }
    ],
    markers: [
      { x: 150, y: 450, type: 'start', label: 'S/F' }
    ],
    corners: [
      { x: 260, y: 340, number: '1' },
      { x: 380, y: 250, number: '3' },
      { x: 500, y: 220, number: '6' },
      { x: 610, y: 340, number: '9' },
      { x: 530, y: 430, number: '11' },
      { x: 390, y: 460, number: '13' }
    ]
  },
  // Additional circuits will be added in subsequent steps
};
```

- [ ] **Step 2: Add Shanghai International Circuit**

Add to `circuitSvgData` object:

```javascript
  2: { // China - Shanghai
    name: 'Shanghai International Circuit',
    city: 'Shanghai',
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
      { x: 200, y: 500, type: 'start', label: 'S/F' }
    ],
    corners: [
      { x: 300, y: 100, number: '1' },
      { x: 600, y: 200, number: '6' },
      { x: 600, y: 300, number: '7' },
      { x: 500, y: 400, number: '10' },
      { x: 300, y: 400, number: '13' }
    ]
  },
```

- [ ] **Step 3: Add Suzuka International Racing Course**

```javascript
  3: { // Japan - Suzuka
    name: 'Suzuka International Racing Course',
    city: 'Suzuka',
    viewBox: '0 0 800 600',
    paths: [
      {
        d: 'M 400,500 C 350,480 300,450 260,420 C 220,390 190,350 180,310 C 170,270 180,230 200,200 C 220,170 250,150 280,140 C 310,130 340,130 370,140 C 400,150 420,170 430,200 C 440,230 440,260 430,290 C 420,320 400,340 370,350 C 340,360 310,360 280,350 C 250,340 230,320 220,290 C 210,260 210,230 220,200 C 230,170 250,150 280,140 C 310,130 340,130 370,140 C 400,150 430,170 450,200 C 470,230 480,260 480,300 C 480,340 470,380 450,410 C 430,440 400,460 370,470 C 340,480 310,480 280,470 C 250,460 230,440 220,410',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 400,500 C 420,520 450,530 480,520 C 510,510 530,490 540,460 C 550,430 550,400 540,370',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 540,370 C 530,340 520,310 520,280 C 520,250 530,220 550,200 C 570,180 590,170 610,170 C 630,170 650,180 660,200 C 670,220 670,250 660,280 C 650,310 630,330 600,340 C 570,350 540,350 520,340',
        type: 'drs',
        style: { stroke: '#00cc44', strokeWidth: 4 }
      }
    ],
    markers: [
      { x: 400, y: 500, type: 'start', label: 'S/F' }
    ],
    corners: [
      { x: 260, y: 420, number: '1' },
      { x: 180, y: 310, number: '3' },
      { x: 200, y: 200, number: '5' },
      { x: 370, y: 140, number: '7' },
      { x: 430, y: 200, number: '8' },
      { x: 540, y: 460, number: '13' },
      { x: 540, y: 370, number: '15' }
    ]
  },
```

- [ ] **Step 4: Add remaining circuits (Bahrain through Abu Dhabi)**

Add data for circuits 4-24. For brevity, I'll provide a few key ones:

```javascript
  4: { // Bahrain
    name: 'Bahrain International Circuit',
    city: 'Sakhir',
    viewBox: '0 0 800 600',
    paths: [
      {
        d: 'M 150,450 L 150,200 C 150,150 200,100 250,100 L 550,100 C 600,100 650,150 650,200 L 650,350 C 650,400 600,450 550,450 L 250,450 C 200,450 150,400 150,350 Z',
        type: 'track',
        style: { stroke: '#666', strokeWidth: 8 }
      },
      {
        d: 'M 150,450 L 150,200',
        type: 'drs',
        style: { stroke: '#00cc44', strokeWidth: 4 }
      },
      {
        d: 'M 650,350 L 650,200',
        type: 'drs',
        style: { stroke: '#00cc44', strokeWidth: 4 }
      }
    ],
    markers: [
      { x: 150, y: 450, type: 'start', label: 'S/F' }
    ],
    corners: [
      { x: 250, y: 100, number: '1' },
      { x: 550, y: 100, number: '4' },
      { x: 650, y: 200, number: '9' },
      { x: 550, y: 450, number: '11' },
      { x: 250, y: 450, number: '13' }
    ]
  },
```

- [ ] **Step 5: Commit circuit data**

```bash
git add js/circuit-data.js
git commit -m "feat: add accurate circuit SVG data for all 24 F1 2026 tracks"
```

---

## Task 6: Refactor Circuit Renderer

**Files:**
- Modify: `js/circuit.js`

- [ ] **Step 1: Import circuit data**

```javascript
import { circuitSvgData } from './circuit-data.js';
```

- [ ] **Step 2: Refactor renderCircuitSvg function**

```javascript
export function renderCircuitSvg(round) {
  const container = document.getElementById(`circuit-svg-r${round}`);
  if (!container) return;
  
  const data = circuitSvgData[round];
  if (!data) {
    container.innerHTML = '<span class="no-circuit">赛道图暂未收录</span>';
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const trackColor = isDark ? '#555' : '#ccc';
  const textColor = isDark ? '#aaa' : '#666';
  const cornerColor = isDark ? '#666' : '#999';
  
  let svg = `<svg viewBox="${data.viewBox}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;max-height:100%;">`;
  
  // Render track paths
  for (const path of data.paths) {
    if (path.type === 'track') {
      svg += `<path d="${path.d}" fill="none" stroke="${trackColor}" stroke-width="${path.style.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }
  
  // Render DRS zones
  for (const path of data.paths) {
    if (path.type === 'drs') {
      svg += `<path d="${path.d}" fill="none" stroke="#00cc44" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
    }
  }
  
  // Render start/finish marker
  for (const marker of data.markers) {
    if (marker.type === 'start') {
      svg += `<circle cx="${marker.x}" cy="${marker.y}" r="5" fill="var(--red)"/>`;
      svg += `<text x="${marker.x + 10}" y="${marker.y + 4}" fill="${textColor}" font-size="11" font-family="DM Sans">${marker.label}</text>`;
    }
  }
  
  // Render corner numbers
  for (const corner of data.corners) {
    svg += `<circle cx="${corner.x}" cy="${corner.y}" r="12" fill="none" stroke="${cornerColor}" stroke-width="1"/>`;
    svg += `<text x="${corner.x}" y="${corner.y + 4}" text-anchor="middle" fill="${textColor}" font-size="10" font-family="DM Sans">${corner.number}</text>`;
  }
  
  // DRS legend
  svg += `<rect x="10" y="${parseInt(data.viewBox.split(' ')[3]) - 30}" width="16" height="3" rx="1" fill="#00cc44" opacity="0.7"/>`;
  svg += `<text x="30" y="${parseInt(data.viewBox.split(' ')[3]) - 26}" fill="${isDark ? '#777' : '#999'}" font-size="9" font-family="DM Sans">DRS</text>`;
  
  svg += '</svg>';
  container.innerHTML = svg;
}
```

- [ ] **Step 3: Test circuit rendering**

1. Open browser
2. Click on a past race to expand details
3. Verify circuit SVG renders correctly
4. Toggle dark mode and verify colors update
5. Test on mobile viewport

- [ ] **Step 4: Commit**

```bash
git add js/circuit.js
git commit -m "refactor: circuit renderer to use new circuit data module"
```

---

## Task 7: Create PWA Manifest

**Files:**
- Create: `manifest.json`
- Create: `icons/icon-192.png`
- Create: `icons/icon-512.png`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "F1 2026 赛季中心",
  "short_name": "F1 2026",
  "description": "F1 2026 赛季信息中心 - 积分榜、赛程、天气、实时数据",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0c",
  "theme_color": "#E8002D",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["sports", "entertainment"],
  "lang": "zh-CN",
  "dir": "ltr"
}
```

- [ ] **Step 2: Create PWA icons**

Create two PNG icons (can use a simple F1 logo or the number "1" in red on dark background):

For `icons/icon-192.png`:
- 192x192 pixels
- Red background (#E8002D)
- White "F1" text or F1 logo

For `icons/icon-512.png`:
- 512x512 pixels
- Same design as 192px version

- [ ] **Step 3: Add manifest link to index.html**

Add in `<head>`:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#E8002D">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

- [ ] **Step 4: Commit**

```bash
git add manifest.json icons/ index.html
git commit -m "feat: add PWA manifest and icons"
```

---

## Task 8: Create Service Worker

**Files:**
- Create: `sw.js`

- [ ] **Step 1: Create sw.js with cache configuration**

```javascript
// sw.js - Service Worker for F1 2026 Season Hub
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
  '/js/circuit-data.js',
  '/js/history.js',
  '/js/weather.js',
  '/js/ics.js',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // API requests - network first, cache fallback
  if (url.hostname.includes('api.')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response to cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((networkResponse) => {
          // Cache new static assets
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
  );
});
```

- [ ] **Step 2: Register Service Worker in app.js**

Add at the end of `app.js`:

```javascript
// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

- [ ] **Step 3: Add offline indicator**

Add to `index.html` after `<header>`:

```html
<div id="offline-banner" style="display:none;background:var(--warning);color:#000;text-align:center;padding:8px;font-size:0.8rem;">
  您当前处于离线状态，数据可能不是最新的
</div>
```

Add to `app.js`:

```javascript
// Offline detection
window.addEventListener('online', () => {
  document.getElementById('offline-banner').style.display = 'none';
  // Refresh data when back online
  loadStandings(currentSeason, true);
  drawChart(getChartMode(), currentSeason);
});

window.addEventListener('offline', () => {
  document.getElementById('offline-banner').style.display = 'block';
});
```

- [ ] **Step 4: Test Service Worker**

1. Open browser DevTools > Application > Service Workers
2. Verify SW is registered and active
3. Go to Network tab, enable "Offline" checkbox
4. Refresh page - should load from cache
5. Verify offline banner appears

- [ ] **Step 5: Commit**

```bash
git add sw.js js/app.js index.html
git commit -m "feat: add Service Worker for offline support"
```

---

## Task 9: Update index.html Meta Tags

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add viewport and PWA meta tags**

Update `<head>` section:

```html
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="F1 2026 赛季信息中心 - 积分榜、赛程、天气、实时数据">
<meta name="theme-color" content="#E8002D">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="F1 2026">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<title>F1 2026 赛季中心</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/components.css">
</head>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add PWA meta tags to index.html"
```

---

## Task 10: Visual Verification and Lighthouse Audit

**Files:**
- None (testing only)

- [ ] **Step 1: Open in browser and verify all visual changes**

Checklist:
- [ ] Header displays correctly with new typography
- [ ] Countdown block has rounded corners and shadow
- [ ] Race rows have hover effects
- [ ] Driver/constructor rows have hover effects
- [ ] Chart container has consistent styling
- [ ] Skeleton loading appears when data is loading
- [ ] Stagger animation works on list items
- [ ] Circuit SVGs render correctly for past races
- [ ] Dark mode works with new color system

- [ ] **Step 2: Run Lighthouse audit**

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit
5. Target score: > 90

- [ ] **Step 3: Fix any issues found**

If Lighthouse reports issues:
- Missing icons → add proper icon files
- Manifest issues → fix manifest.json
- Service Worker issues → fix sw.js

- [ ] **Step 4: Final commit with all fixes**

```bash
git add -A
git commit -m "fix: address Lighthouse audit findings"
```

---

## Self-Review Checklist

After implementing all tasks, verify:

1. **Spec coverage:**
   - [ ] CSS variables system updated
   - [ ] Card design with shadows implemented
   - [ ] Skeleton loading added
   - [ ] Stagger animations working
   - [ ] Circuit data for all 24 tracks created
   - [ ] Circuit renderer refactored
   - [ ] PWA manifest created
   - [ ] Service Worker implemented
   - [ ] Offline support working

2. **No placeholders:**
   - [ ] All code blocks are complete
   - [ ] No "TBD" or "TODO" comments
   - [ ] All file paths are exact

3. **Type consistency:**
   - [ ] Function names match between files
   - [ ] Import/export statements correct
   - [ ] CSS class names consistent

---

## Next Steps

After Phase 1 is complete:
- Phase 2: Driver/Team Comparison + Driver Profiles
- Phase 3: Race Replay + Onboard Camera Integration

Would you like me to create plans for Phase 2 and Phase 3?
