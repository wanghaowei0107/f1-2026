// js/history.js
import * as api from './api.js';
import { buildSchedule } from './schedule.js';
import { toggleRaceDetail } from './race-detail.js';
import { loadChartData, drawChart, getChartMode } from './chart.js';

export async function loadHistorySeason(year) {
  try {
    const apiRaces = await api.getSeasonSchedule(year);
    const raceList = apiRaces.map(r => ({
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

let compareYear = null;

export async function toggleCompare() {
  const { currentSeason } = await import('./app.js');
  if (compareYear) {
    compareYear = null;
    drawChart(getChartMode(), currentSeason);
    document.getElementById('compare-btn').textContent = '对比';
    return;
  }
  compareYear = currentSeason === 2026 ? 2025 : 2026;
  try {
    const compareChartData = await loadChartData(compareYear);
    drawChart(getChartMode(), currentSeason, compareChartData);
    document.getElementById('compare-btn').textContent = `对比 ${compareYear} ✕`;
  } catch(e) { compareYear = null; }
}

window.toggleCompare = toggleCompare;
