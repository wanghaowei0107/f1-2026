// ─── INSIGHTS: H2H, MOVERS, ATTRITION, FASTEST LAPS ─────────────────────────
// All four panels feed off a single getAllResults() call (already memoized in api.js)
// plus the existing standings call, so no new network volume.

import { teamColor, driverFlag } from './data.js';
import { getAllResults, getDriverStandings, getConstructorStandings } from './api.js';

let insightsLoaded = false;

export async function initInsights() {
  if (insightsLoaded) return;
  insightsLoaded = true;
  await renderInsights(2026);
}

export async function renderInsights(year = 2026) {
  const yr = year || 2026;
  setLoading(true);

  let races = [], drivers = null, constructors = null;
  try {
    [races, drivers, constructors] = await Promise.all([
      getAllResults(yr),
      getDriverStandings(yr).catch(() => null),
      getConstructorStandings(yr).catch(() => null),
    ]);
  } catch (e) {
    setError();
    return;
  }

  if (!races || races.length === 0) {
    setEmpty();
    return;
  }

  renderH2H(races, constructors);
  renderMovers(races);
  renderAttrition(races);
  renderFastestLaps(races, drivers);
}

function setLoading(on) {
  document.querySelectorAll('.insight-body').forEach(el => {
    if (on) el.innerHTML = '<div class="loading">加载中</div>';
  });
}

function setError() {
  document.querySelectorAll('.insight-body').forEach(el => {
    el.innerHTML = '<div class="error-msg">数据加载失败</div>';
  });
}

function setEmpty() {
  document.querySelectorAll('.insight-body').forEach(el => {
    el.innerHTML = '<div class="loading">本赛季暂无数据</div>';
  });
}

