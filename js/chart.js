import { teamColor } from './data.js';
import { getAllResults, getAllSprintResults } from './api.js';

let chartData = null;
let chartMode = 'drivers';

export function getChartMode() {
  return chartMode;
}

export async function loadChartData(year) {
  const yr = year || 2026;
  if (chartData && chartData._year === yr) return chartData;
  chartData = { drivers: {}, constructors: {}, rounds: [], _year: yr };

  try {
    const allRaces = await getAllResults(yr);
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
        const dTeam = cName;

        if (!driverPts[dName]) driverPts[dName] = { pts: {}, team: dTeam };
        driverPts[dName].pts[rnd] = (driverPts[dName].pts[rnd] || 0) + pts;

        if (!consPts[cName]) consPts[cName] = {};
        consPts[cName][rnd] = (consPts[cName][rnd] || 0) + pts;
      }
    }

    // Also add sprint points
    try {
      const sRaces = await getAllSprintResults(yr);
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
    } catch(e) { /* ignore sprint fetch failures */ }

    // Convert to cumulative
    for (const [name, data] of Object.entries(driverPts)) {
      let cum = 0;
      const series = [];
      for (const rnd of roundNums) {
        cum += (data.pts[rnd] || 0);
        series.push(cum);
      }
      chartData.drivers[name] = { series, team: data.team, total: cum };
    }
    for (const [name, pts] of Object.entries(consPts)) {
      let cum = 0;
      const series = [];
      for (const rnd of roundNums) {
        cum += (pts[rnd] || 0);
        series.push(cum);
      }
      chartData.constructors[name] = { series, total: cum };
    }
  } catch(e) { /* ignore */ }

  return chartData;
}

export async function drawChart(mode, year, compareData) {
  if (mode) chartMode = mode;
  const data = await loadChartData(year);
  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const pad = { top: 14, right: 90, bottom: 36, left: 44 };

  ctx.clearRect(0, 0, W, H);

  const rounds = data.rounds;
  if (!rounds.length) return;

  let entries;
  if (chartMode === 'drivers') {
    entries = Object.entries(data.drivers)
      .sort((a,b) => b[1].total - a[1].total)
      .slice(0, 8)
      .map(([name, d]) => ({ name, series: d.series, color: teamColor(d.team) }));
  } else {
    entries = Object.entries(data.constructors)
      .sort((a,b) => b[1].total - a[1].total)
      .map(([name, d]) => ({ name, series: d.series, color: teamColor(name) }));
  }

  const maxPts = Math.max(...entries.map(e => Math.max(...e.series)), 1);
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // Grid
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(242,238,229,0.06)' : 'rgba(31,27,22,0.06)';
  const axisColor = isDark ? 'rgba(242,238,229,0.18)' : 'rgba(31,27,22,0.18)';
  const textColor = isDark ? '#8A8377' : '#7A7368';
  const labelFont = "10px 'Archivo', sans-serif";
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + plotH - (plotH * i / gridLines);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.font = labelFont;
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxPts * i / gridLines), pad.left - 8, y + 3);
  }

  // Axis baseline
  ctx.strokeStyle = axisColor;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + plotH);
  ctx.lineTo(W - pad.right, pad.top + plotH);
  ctx.stroke();

  // X labels
  ctx.textAlign = 'center';
  rounds.forEach((rnd, i) => {
    const x = pad.left + (plotW * i / (rounds.length - 1 || 1));
    ctx.fillStyle = textColor; ctx.font = labelFont;
    ctx.fillText('R' + String(rnd).padStart(2,'0'), x, H - pad.bottom + 18);
  });

  // Lines
  entries.forEach(entry => {
    ctx.strokeStyle = entry.color;
    ctx.lineWidth = 1.75;
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    entry.series.forEach((pts, i) => {
      const x = pad.left + (plotW * i / (rounds.length - 1 || 1));
      const y = pad.top + plotH - (plotH * pts / maxPts);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // End dot + label
    const lastPts = entry.series[entry.series.length - 1];
    const lx = pad.left + plotW;
    const ly = pad.top + plotH - (plotH * lastPts / maxPts);
    ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2); ctx.fillStyle = entry.color; ctx.fill();
    ctx.fillStyle = isDark ? '#C9C2B5' : '#3F3A32';
    ctx.font = "500 10px 'Archivo', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(entry.name, lx + 8, ly + 3);
  });

  // Compare data (dashed lines for history comparison)
  if (compareData && compareData.rounds && compareData.rounds.length) {
    let compareEntries;
    if (chartMode === 'drivers') {
      compareEntries = Object.entries(compareData.drivers || {})
        .sort((a,b) => b[1].total - a[1].total)
        .slice(0, 8)
        .map(([name, d]) => ({ name, series: d.series, color: teamColor(d.team) }));
    } else {
      compareEntries = Object.entries(compareData.constructors || {})
        .sort((a,b) => b[1].total - a[1].total)
        .map(([name, d]) => ({ name, series: d.series, color: teamColor(name) }));
    }

    compareEntries.forEach(entry => {
      ctx.strokeStyle = entry.color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.setLineDash([6, 4]);
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      entry.series.forEach((pts, i) => {
        const x = pad.left + (plotW * i / (compareData.rounds.length - 1 || 1));
        const y = pad.top + plotH - (plotH * pts / maxPts);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      ctx.setLineDash([]);
    });
  }
}
