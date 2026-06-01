import { teamColor, driverFlag, posClass, esc } from './data.js';
import { getDriverStandings, getConstructorStandings } from './api.js';
import { driverHeadshot, avatarImg } from './avatars.js';

let standingsLoaded = false;

function renderStandingsSkeleton(container, count, type) {
  container.innerHTML = '';
  const cols = type === 'constructors' ? '28px 12px 1fr 130px 44px' : '28px 24px 1fr 130px 44px';
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'skeleton-row';
    row.style.gridTemplateColumns = cols;
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
  const TOP_VISIBLE = 8;

  standings.forEach((s, idx) => {
    const pos = parseInt(s.position);
    const pts = parseFloat(s.points);
    const pct = Math.round((pts / maxPts) * 100);
    const color = teamColor(s.Constructors[0]?.name);
    const d = s.Driver;
    const flag = driverFlag(d.nationality);
    const code = d.code || '';
    const driverId = d.driverId || '';
    const row = document.createElement('div');
    row.className = 'driver-row clickable' + (pos <= 3 ? ' top-3' : '');
    row.setAttribute('data-driver-id', driverId);
    if (code) row.setAttribute('data-driver-code', code);
    if (idx >= TOP_VISIBLE) {
      row.classList.add('hidden-row');
      row.style.display = 'none';
    }
    const flagHtml = `<span class="st-flag">${flag}</span>`;
    const avatarHtml = avatarImg(driverHeadshot(code), flagHtml, 'st-avatar');
    row.innerHTML = `
      <span class="st-pos ${posClass(pos)}">${String(pos).padStart(2,'0')}</span>
      ${avatarHtml}
      <div>
        <div class="st-name">${esc(d.givenName)} ${esc(d.familyName)}</div>
        <div class="st-team">${esc(s.Constructors[0]?.name || '')}</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="st-pts">${pts}</span>
    `;
    el.appendChild(row);
  });

  if (standings.length > TOP_VISIBLE) {
    appendShowMore(el, standings.length - TOP_VISIBLE);
  }
}

function renderConstructors(standings) {
  const el = document.getElementById('standings-constructors');
  el.innerHTML = '';
  const maxPts = parseFloat(standings[0]?.points || 1);

  standings.forEach((s) => {
    const pos = parseInt(s.position);
    const pts = parseFloat(s.points);
    const pct = maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0;
    const color = teamColor(s.Constructor.name);
    const constructorId = s.Constructor.constructorId || '';
    const row = document.createElement('div');
    row.className = 'cons-row clickable' + (pos <= 3 ? ' top-3' : '');
    row.setAttribute('data-constructor-id', constructorId);
    row.innerHTML = `
      <span class="st-pos ${posClass(pos)}">${String(pos).padStart(2,'0')}</span>
      <div class="cons-dot" style="background:${color}"></div>
      <div class="st-name">${esc(s.Constructor.name)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="st-pts">${pts}</span>
    `;
    el.appendChild(row);
  });
}

function appendShowMore(container, hiddenCount) {
  const btn = document.createElement('button');
  btn.className = 'show-more-btn';
  btn.dataset.expanded = '0';
  const setLabel = () => {
    const expanded = btn.dataset.expanded === '1';
    btn.textContent = expanded ? '收起' : `展开剩余 ${hiddenCount} 位 →`;
  };
  setLabel();
  btn.addEventListener('click', () => {
    const expanded = btn.dataset.expanded === '1';
    container.querySelectorAll('.hidden-row').forEach(r => {
      r.style.display = expanded ? 'none' : '';
    });
    btn.dataset.expanded = expanded ? '0' : '1';
    setLabel();
  });
  container.appendChild(btn);
}

export async function loadStandings(year, force) {  if (standingsLoaded && !force) return;
  standingsLoaded = true;

  const yr = year || 2026;

  // Show skeleton while loading
  const driversEl = document.getElementById('standings-drivers');
  const constructorsEl = document.getElementById('standings-constructors');

  if (!driversEl.children.length || driversEl.querySelector('.loading')) {
    renderStandingsSkeleton(driversEl, 10, 'drivers');
  }
  if (!constructorsEl.children.length || constructorsEl.querySelector('.loading')) {
    renderStandingsSkeleton(constructorsEl, 10, 'constructors');
  }

  // Driver standings
  try {
    const list = await getDriverStandings(yr);
    if (list) {
      renderDrivers(list.DriverStandings);
      document.getElementById('last-update').textContent =
        `已更新至第 ${list.round} 站 · ${new Date().toLocaleDateString('zh-CN')}`;
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

// Progressive enhancement: once avatars finish loading, swap the flag emoji in
// already-rendered driver rows for the headshot. Called by app.js.
export function refreshAvatars() {
  document.querySelectorAll('.driver-row[data-driver-code]').forEach(row => {
    const code = row.getAttribute('data-driver-code');
    const url = driverHeadshot(code);
    if (!url) return;
    const slot = row.querySelector('.st-flag, .st-avatar');
    if (!slot || slot.classList.contains('avatar')) return; // already a headshot
    const flagHtml = slot.outerHTML;
    slot.outerHTML = avatarImg(url, flagHtml, 'st-avatar');
  });
}
