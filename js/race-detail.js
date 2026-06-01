import { circuitInfo, teamColor, posClass, esc } from './data.js';
import { getQualifyingResults, getSprintResults, getRaceResults, getRaceSchedule } from './api.js';
import { showReplay } from './race-replay.js';
import { showOnboard } from './onboard.js';
import { renderCircuitSvg } from './circuit.js';
import { driverHeadshot, avatarImg } from './avatars.js';

// Driver cell: small headshot + 3-letter code, falling back to just the code.
function driverCell(code) {
  const safe = esc(code);
  const codeHtml = `<span>${safe}</span>`;
  return `<span class="result-driver-cell">${avatarImg(driverHeadshot(code), '', 'result-avatar')}${codeHtml}</span>`;
}

const detailCache = {};

export function toggleRaceDetail(rc, rowEl, year) {
  const existing = rowEl.nextElementSibling;
  if (existing && existing.classList.contains('race-detail')) {
    existing.remove();
    return;
  }
  const detail = document.createElement('div');
  detail.className = 'race-detail';
  detail.innerHTML = '<div class="detail-loading">加载成绩中...</div>';
  rowEl.after(detail);
  loadRaceDetail(rc, detail, year);
}

async function loadRaceDetail(rc, el, year) {
  const yr = year || 2026;
  const round = rc.r;
  const key = `r${round}_${yr}`;
  if (detailCache[key]) { renderDetail(detailCache[key], rc, el, yr); return; }

  const today = new Date().toISOString().slice(0, 10);
  const isFuture = rc.end >= today;
  const data = { isFuture };

  const fetches = [
    getRaceSchedule(yr, round).then(d => { if (d) data.schedule = d; }).catch(()=>{}),
  ];

  // Only fetch results for past races
  if (!isFuture) {
    fetches.push(
      getQualifyingResults(yr, round).then(d => { if (d) data.qualifying = d; }).catch(()=>{}),
      getRaceResults(yr, round).then(d => { if (d) data.race = d; }).catch(()=>{}),
    );
    if (rc.sprint) {
      fetches.push(
        getSprintResults(yr, round).then(d => { if (d) data.sprint = d; }).catch(()=>{})
      );
    }
  }

  await Promise.all(fetches);
  detailCache[key] = data;
  renderDetail(data, rc, el, yr);
}

