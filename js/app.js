import { races } from './data.js';
import { buildSchedule } from './schedule.js';
import { loadStandings, showStandings } from './standings.js';
import { drawChart, getChartMode } from './chart.js';
import { toggleRaceDetail } from './race-detail.js';
import { exportICS } from './ics.js';
import { initWeather } from './weather.js';
import { initLive } from './live.js';
import { initDriverDetail } from './driver-detail.js';
import { initComparison, showComparison, runComparison, closeComparison } from './comparison.js';
import { initDriverProfile } from './driver-profile.js';
import { initReplay } from './race-replay.js';
import { initOnboard } from './onboard.js';

// ─── STATE ─────────────────────────────────────────────────────────────────
export let currentSeason = 2026;

// ─── DARK MODE ─────────────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? '' : 'dark');
  document.querySelector('.theme-toggle').textContent = isDark ? '☀' : '☾';
  localStorage.setItem('f1-theme', isDark ? 'light' : 'dark');
}

(function initTheme() {
  const saved = localStorage.getItem('f1-theme');
  if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme:dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '☾';
  }
})();

// ─── SEASON SWITCHING ──────────────────────────────────────────────────────
async function switchSeason(year) {
  currentSeason = parseInt(year);
  document.querySelector('.season-badge').textContent = currentSeason;
  if (currentSeason === 2026) {
    buildSchedule(races, onRaceClick);
  } else {
    const { loadHistorySeason } = await import('./history.js');
    await loadHistorySeason(currentSeason);
  }
  loadStandings(currentSeason, true);
  drawChart(getChartMode(), currentSeason);
}

// ─── BIND GLOBAL EVENT HANDLERS ────────────────────────────────────────────
// HTML onclick attributes need functions on window since modules don't create globals
window.toggleTheme = toggleTheme;
window.showStandings = function(type, btn) { showStandings(type, btn); };
window.loadStandings = function(force) { loadStandings(currentSeason, force); };
window.exportICS = exportICS;
window.drawChart = function(mode, btn) {
  // Update tab active state
  if (btn) {
    document.querySelectorAll('.chart-tabs .s-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  drawChart(mode, currentSeason);
};
window.switchSeason = switchSeason;
window.toggleCompare = async function() {
  const { toggleCompare } = await import('./history.js');
  toggleCompare();
};
window.showComparison = function(type) { showComparison(type); };
window.runComparison = function() { runComparison(); };
window.closeComparison = function() { closeComparison(); };

// ─── INITIALIZE ────────────────────────────────────────────────────────────
function onRaceClick(rc, rowEl) {
  toggleRaceDetail(rc, rowEl, currentSeason);
}

buildSchedule(races, onRaceClick);
loadStandings(currentSeason);
drawChart('drivers', currentSeason);
window.addEventListener('resize', () => drawChart(getChartMode(), currentSeason));

// Initialize modules
initWeather();
initLive();
initDriverDetail();
initComparison();
initDriverProfile();
initReplay();
initOnboard();

// Replay + Onboard integration
window._openReplay = async function(round, year) {
  const container = document.getElementById(`replay-detail-r${round}`);
  if (!container) return;
  const { showReplay } = await import('./race-replay.js');
  showReplay(year, round, container);
};

window._openOnboard = function(btn, meetingName) {
  const detail = btn.closest('.race-detail');
  if (!detail) return;
  const { showOnboard } = window;
  if (showOnboard) {
    // Find or create onboard container
    let onboardContainer = detail.querySelector('.onboard-inline');
    if (!onboardContainer) {
      onboardContainer = document.createElement('div');
      onboardContainer.className = 'onboard-inline';
      detail.appendChild(onboardContainer);
    }
    showOnboard(onboardContainer, meetingName);
  }
};

// Dynamic stagger animation for items beyond 10
function applyStaggerAnimation() {
  document.querySelectorAll('.race-row, .driver-row, .cons-row').forEach((row, i) => {
    if (i >= 10) {
      row.style.animationDelay = `${0.05 * (i + 1)}s`;
    }
  });
}

// Apply stagger after building schedule and loading standings
setTimeout(applyStaggerAnimation, 100);

// ─── SERVICE WORKER ────────────────────────────────────────────────────────
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

// ─── OFFLINE DETECTION ─────────────────────────────────────────────────────
window.addEventListener('online', () => {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'none';
  loadStandings(currentSeason, true);
  drawChart(getChartMode(), currentSeason);
});

window.addEventListener('offline', () => {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'block';
});