// ─── 1. HEAD-TO-HEAD (TEAMMATES) ───────────────────────────────────────────
function renderH2H(races, constructors) {
  const el = document.getElementById('insight-h2h');
  if (!el) return;

  // Group results by constructor → drivers
  const teams = {};
  for (const race of races) {
    for (const r of (race.Results || [])) {
      const team = r.Constructor?.name;
      if (!team) continue;
      const did = r.Driver.driverId;
      if (!teams[team]) teams[team] = { drivers: {}, color: teamColor(team) };
      if (!teams[team].drivers[did]) {
        teams[team].drivers[did] = {
          id: did,
          code: r.Driver.code,
          name: `${r.Driver.givenName} ${r.Driver.familyName}`,
          flag: driverFlag(r.Driver.nationality),
          races: {},
          quali: {},
          racePts: 0,
          finishCount: 0,
          finishSum: 0,
          qualiCount: 0,
          qualiSum: 0,
        };
      }
      const d = teams[team].drivers[did];
      const round = parseInt(race.round);
      const pos = parseInt(r.position);
      const grid = parseInt(r.grid);
      d.races[round] = pos;
      if (Number.isFinite(grid) && grid > 0) {
        d.quali[round] = grid;
        d.qualiSum += grid;
        d.qualiCount++;
      }
      d.racePts += parseFloat(r.points || 0);
      if (Number.isFinite(pos)) {
        d.finishCount++;
        d.finishSum += pos;
      }
    }
  }

  // Sort teams by constructor standings (if available) else by total points
  const teamOrder = constructors?.ConstructorStandings?.map(c => c.Constructor.name) || Object.keys(teams);
  const ordered = teamOrder.filter(t => teams[t] && Object.keys(teams[t].drivers).length === 2);

  if (!ordered.length) {
    el.innerHTML = '<div class="loading">暂无队友对决数据</div>';
    return;
  }

  const VISIBLE = 5;
  let html = '';
  ordered.forEach((teamName, idx) => {
    const t = teams[teamName];
    const [a, b] = Object.values(t.drivers);

    // Compute H2H scores
    let qWinA = 0, qWinB = 0;
    for (const rnd of Object.keys(a.quali)) {
      if (b.quali[rnd] == null) continue;
      if (a.quali[rnd] < b.quali[rnd]) qWinA++; else if (a.quali[rnd] > b.quali[rnd]) qWinB++;
    }
    let rWinA = 0, rWinB = 0;
    for (const rnd of Object.keys(a.races)) {
      if (b.races[rnd] == null) continue;
      if (a.races[rnd] < b.races[rnd]) rWinA++; else if (a.races[rnd] > b.races[rnd]) rWinB++;
    }
    const avgQA = a.qualiCount ? (a.qualiSum / a.qualiCount).toFixed(1) : '—';
    const avgQB = b.qualiCount ? (b.qualiSum / b.qualiCount).toFixed(1) : '—';
    const avgFA = a.finishCount ? (a.finishSum / a.finishCount).toFixed(1) : '—';
    const avgFB = b.finishCount ? (b.finishSum / b.finishCount).toFixed(1) : '—';

    const hidden = idx >= VISIBLE ? ' h2h-hidden' : '';
    html += `
      <div class="h2h-card${hidden}" style="--team-color:${t.color}">
        <div class="h2h-team">${teamName}</div>
        <div class="h2h-names">
          <div class="h2h-name h2h-left">
            <span class="h2h-flag">${a.flag}</span>
            <span>${a.code}</span>
          </div>
          <div class="h2h-vs">VS</div>
          <div class="h2h-name h2h-right">
            <span>${b.code}</span>
            <span class="h2h-flag">${b.flag}</span>
          </div>
        </div>
        ${h2hBar('Qualifying', qWinA, qWinB)}
        ${h2hBar('Race finish', rWinA, rWinB)}
        <div class="h2h-stats">
          <div class="h2h-stat-col">
            <div class="h2h-stat-num">${a.racePts}</div>
            <div class="h2h-stat-num h2h-stat-sub">avg Q ${avgQA} · F ${avgFA}</div>
          </div>
          <div class="h2h-stat-label">PTS · AVG</div>
          <div class="h2h-stat-col">
            <div class="h2h-stat-num">${b.racePts}</div>
            <div class="h2h-stat-num h2h-stat-sub">avg Q ${avgQB} · F ${avgFB}</div>
          </div>
        </div>
      </div>
    `;
  });

  if (ordered.length > VISIBLE) {
    html += `<button class="show-more-btn h2h-toggle" data-expanded="0">Show remaining ${ordered.length - VISIBLE} teams</button>`;
  }
  el.innerHTML = html;

  const toggle = el.querySelector('.h2h-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.dataset.expanded === '1';
      el.querySelectorAll('.h2h-hidden').forEach(c => c.classList.toggle('h2h-hidden-show', !expanded));
      toggle.dataset.expanded = expanded ? '0' : '1';
      toggle.textContent = expanded
        ? `Show remaining ${ordered.length - VISIBLE} teams`
        : 'Show fewer';
    });
  }
}

function h2hBar(label, a, b) {
  const total = a + b || 1;
  const pctA = (a / total) * 100;
  return `
    <div class="h2h-bar-row">
      <div class="h2h-bar-label">${label}</div>
      <div class="h2h-score-row">
        <div class="h2h-score">${a}</div>
        <div class="h2h-bar">
          <div class="h2h-bar-a" style="width:${pctA}%"></div>
          <div class="h2h-bar-b" style="width:${100 - pctA}%"></div>
        </div>
        <div class="h2h-score">${b}</div>
      </div>
    </div>
  `;
}

