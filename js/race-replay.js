// ─── RACE REPLAY (POSITION CHART) ────────────────────────────────────────────
import * as api from './api.js';
import { teamColor } from './data.js';

// ─── DATA LAYER ─────────────────────────────────────────────────────────────

export async function getRacePositions(sessionKey) {
  const positions = await api.getLivePositions(sessionKey);
  if (!positions || !Array.isArray(positions)) return {};
  const byLap = {};
  for (const pos of positions) {
    if (pos.lap == null || pos.driver_number == null) continue;
    if (!byLap[pos.lap]) byLap[pos.lap] = {};
    byLap[pos.lap][pos.driver_number] = pos.position;
  }
  return byLap;
}

// ─── REPLAY CHART CLASS ─────────────────────────────────────────────────────

export class ReplayChart {
  constructor(canvas, positions, drivers) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.positions = positions;
    this.drivers = drivers; // Map: driver_number -> { code, team, color }
    this.currentLap = 1;
    this.maxLap = Math.max(...Object.keys(positions).map(Number));
    this.isPlaying = false;
    this.highlightedDriver = null;
    this.animationFrame = null;
    this.playSpeed = 500; // ms per lap
    this.setupCanvas();
    this.draw();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.W = rect.width;
    this.H = rect.height;
    this.pad = { top: 20, right: 100, bottom: 40, left: 40 };
  }

  draw() {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;
    const pad = this.pad;

    ctx.clearRect(0, 0, W, H);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#666' : '#aaa';
    const bgColor = isDark ? '#141416' : '#fff';

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;
    const driverCount = Object.keys(this.drivers).length || 20;

    // Grid lines (horizontal)
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 1; i <= driverCount; i++) {
      const y = pad.top + (plotH * (i - 1) / (driverCount - 1));
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();

      // Position label
      ctx.fillStyle = textColor;
      ctx.font = '10px DM Sans';
      ctx.textAlign = 'right';
      ctx.fillText(i.toString(), pad.left - 8, y + 3);
    }

    // Title label for Y axis
    ctx.save();
    ctx.translate(12, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = textColor;
    ctx.font = '10px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText('位置', 0, 0);
    ctx.restore();

    // X axis labels
    ctx.textAlign = 'center';
    const lapStep = Math.max(1, Math.floor(this.maxLap / 10));
    for (let lap = 1; lap <= this.currentLap; lap += lapStep) {
      const x = pad.left + (plotW * (lap - 1) / (this.maxLap - 1));
      ctx.fillStyle = textColor;
      ctx.font = '10px DM Sans';
      ctx.fillText('L' + lap, x, H - pad.bottom + 16);
    }
    // Always show current lap
    if (this.currentLap > 1) {
      const cx = pad.left + (plotW * (this.currentLap - 1) / (this.maxLap - 1));
      ctx.fillStyle = textColor;
      ctx.font = '10px DM Sans';
      ctx.fillText('L' + this.currentLap, cx, H - pad.bottom + 16);
    }

    // Draw driver lines
    const driverNumbers = Object.keys(this.drivers);
    for (const num of driverNumbers) {
      const driver = this.drivers[num];
      const color = driver.color || '#888';
      const isHighlighted = this.highlightedDriver === num;
      const isOther = this.highlightedDriver && !isHighlighted;

      ctx.strokeStyle = isOther ? 'rgba(128,128,128,0.15)' : color;
      ctx.lineWidth = isHighlighted ? 3 : 1.5;
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);

      ctx.beginPath();
      let started = false;
      let lastX, lastY;

      for (let lap = 1; lap <= this.currentLap; lap++) {
        const posData = this.positions[lap];
        if (!posData || posData[num] === undefined) continue;

        const pos = posData[num];
        const x = pad.left + (plotW * (lap - 1) / (this.maxLap - 1));
        const y = pad.top + (plotH * (pos - 1) / (driverCount - 1));

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
        lastX = x;
        lastY = y;
      }
      ctx.stroke();

      // Driver label at end of line
      if (lastX !== undefined) {
        const labelX = lastX + 6;
        const labelY = lastY + 3;
        ctx.fillStyle = isOther ? 'rgba(128,128,128,0.3)' : (isDark ? '#ccc' : '#333');
        ctx.font = isHighlighted ? 'bold 10px DM Sans' : '9px DM Sans';
        ctx.textAlign = 'left';
        ctx.fillText(driver.code || num, labelX, labelY);
      }
    }

    // Current lap indicator
    if (this.currentLap > 0) {
      const lapX = pad.left + (plotW * (this.currentLap - 1) / (this.maxLap - 1));
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(lapX, pad.top);
      ctx.lineTo(lapX, pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Lap counter
    ctx.fillStyle = isDark ? '#ccc' : '#333';
    ctx.font = 'bold 12px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText(`Lap ${this.currentLap} / ${this.maxLap}`, W / 2, H - 6);
  }

  setLap(lap) {
    this.currentLap = Math.max(1, Math.min(lap, this.maxLap));
    this.draw();
    this.updateSlider();
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.updatePlayButton();

    const tick = () => {
      if (!this.isPlaying) return;
      if (this.currentLap >= this.maxLap) {
        this.pause();
        return;
      }
      this.currentLap++;
      this.draw();
      this.updateSlider();
      this.animationFrame = setTimeout(tick, this.playSpeed);
    };
    this.animationFrame = setTimeout(tick, this.playSpeed);
  }

  pause() {
    this.isPlaying = false;
    this.updatePlayButton();
    if (this.animationFrame) {
      clearTimeout(this.animationFrame);
      this.animationFrame = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentLap >= this.maxLap) this.currentLap = 1;
      this.play();
    }
  }

  highlightDriver(driverNum) {
    if (this.highlightedDriver === driverNum) {
      this.highlightedDriver = null;
    } else {
      this.highlightedDriver = driverNum;
    }
    this.draw();
    this.updateDriverButtons();
  }

  updateSlider() {
    const slider = this.canvas.parentElement?.querySelector('.replay-slider');
    if (slider) slider.value = this.currentLap;
  }

  updatePlayButton() {
    const btn = this.canvas.parentElement?.querySelector('.replay-play-btn');
    if (btn) btn.textContent = this.isPlaying ? '⏸' : '▶';
  }

  updateDriverButtons() {
    const buttons = this.canvas.parentElement?.querySelectorAll('.replay-driver-btn');
    if (buttons) {
      buttons.forEach(btn => {
        const num = btn.dataset.driver;
        btn.classList.toggle('active', num === this.highlightedDriver);
      });
    }
  }

  destroy() {
    this.pause();
    this.canvas = null;
    this.ctx = null;
  }
}

