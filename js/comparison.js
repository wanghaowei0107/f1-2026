// ─── DRIVER / TEAM COMPARISON ──────────────────────────────────────────────
import * as api from './api.js';
import { teamColor, driverFlag } from './data.js';

let comparisonVisible = false;
let allDrivers = [];

// ─── INIT ─────────────────────────────────────────────────────────────────
export function initComparison() {
  // Add comparison button to standings tabs
  const tabs = document.querySelector('.standings-tabs');
  if (!tabs) return;
  const btn = document.createElement('button');
  btn.className = 's-tab';
  btn.id = 'comparison-tab-btn';
  btn.textContent = '对比';
  btn.onclick = () => showComparison('drivers');
  // Insert before the refresh button
  const refreshBtn = tabs.querySelector('.refresh-btn');
  if (refreshBtn) {
    tabs.insertBefore(btn, refreshBtn);
  } else {
    tabs.appendChild(btn);
  }
}

// ─── SHOW COMPARISON UI ───────────────────────────────────────────────────
export async function showComparison(type) {
  // Toggle off if already visible
  const existing = document.getElementById('comparison-panel');
  if (existing) {
    existing.remove();
    deactivateTab();
    return;
  }

  // Hide normal standings
  document.getElementById('standings-drivers').style.display = 'none';
  document.getElementById('standings-constructors').style.display = 'none';
  deactivateTab();

  // Activate comparison tab
  const cmpBtn = document.getElementById('comparison-tab-btn');
  if (cmpBtn) cmpBtn.classList.add('active');

  // Build comparison container
  const col = document.querySelector('.col-standings');
  const panel = document.createElement('div');
  panel.id = 'comparison-panel';
  panel.innerHTML = `
    <div class="cmp-header">
      <div class="cmp-title">车手对比</div>
      <button class="cmp-close-btn" onclick="window.closeComparison()">关闭</button>
    </div>
    <div class="cmp-selects">
      <select id="cmp-driver1" class="cmp-dropdown">
        <option value="">选择车手 1</option>
      </select>
      <span class="cmp-vs">VS</span>
      <select id="cmp-driver2" class="cmp-dropdown">
        <option value="">选择车手 2</option>
      </select>
      <button class="cmp-go-btn" onclick="window.runComparison()">对比</button>
    </div>
    <div id="cmp-results"></div>
  `;
  col.appendChild(panel);

  // Load driver list from current standings
  await loadDriverList();
  comparisonVisible = true;
}

async function loadDriverList() {
  const { currentSeason } = await import('./app.js');
  try {
    const data = await api.getDriverStandings(currentSeason);
    if (!data) return;
    allDrivers = data.DriverStandings.map(s => ({
      id: s.Driver.driverId,
      name: `${s.Driver.givenName} ${s.Driver.familyName}`,
      team: s.Constructors[0]?.name || '',
      pos: parseInt(s.position),
    }));

    const sel1 = document.getElementById('cmp-driver1');
    const sel2 = document.getElementById('cmp-driver2');
    for (const d of allDrivers) {
      const opt1 = new Option(`P${d.pos} ${d.name}`, d.id);
      const opt2 = new Option(`P${d.pos} ${d.name}`, d.id);
      sel1.add(opt1);
      sel2.add(opt2);
    }
    // Default: select top 2
    if (allDrivers.length >= 2) {
      sel1.value = allDrivers[0].id;
      sel2.value = allDrivers[1].id;
    }
  } catch (e) {
    document.getElementById('cmp-results').innerHTML =
      '<div class="error-msg">加载车手列表失败</div>';
  }
}

// ─── RUN COMPARISON ───────────────────────────────────────────────────────
export async function runComparison() {
  const id1 = document.getElementById('cmp-driver1').value;
  const id2 = document.getElementById('cmp-driver2').value;
  if (!id1 || !id2) {
    document.getElementById('cmp-results').innerHTML =
      '<div class="error-msg">请选择两位车手</div>';
    return;
  }
  if (id1 === id2) {
    document.getElementById('cmp-results').innerHTML =
      '<div class="error-msg">请选择不同的车手</div>';
    return;
  }

  const resultsEl = document.getElementById('cmp-results');
  resultsEl.innerHTML = '<div class="detail-loading">加载对比数据...</div>';

  const { currentSeason } = await import('./app.js');
  try {
    const cmp = await getDriverComparison(id1, id2, currentSeason);
    renderComparison(cmp, id1, id2);
  } catch (e) {
    resultsEl.innerHTML = '<div class="error-msg">加载失败</div>';
  }
}

// ─── DATA LAYER ───────────────────────────────────────────────────────────
export async function getDriverComparison(driver1Id, driver2Id, year) {
  const [results1, results2] = await Promise.all([
    api.getDriverResults(year, driver1Id),
    api.getDriverResults(year, driver2Id),
  ]);

  return {
    driver1: { results: results1, stats: calculateDriverStats(results1) },
    driver2: { results: results2, stats: calculateDriverStats(results2) },
  };
}

