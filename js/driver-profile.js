// ─── DRIVER PROFILE (Career History) ──────────────────────────────────────
import * as api from './api.js';
import { teamColor, driverFlag } from './data.js';

export function initDriverProfile() {
  // Intercept driver row clicks to show enhanced profile
  document.getElementById('standings-drivers').addEventListener('click', e => {
    const row = e.target.closest('.driver-row');
    if (!row) return;
    const driverId = row.dataset.driverId;
    if (!driverId) return;
    toggleProfile(driverId, row);
  });
}

function toggleProfile(driverId, rowEl) {
  const existing = rowEl.nextElementSibling;
  if (existing && existing.classList.contains('driver-profile-panel')) {
    existing.remove();
    return;
  }
  // Remove any existing profile panels
  document.querySelectorAll('.driver-profile-panel').forEach(p => p.remove());
  const panel = document.createElement('div');
  panel.className = 'driver-profile-panel driver-detail-panel';
  panel.innerHTML = '<div class="detail-loading">加载车手档案...</div>';
  rowEl.after(panel);
  loadProfile(driverId, panel);
}

async function loadProfile(driverId, el) {
  const { currentSeason } = await import('./app.js');
  try {
    // Load current season + career history in parallel
    const seasons = [];
    for (let y = currentSeason; y >= currentSeason - 4 && y >= 2018; y--) {
      seasons.push(y);
    }

    const allData = await Promise.all(
      seasons.map(y => api.getDriverResults(y, driverId).catch(() => []))
    );

    const currentResults = allData[0];
    const careerSeasons = [];

    for (let i = 0; i < seasons.length; i++) {
      const results = allData[i];
      if (!results || results.length === 0) continue;
      const stats = calcSeasonStats(results);
      careerSeasons.push({ year: seasons[i], results, stats });
    }

    renderProfile(el, driverId, currentResults, careerSeasons);
  } catch (e) {
    el.innerHTML = '<div class="error-msg">加载失败</div>';
  }
}

function calcSeasonStats(results) {
  let wins = 0, podiums = 0, poles = 0, totalPoints = 0, bestFinish = 99;
  let team = '';
  for (const race of results) {
    const r = race.Results?.[0];
    if (!r) continue;
    const pos = parseInt(r.position);
    const grid = parseInt(r.grid);
    if (pos === 1) wins++;
    if (pos <= 3) podiums++;
    if (grid === 1) poles++;
    totalPoints += parseFloat(r.points) || 0;
    if (pos < bestFinish) bestFinish = pos;
    if (!team) team = r.Constructor?.name || '';
  }
  return { wins, podiums, poles, totalPoints, bestFinish: bestFinish === 99 ? '-' : bestFinish, races: results.length, team };
}

function renderProfile(el, driverId, currentResults, careerSeasons) {
  const driver = currentResults[0]?.Results?.[0]?.Driver;
  const team = currentResults[0]?.Results?.[0]?.Constructor?.name || '';
  const color = teamColor(team);
  const flag = driver ? driverFlag(driver.nationality) : '';
  const name = driver ? `${driver.givenName} ${driver.familyName}` : driverId;
  const nationality = driver?.nationality || '';

  let html = '';

  // Profile header
  html += `
    <div class="profile-header" style="border-left:3px solid ${color}">
      <div class="profile-name-row">
        <span class="profile-flag">${flag}</span>
        <span class="profile-name">${name}</span>
        <span class="profile-team" style="color:${color}">${team}</span>
      </div>
      <div class="profile-meta">${nationality} · #${driver?.permanentNumber || '-'}</div>
    </div>
  `;

  // Current season stats
  if (careerSeasons.length > 0) {
    const cs = careerSeasons[0].stats;
    html += `
      <div class="profile-stats-grid">
        <div class="profile-stat">
          <div class="profile-stat-num">${cs.totalPoints}</div>
          <div class="profile-stat-label">积分</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-num">${cs.wins}</div>
          <div class="profile-stat-label">胜场</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-num">${cs.podiums}</div>
          <div class="profile-stat-label">领奖台</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-num">${cs.poles}</div>
          <div class="profile-stat-label">杆位</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-num">P${cs.bestFinish}</div>
          <div class="profile-stat-label">最佳</div>
        </div>
      </div>
    `;
  }

  // Career history table
  if (careerSeasons.length > 1) {
    html += '<div class="detail-label" style="margin-top:1.25rem">职业生涯（近5季）</div>';
    html += '<table class="driver-season-table"><tr><th>赛季</th><th>车队</th><th>比赛</th><th>积分</th><th>胜场</th><th>领奖台</th><th>杆位</th></tr>';
    for (const s of careerSeasons) {
      const st = s.stats;
      html += `<tr>
        <td>${s.year}</td>
        <td>${st.team}</td>
        <td>${st.races}</td>
        <td><strong>${st.totalPoints}</strong></td>
        <td>${st.wins}</td>
        <td>${st.podiums}</td>
        <td>${st.poles}</td>
      </tr>`;
    }
    html += '</table>';
  }

  // Current season race-by-race
  if (currentResults.length > 0) {
    html += '<div class="detail-label" style="margin-top:1.25rem">当前赛季成绩</div>';
    html += '<table class="driver-season-table"><tr><th>站</th><th>大奖赛</th><th>排位</th><th>正赛</th><th>积分</th></tr>';
    for (const race of currentResults) {
      const r = race.Results?.[0];
      if (!r) continue;
      html += `<tr>
        <td>R${race.round}</td>
        <td>${race.raceName}</td>
        <td>${r.grid}</td>
        <td>P${r.position}</td>
        <td>${r.points}</td>
      </tr>`;
    }
    html += '</table>';
  }

  // Mini chart
  html += `<div style="margin-top:1rem"><div class="detail-label">积分趋势</div>`;
  html += `<canvas class="driver-mini-chart" id="profile-chart-${driverId}"></canvas></div>`;

  el.innerHTML = html;
  drawProfileChart(driverId, currentResults);
}

function drawProfileChart(driverId, raceResults) {
  const canvas = document.getElementById(`profile-chart-${driverId}`);
  if (!canvas || !raceResults.length) return;
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
    cum += pts;
    points.push(cum);
    rounds.push('R' + race.round);
  }
  if (!points.length) return;

  const maxPts = Math.max(...points, 1);
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#666' : '#aaa';
  const team = raceResults[0]?.Results?.[0]?.Constructor?.name || '';
  const color = teamColor(team);

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

  // End dot + label
  const lastPts = points[points.length - 1];
  const lx = pad.left + plotW;
  const ly = pad.top + plotH - (plotH * lastPts / maxPts);
  ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = isDark ? '#ccc' : '#333'; ctx.font = '10px DM Sans'; ctx.textAlign = 'left';
  ctx.fillText(lastPts, lx + 6, ly + 3);
}