// ─── 2. MOVERS & SHAKERS (NET POSITION CHANGE) ─────────────────────────────
function renderMovers(races) {
  const el = document.getElementById('insight-movers');
  if (!el) return;

  // Per-race position change
  const perRace = []; // { delta, code, raceName, round, grid, pos }
  // Cumulative season total per driver
  const cum = {}; // driverId → { code, name, total, color }

  for (const race of races) {
    for (const r of (race.Results || [])) {
      const grid = parseInt(r.grid);
      const pos = parseInt(r.position);
      // grid 0 == pit lane start; we still count it as last
      if (!Number.isFinite(pos)) continue;
      const eff = Number.isFinite(grid) && grid > 0 ? grid : 20;
      const delta = eff - pos;
      perRace.push({
        delta,
        code: r.Driver.code,
        race: race.raceName,
        round: parseInt(race.round),
        grid: r.grid,
        pos: r.position,
      });
      const did = r.Driver.driverId;
      if (!cum[did]) cum[did] = {
        code: r.Driver.code,
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        total: 0,
        color: teamColor(r.Constructor?.name),
      };
      cum[did].total += delta;
    }
  }

  const topGains = [...perRace].sort((a, b) => b.delta - a.delta).slice(0, 5);
  const topLosses = [...perRace].sort((a, b) => a.delta - b.delta).slice(0, 5);
  const seasonRank = Object.values(cum)
    .filter(d => d.total !== 0)
    .sort((a, b) => b.total - a.total);
  const seasonTop = seasonRank.slice(0, 5);
  const seasonBot = [...seasonRank].slice(-5).reverse();

  let html = `
    <div class="movers-grid">
      <div class="movers-col">
        <div class="movers-sub">Best single race</div>
        ${topGains.map(m => moverRow(m, true)).join('')}
      </div>
      <div class="movers-col">
        <div class="movers-sub">Worst single race</div>
        ${topLosses.map(m => moverRow(m, false)).join('')}
      </div>
    </div>
    <div class="movers-divider"></div>
    <div class="movers-grid">
      <div class="movers-col">
        <div class="movers-sub">Season net gain</div>
        ${seasonTop.map(d => seasonRow(d)).join('')}
      </div>
      <div class="movers-col">
        <div class="movers-sub">Season net loss</div>
        ${seasonBot.map(d => seasonRow(d)).join('')}
      </div>
    </div>
  `;
  el.innerHTML = html;
}

function moverRow(m, gain) {
  const sign = m.delta > 0 ? '+' : '';
  const cls = gain ? 'gain' : 'loss';
  return `
    <div class="mover-row">
      <div class="mover-delta mover-${cls}">${sign}${m.delta}</div>
      <div class="mover-body">
        <div class="mover-code">${m.code}</div>
        <div class="mover-meta">R${String(m.round).padStart(2,'0')} · grid ${m.grid} → P${m.pos}</div>
      </div>
    </div>
  `;
}

function seasonRow(d) {
  const sign = d.total > 0 ? '+' : '';
  const cls = d.total > 0 ? 'gain' : 'loss';
  return `
    <div class="mover-row">
      <div class="mover-delta mover-${cls}">${sign}${d.total}</div>
      <div class="mover-body">
        <div class="mover-code">${d.code}</div>
        <div class="mover-meta">${d.name}</div>
      </div>
      <div class="mover-tick" style="background:${d.color}"></div>
    </div>
  `;
}

