// js/live.js
import * as api from './api.js';

let pollTimer = null;
let currentSessionKey = null;

export async function initLive() {
  try {
    const session = await api.getLatestSession();
    if (!session) return;
    const endTime = session.date_end ? new Date(session.date_end) : null;
    const isLive = !endTime || endTime > new Date();
    if (isLive) {
      currentSessionKey = session.session_key;
      showLiveBanner(session);
      startPolling();
    }
  } catch(e) {
    // OpenF1 unavailable — silent fail
  }
}

function showLiveBanner(session) {
  const banner = document.getElementById('live-banner');
  if (!banner) return;
  banner.style.display = 'block';
  banner.className = 'live-banner';
  banner.innerHTML = `
    <div class="live-header">
      <div class="live-dot"></div>
      <span class="live-label">LIVE</span>
      <span class="live-session-name">${session.session_name || ''} — ${session.meeting_name || ''}</span>
      <button class="live-close" onclick="window.__closeLive()">✕</button>
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

    const latestPos = {};
    for (const p of positions) {
      if (!latestPos[p.driver_number] || new Date(p.date) > new Date(latestPos[p.driver_number].date)) {
        latestPos[p.driver_number] = p;
      }
    }
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

window.__closeLive = function() {
  const banner = document.getElementById('live-banner');
  if (banner) { banner.style.display = 'none'; banner.className = ''; }
  clearInterval(pollTimer);
  pollTimer = null;
  currentSessionKey = null;
};