// ─── SESSION KEY LOOKUP ─────────────────────────────────────────────────────

export async function findSessionKey(year, round, sessionType) {
  // sessionType: 'Race', 'Qualifying', 'Sprint', etc.
  const sessions = await api.getSessions(year, sessionType);
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return null;
  // Match by round number (approximate by date order)
  const sorted = sessions.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  return sorted[round - 1] || null;
}

// ─── UI INTEGRATION ─────────────────────────────────────────────────────────

export function initReplay() {
  // Will be called from app.js to wire up global functions
  window.showReplay = showReplay;
}

export async function showReplay(year, round, containerEl) {
  containerEl.innerHTML = '<div class="detail-loading">加载比赛回放数据...</div>';

  try {
    // Find session key for this race
    const session = await findSessionKey(year, round, 'Race');
    if (!session) {
      containerEl.innerHTML = '<div class="detail-loading">暂无回放数据 (OpenF1 无此赛事)</div>';
      return;
    }

    const sessionKey = session.session_key;

    // Fetch positions
    const positions = await getRacePositions(sessionKey);
    const laps = Object.keys(positions).map(Number).sort((a, b) => a - b);

    if (laps.length === 0) {
      containerEl.innerHTML = '<div class="detail-loading">暂无圈位置数据</div>';
      return;
    }

    // Build driver info from position data
    const drivers = {};
    for (const lap of laps) {
      const lapData = positions[lap];
      if (!lapData) continue;
      for (const [num, pos] of Object.entries(lapData)) {
        if (!drivers[num]) {
          drivers[num] = { code: num, team: '', color: '#888' };
        }
      }
    }

    // Try to get driver names from live module data if available
    try {
      const lapsData = await api.getLiveLaps(sessionKey);
      for (const lap of lapsData) {
        if (drivers[lap.driver_number]) {
          drivers[lap.driver_number].code = lap.driver_number.toString();
        }
      }
    } catch (e) { /* ignore */ }

    // Build HTML
    let html = `
      <div class="replay-container">
        <div class="replay-header">
          <span class="detail-label">比赛位置回放</span>
          <span class="replay-session-name">${session.meeting_name || ''} - ${session.session_name || 'Race'}</span>
        </div>
        <canvas class="replay-canvas" id="replay-canvas-${round}"></canvas>
        <div class="replay-controls">
          <button class="replay-play-btn replay-btn" title="播放/暂停">▶</button>
          <input type="range" class="replay-slider" min="1" max="${laps[laps.length-1]}" value="1" step="1">
          <span class="replay-lap-label">Lap 1 / ${laps[laps.length-1]}</span>
        </div>
        <div class="replay-drivers" id="replay-drivers-${round}"></div>
      </div>
    `;

    containerEl.innerHTML = html;

    // Create chart
    const canvas = document.getElementById(`replay-canvas-${round}`);
    const chart = new ReplayChart(canvas, positions, drivers);

    // Wire controls
    const container = containerEl.querySelector('.replay-container');
    const playBtn = container.querySelector('.replay-play-btn');
    const slider = container.querySelector('.replay-slider');
    const lapLabel = container.querySelector('.replay-lap-label');

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      chart.togglePlay();
    });

    slider.addEventListener('input', (e) => {
      e.stopPropagation();
      chart.pause();
      chart.setLap(parseInt(e.target.value));
      lapLabel.textContent = `Lap ${chart.currentLap} / ${chart.maxLap}`;
    });

    // Driver highlight buttons
    const driverContainer = document.getElementById(`replay-drivers-${round}`);
    const driverNums = Object.keys(drivers).sort((a, b) => {
      const posA = positions[1]?.[a] || 99;
      const posB = positions[1]?.[b] || 99;
      return posA - posB;
    });

    for (const num of driverNums) {
      const btn = document.createElement('button');
      btn.className = 'replay-driver-btn';
      btn.dataset.driver = num;
      btn.textContent = drivers[num].code || `#${num}`;
      btn.style.borderColor = drivers[num].color;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        chart.highlightDriver(num);
      });
      driverContainer.appendChild(btn);
    }

    // Update label on draw
    const origDraw = chart.draw.bind(chart);
    chart.draw = function() {
      origDraw();
      lapLabel.textContent = `Lap ${this.currentLap} / ${this.maxLap}`;
    };

    // Handle resize
    const resizeHandler = () => {
      chart.setupCanvas();
      chart.draw();
    };
    window.addEventListener('resize', resizeHandler);

  } catch (err) {
    containerEl.innerHTML = `<div class="detail-loading">回放数据加载失败: ${err.message}</div>`;
  }
}