// ─── 3. ATTRITION REPORT (FINISH RATE + DNF DRIVERS) ───────────────────────
function renderAttrition(races) {
  const el = document.getElementById('insight-attrition');
  if (!el) return;

  const statusBuckets = {}; // status → count
  const dnfByDriver = {}; // driverId → { code, name, color, count }
  let total = 0;

  for (const race of races) {
    for (const r of (race.Results || [])) {
      const status = (r.status || '').trim();
      if (!status) continue;
      total++;
      const cat = classifyStatus(status);
      statusBuckets[cat] = (statusBuckets[cat] || 0) + 1;
      if (cat !== 'Finished' && cat !== 'Lapped') {
        const did = r.Driver.driverId;
        if (!dnfByDriver[did]) dnfByDriver[did] = {
          code: r.Driver.code,
          name: `${r.Driver.givenName} ${r.Driver.familyName}`,
          color: teamColor(r.Constructor?.name),
          count: 0,
        };
        dnfByDriver[did].count++;
      }
    }
  }

  if (!total) {
    el.innerHTML = '<div class="loading">本赛季暂无完赛数据</div>';
    return;
  }

  const order = ['Finished', 'Lapped', 'Retired', 'Disqualified', 'Withdrawn', 'DNS'];
  const sorted = order
    .filter(k => statusBuckets[k])
    .map(k => [k, statusBuckets[k]])
    .concat(Object.entries(statusBuckets).filter(([k]) => !order.includes(k)));

  let html = `
    <div class="attrition-meta">${total} entries across ${races.length} races</div>
    <div class="attrition-list">
  `;
  for (const [cat, count] of sorted) {
    const pct = (count / total) * 100;
    const isDNF = cat !== 'Finished' && cat !== 'Lapped';
    html += `
      <div class="attrition-row">
        <div class="attrition-bar-wrap">
          <div class="attrition-bar${isDNF ? ' attrition-bar-dnf' : ''}" style="width:${pct}%"></div>
        </div>
        <div class="attrition-cat">${cat}</div>
        <div class="attrition-count">${count} <span class="attrition-pct">${pct.toFixed(0)}%</span></div>
      </div>
    `;
  }
  html += '</div>';

  // DNF leaderboard
  const dnfList = Object.values(dnfByDriver)
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (dnfList.length) {
    html += `
      <div class="attrition-divider"></div>
      <div class="movers-sub">DNF leaderboard</div>
      <div class="attrition-list">
    `;
    const max = dnfList[0].count;
    for (const d of dnfList) {
      const pct = (d.count / max) * 100;
      html += `
        <div class="attrition-row dnf-row">
          <div class="attrition-bar-wrap">
            <div class="attrition-bar" style="width:${pct}%;background:${d.color}"></div>
          </div>
          <div class="attrition-cat dnf-driver">
            <span class="dnf-code">${d.code}</span>
            <span class="dnf-name">${d.name}</span>
          </div>
          <div class="attrition-count">${d.count}</div>
        </div>
      `;
    }
    html += '</div>';
  }

  el.innerHTML = html;
}

function classifyStatus(status) {
  const s = status.toLowerCase();
  if (s === 'finished') return 'Finished';
  if (s === 'lapped' || /^\+\d+\s+lap/.test(s)) return 'Lapped';
  if (s === 'disqualified' || s === 'dsq') return 'Disqualified';
  if (s === 'did not start' || s === 'dns') return 'DNS';
  if (s === 'did not qualify' || s === 'dnq') return 'DNQ';
  if (s.includes('withdraw')) return 'Withdrawn';
  // Everything else (Retired, Engine, Collision, ...) collapses to Retired
  return 'Retired';
}

// ─── 4. FASTEST LAP TROPHIES ───────────────────────────────────────────────
function renderFastestLaps(races, drivers) {
  const el = document.getElementById('insight-fastest');
  if (!el) return;

  const counts = {}; // driverId → { code, name, count, color }
  let totalFL = 0;

  for (const race of races) {
    for (const r of (race.Results || [])) {
      if (r.FastestLap?.rank === '1') {
        const did = r.Driver.driverId;
        if (!counts[did]) counts[did] = {
          code: r.Driver.code,
          name: `${r.Driver.givenName} ${r.Driver.familyName}`,
          count: 0,
          color: teamColor(r.Constructor?.name),
          best: r.FastestLap.Time?.time || '',
          bestRound: parseInt(race.round),
          bestRace: race.raceName,
        };
        counts[did].count++;
        totalFL++;
      }
    }
  }

  const sorted = Object.values(counts).sort((a, b) => b.count - a.count);

  if (!sorted.length) {
    el.innerHTML = '<div class="loading">本赛季暂无最快圈数据</div>';
    return;
  }

  const max = sorted[0].count;
  let html = `
    <div class="attrition-meta">${totalFL} fastest laps awarded · ${sorted.length} different drivers</div>
    <div class="fastest-list">
  `;
  sorted.forEach((d, i) => {
    const pct = (d.count / max) * 100;
    html += `
      <div class="fastest-row">
        <div class="fastest-rank">${String(i + 1).padStart(2, '0')}</div>
        <div class="fastest-bar-wrap">
          <div class="fastest-bar" style="width:${pct}%;background:${d.color}"></div>
        </div>
        <div class="fastest-name">${d.code}</div>
        <div class="fastest-meta">best ${d.best || '—'}</div>
        <div class="fastest-count">${d.count}</div>
      </div>
    `;
  });
  html += '</div>';
  el.innerHTML = html;
}