function renderDetail(data, rc, el, year) {
  const yr = year || 2026;
  let html = '';

  // Circuit info
  const ci = circuitInfo[rc.r];
  if (ci) {
    html += `<div class="circuit-info">
      <span>${ci.circuit}</span><span>${ci.city}</span><span>${ci.laps} 圈</span><span>${ci.length}</span>
    </div>`;
  }

  // Circuit SVG
  html += `<div id="circuit-svg-r${rc.r}" class="circuit-svg-container"></div>`;

  // Session schedule
  if (data.schedule) {
    const s = data.schedule;
    const fmtTime = (obj) => {
      if (!obj) return null;
      const d = new Date(obj.date + 'T' + obj.time);
      return d.toLocaleString('zh-CN', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:false });
    };
    const sessions = [];
    if (s.FirstPractice) sessions.push(['FP1', fmtTime(s.FirstPractice)]);
    if (s.SecondPractice) sessions.push(['FP2', fmtTime(s.SecondPractice)]);
    if (s.ThirdPractice) sessions.push(['FP3', fmtTime(s.ThirdPractice)]);
    if (s.Sprint) sessions.push(['冲刺赛', fmtTime(s.Sprint)]);
    if (s.SprintQualifying) sessions.push(['冲刺排位', fmtTime(s.SprintQualifying)]);
    if (s.Qualifying) sessions.push(['排位赛', fmtTime(s.Qualifying)]);
    sessions.push(['正赛', fmtTime({ date: s.date, time: s.time })]);
    if (sessions.length) {
      html += `<div class="session-schedule">`;
      sessions.forEach(([name, time]) => {
        if (time) html += `<div class="session-item"><strong>${name}</strong> ${time}</div>`;
      });
      html += `</div>`;
    }
  }

  // Action buttons (only for past races)
  if (!data.isFuture) {
    html += `<div class="detail-actions">
      <button class="detail-action-btn replay-btn" data-round="${rc.r}" onclick="event.stopPropagation(); window._openReplay(${rc.r}, ${yr})">
        <span class="action-icon">📊</span> 位置回放
      </button>
      <button class="detail-action-btn onboard-btn" data-round="${rc.r}" data-meeting="${esc(rc.name)}" onclick="event.stopPropagation(); window._openOnboard(this, this.dataset.meeting)">
        <span class="action-icon">🎥</span> 车载摄像头
      </button>
    </div>`;
    html += `<div id="replay-detail-r${rc.r}"></div>`;
  }

  // Placeholder for weather detail
  html += `<div id="weather-detail-r${rc.r}"></div>`;

  if (data.qualifying) {
    html += buildResultTable('排位赛', data.qualifying, ['P','车手','车队','Q1','Q2','Q3'], q => {
      const color = teamColor(q.Constructor?.name);
      return `<td>${esc(q.position)}</td><td>${driverCell(q.Driver.code)}</td>
        <td><span class="team-dot" style="background:${color}"></span>${esc(q.Constructor?.name||'')}</td>
        <td>${esc(q.Q1||'-')}</td><td>${esc(q.Q2||'-')}</td><td>${esc(q.Q3||'-')}</td>`;
    });
  }

  if (data.sprint) {
    html += buildResultTable('冲刺赛', data.sprint, ['P','车手','车队','成绩/状态','积分'], s => {
      const color = teamColor(s.Constructor?.name);
      const time = s.Time?.time || s.status || '-';
      return `<td>${esc(s.position)}</td><td>${driverCell(s.Driver.code)}</td>
        <td><span class="team-dot" style="background:${color}"></span>${esc(s.Constructor?.name||'')}</td>
        <td>${esc(time)}</td><td>${esc(s.points)}</td>`;
    });
  }

  if (data.race) {
    html += buildResultTable('正赛', data.race, ['P','车手','车队','成绩/状态','积分'], r => {
      const color = teamColor(r.Constructor?.name);
      const time = r.Time?.time || r.status || '-';
      return `<td>${esc(r.position)}</td><td>${driverCell(r.Driver.code)}</td>
        <td><span class="team-dot" style="background:${color}"></span>${esc(r.Constructor?.name||'')}</td>
        <td>${esc(time)}</td><td>${esc(r.points)}</td>`;
    });
  }

  if (data.isFuture) {
    html += '<div class="detail-loading" style="color:var(--muted);padding:1rem 0;">比赛尚未开始，敬请期待</div>';
  } else if (!html || html.replace(/<div id="[^"]*"><\/div>/g, '').trim() === '') {
    html += '<div class="detail-loading">暂无成绩数据</div>';
  }
  el.innerHTML = html;

  // Render circuit SVG
  renderCircuitSvg(rc.r);

  // Wire up show-more buttons
  el.querySelectorAll('.show-more-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const table = btn.previousElementSibling;
      table.querySelectorAll('tr.hidden-row').forEach(tr => tr.style.display = '');
      btn.remove();
    });
  });
}

function buildResultTable(label, items, headers, rowFn) {
  let html = `<div class="detail-section"><div class="detail-label">${label}</div>`;
  html += `<table class="result-table"><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>`;
  items.forEach((item, i) => {
    const pos = parseInt(item.position);
    const cls = pos <= 3 ? `pos-${pos}` : '';
    const hidden = i >= 10 ? ' hidden-row" style="display:none' : '';
    html += `<tr class="${cls}${hidden}">${rowFn(item)}</tr>`;
  });
  html += `</table>`;
  if (items.length > 10) {
    html += `<button class="show-more-btn">查看全部 ${items.length} 名车手</button>`;
  }
  html += `</div>`;
  return html;
}
