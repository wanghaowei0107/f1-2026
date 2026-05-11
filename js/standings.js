import { teamColor, driverFlag, posClass } from './data.js';
import { getDriverStandings, getConstructorStandings } from './api.js';

let standingsLoaded = false;

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

export function showStandings(type, btn) {
  document.getElementById('standings-drivers').style.display = type === 'drivers' ? 'flex' : 'none';
  document.getElementById('standings-constructors').style.display = type === 'constructors' ? 'flex' : 'none';
  document.getElementById('standings-drivers').style.flexDirection = 'column';
  document.getElementById('standings-constructors').style.flexDirection = 'column';
  document.querySelectorAll('.standings-tabs .s-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function renderDrivers(standings) {
  const el = document.getElementById('standings-drivers');
  el.innerHTML = '';
  const maxPts = parseFloat(standings[0]?.points || 1);
  standings.forEach(s => {
    const pos = parseInt(s.position);
    const pts = parseFloat(s.points);
    const pct = Math.round((pts / maxPts) * 100);
    const color = teamColor(s.Constructors[0]?.name);
    const d = s.Driver;
    const flag = driverFlag(d.nationality);
    const driverId = d.driverId || '';
    const row = document.createElement('div');
    row.className = 'driver-row clickable';
    row.setAttribute('data-driver-id', driverId);
    row.innerHTML = `
      <span class="st-pos ${posClass(pos)}">${pos}</span>
      <span class="st-flag">${flag}</span>
      <div>
        <div class="st-name">${d.givenName} ${d.familyName}</div>
        <div class="st-team">${s.Constructors[0]?.name || ''}</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="st-pts">${pts}</span>
    `;
    el.appendChild(row);
  });
}

function renderConstructors(standings) {
  const el = document.getElementById('standings-constructors');
  el.innerHTML = '';
  const maxPts = parseFloat(standings[0]?.points || 1);
  standings.forEach(s => {
    const pos = parseInt(s.position);
    const pts = parseFloat(s.points);
    const pct = maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0;
    const color = teamColor(s.Constructor.name);
    const constructorId = s.Constructor.constructorId || '';
    const row = document.createElement('div');
    row.className = 'cons-row clickable';
    row.setAttribute('data-constructor-id', constructorId);
    row.innerHTML = `
      <span class="st-pos ${posClass(pos)}">${pos}</span>
      <div class="cons-dot" style="background:${color}"></div>
      <div class="st-name">${s.Constructor.name}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="st-pts">${pts}</span>
    `;
    el.appendChild(row);
  });
}

export async function loadStandings(year, force) {
  if (standingsLoaded && !force) return;
  standingsLoaded = true;

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

  // Driver standings
  try {
    const list = await getDriverStandings(yr);
    if (list) {
      renderDrivers(list.DriverStandings);
      document.getElementById('last-update').textContent =
        `积分更新至第${list.round}站 · ${new Date().toLocaleDateString('zh-CN')}`;
    }
  } catch(e) {
    document.getElementById('standings-drivers').innerHTML =
      '<div class="error-msg">加载失败，请检查网络后点击刷新</div>';
  }

  // Constructor standings
  try {
    const list2 = await getConstructorStandings(yr);
    if (list2) renderConstructors(list2.ConstructorStandings);
  } catch(e) {
    document.getElementById('standings-constructors').innerHTML =
      '<div class="error-msg">加载失败，请检查网络后点击刷新</div>';
  }
}
