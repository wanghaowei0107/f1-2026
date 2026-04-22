import { teamColor } from './data.js';
import * as api from './api.js';

export function initDriverDetail() {
  document.getElementById('standings-drivers').addEventListener('click', e => {
    const row = e.target.closest('.driver-row');
    if (!row) return;
    const driverId = row.dataset.driverId;
    if (!driverId) return;
    toggleDriverPanel(driverId, row);
  });

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
  document.querySelectorAll('.driver-detail-panel').forEach(p => p.remove());
  const panel = document.createElement('div');
  panel.className = 'driver-detail-panel';
  panel.innerHTML = '<div class="detail-loading">加载车手数据...</div>';
  rowEl.after(panel);
  loadDriverDetail(driverId, panel);
}

async function loadDriverDetail(driverId, el) {
  const { currentSeason } = await import('./app.js');
  try {
    const [raceResults, sprintResults] = await Promise.all([
      api.getDriverResults(currentSeason, driverId),
      api.getDriverSprintResults(currentSeason, driverId).catch(() => []),
    ]);

    let html = '<div class="detail-label">赛季成绩</div>';
    html += '<table class="driver-season-table">';
    html += '<tr><th>站</th><th>大奖赛</th><th>排位</th><th>正赛</th><th>积分</th></tr>';
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
    html += '</table>';

    html += `<div style="margin-top:1rem"><div class="detail-label">积分趋势</div>`;
    html += `<canvas class="driver-mini-chart" id="driver-chart-${driverId}"></canvas></div>`;
    el.innerHTML = html;
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

  const points = [];
  let cum = 0;
  const rounds = [];
  for (const race of raceResults) {
    const pts = parseFloat(race.Results?.[0]?.points || 0);
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

  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = pad.top + plotH - (plotH * i / 3);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '9px DM Sans'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxPts * i / 3), pad.left - 4, y + 3);
  }

  ctx.textAlign = 'center'; ctx.font = '9px DM Sans'; ctx.fillStyle = textColor;
  rounds.forEach((label, i) => {
    const x = pad.left + (plotW * i / (rounds.length - 1 || 1));
    ctx.fillText(label, x, H - pad.bottom + 14);
  });

  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((pts, i) => {
    const x = pad.left + (plotW * i / (points.length - 1 || 1));
    const y = pad.top + plotH - (plotH * pts / maxPts);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

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
  const { currentSeason } = await import('./app.js');
  try {
    const data = await api.getConstructorStandings(currentSeason);
    if (!data) { el.innerHTML = '<div class="error-msg">无数据</div>'; return; }
    const team = data.ConstructorStandings.find(s => s.Constructor.constructorId === constructorId);
    if (!team) { el.innerHTML = '<div class="error-msg">未找到车队</div>'; return; }

    const driverData = await api.getDriverStandings(currentSeason);
    const teamDrivers = driverData?.DriverStandings?.filter(
      s => s.Constructors[0]?.constructorId === constructorId
    ) || [];

    let html = `<div class="detail-label">${team.Constructor.name} · ${currentSeason} 赛季</div>`;
    html += '<div class="constructor-compare">';
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
    html += '</div>';
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<div class="error-msg">加载失败</div>';
  }
}