function calculateDriverStats(results) {
  let wins = 0, podiums = 0, poles = 0, fastestLaps = 0;
  let totalQualiPos = 0, totalRacePos = 0, totalPoints = 0;

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
    totalPoints += parseFloat(result.points) || 0;
  }

  return {
    wins, podiums, poles, fastestLaps,
    totalPoints,
    avgQualiPos: results.length ? (totalQualiPos / results.length).toFixed(1) : '0.0',
    avgRacePos: results.length ? (totalRacePos / results.length).toFixed(1) : '0.0',
    races: results.length,
  };
}

// ─── RENDER ───────────────────────────────────────────────────────────────
function renderComparison(cmp, id1, id2) {
  const d1 = cmp.driver1;
  const d2 = cmp.driver2;
  const info1 = allDrivers.find(d => d.id === id1) || {};
  const info2 = allDrivers.find(d => d.id === id2) || {};
  const color1 = teamColor(info1.team);
  const color2 = teamColor(info2.team);

  const stats = [
    { label: '总积分', key: 'totalPoints', higher: true },
    { label: '胜场', key: 'wins', higher: true },
    { label: '领奖台', key: 'podiums', higher: true },
    { label: '杆位', key: 'poles', higher: true },
    { label: '最快圈', key: 'fastestLaps', higher: true },
    { label: '平均排位', key: 'avgQualiPos', higher: false },
    { label: '平均完赛', key: 'avgRacePos', higher: false },
    { label: '比赛场次', key: 'races', higher: true },
  ];

  let html = '<div class="cmp-card-container">';

  // Driver headers
  html += `
    <div class="cmp-drivers-header">
      <div class="cmp-driver-head" style="border-color:${color1}">
        <span class="cmp-driver-color" style="background:${color1}"></span>
        <span class="cmp-driver-name">${info1.name || id1}</span>
        <span class="cmp-driver-team">${info1.team}</span>
      </div>
      <div class="cmp-driver-head" style="border-color:${color2}">
        <span class="cmp-driver-color" style="background:${color2}"></span>
        <span class="cmp-driver-name">${info2.name || id2}</span>
        <span class="cmp-driver-team">${info2.team}</span>
      </div>
    </div>
  `;

  // Stats comparison rows
  html += '<div class="cmp-stats-rows">';
  for (const stat of stats) {
    const v1 = d1.stats[stat.key];
    const v2 = d2.stats[stat.key];
    const n1 = parseFloat(v1);
    const n2 = parseFloat(v2);
    let w1 = false, w2 = false;
    if (n1 !== n2) {
      if (stat.higher) { w1 = n1 > n2; w2 = n2 > n1; }
      else { w1 = n1 < n2; w2 = n2 < n1; }
    }
    html += `
      <div class="cmp-stat-row">
        <span class="cmp-stat-val ${w1 ? 'cmp-winner' : ''}">${v1}</span>
        <span class="cmp-stat-label">${stat.label}</span>
        <span class="cmp-stat-val ${w2 ? 'cmp-winner' : ''}">${v2}</span>
      </div>
    `;
  }
  html += '</div>';

  // Race-by-race comparison table
  html += '<div class="detail-label" style="margin-top:1.5rem">逐站对比</div>';
  html += '<table class="cmp-race-table"><tr><th>站</th><th>大奖赛</th>';
  html += `<th style="color:${color1}">${info1.name || id1} 排位</th>`;
  html += `<th style="color:${color1}">${info1.name || id1} 正赛</th>`;
  html += `<th style="color:${color2}">${info2.name || id2} 排位</th>`;
  html += `<th style="color:${color2}">${info2.name || id2} 正赛</th>`;
  html += '</tr>';

  // Build race-by-race map
  const raceMap = {};
  for (const race of d1.results) {
    const r = race.round;
    raceMap[r] = { name: race.raceName, d1: race.Results?.[0], d2: null };
  }
  for (const race of d2.results) {
    const r = race.round;
    if (!raceMap[r]) raceMap[r] = { name: race.raceName, d1: null, d2: null };
    raceMap[r].d2 = race.Results?.[0];
  }

  const rounds = Object.keys(raceMap).sort((a, b) => parseInt(a) - parseInt(b));
  for (const r of rounds) {
    const rd = raceMap[r];
    const g1 = rd.d1?.grid || '-';
    const p1 = rd.d1?.position || '-';
    const g2 = rd.d2?.grid || '-';
    const p2 = rd.d2?.position || '-';
    html += `<tr>
      <td>R${r}</td><td>${rd.name}</td>
      <td>P${g1}</td><td>P${p1}</td>
      <td>P${g2}</td><td>P${p2}</td>
    </tr>`;
  }
  html += '</table>';
  html += '</div>';

  document.getElementById('cmp-results').innerHTML = html;
}

// ─── CLOSE COMPARISON ─────────────────────────────────────────────────────
export function closeComparison() {
  const panel = document.getElementById('comparison-panel');
  if (panel) panel.remove();
  comparisonVisible = false;
  deactivateTab();
  // Restore normal standings
  document.getElementById('standings-drivers').style.display = 'flex';
  document.getElementById('standings-drivers').style.flexDirection = 'column';
  // Re-activate drivers tab
  const tabs = document.querySelectorAll('.standings-tabs .s-tab');
  tabs.forEach(t => { if (t.textContent === '车手') t.classList.add('active'); });
}

function deactivateTab() {
  const tabs = document.querySelectorAll('.standings-tabs .s-tab');
  tabs.forEach(t => t.classList.remove('active'));
}
