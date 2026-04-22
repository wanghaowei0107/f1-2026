import { circuitInfo, teamColor, posClass } from './data.js';
import { getQualifyingResults, getSprintResults, getRaceResults, getRaceSchedule } from './api.js';

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
  if (detailCache[key]) { renderDetail(detailCache[key], rc, el); return; }

  const data = {};

  const fetches = [
    getQualifyingResults(yr, round).then(d => { if (d) data.qualifying = d; }).catch(()=>{}),
    getRaceResults(yr, round).then(d => { if (d) data.race = d; }).catch(()=>{}),
    getRaceSchedule(yr, round).then(d => { if (d) data.schedule = d; }).catch(()=>{}),
  ];

  if (rc.sprint) {
    fetches.push(
      getSprintResults(yr, round).then(d => { if (d) data.sprint = d; }).catch(()=>{})
    );
  }

  await Promise.all(fetches);
  detailCache[key] = data;
  renderDetail(data, rc, el);
}

function renderDetail(data, rc, el) {
  let html = '';

  // Circuit info
  const ci = circuitInfo[rc.r];
  if (ci) {
    html += `<div class="circuit-info">
      <span>${ci.circuit}</span><span>${ci.city}</span><span>${ci.laps} 圈</span><span>${ci.length}</span>
    </div>`;
  }

  // Placeholder for circuit SVG visualization
  html += `<div id="circuit-svg-r${rc.r}"></div>`;

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

  // Placeholder for weather detail
  html += `<div id="weather-detail-r${rc.r}"></div>`;

  if (data.qualifying) {
    html += buildResultTable('排位赛', data.qualifying, ['P','车手','车队','Q1','Q2','Q3'], q => {
      const color = teamColor(q.Constructor?.name);
      return `<td>${q.position}</td><td>${q.Driver.code}</td>
        <td><span class="team-dot" style="background:${color}"></span>${q.Constructor?.name||''}</td>
        <td>${q.Q1||'-'}</td><td>${q.Q2||'-'}</td><td>${q.Q3||'-'}</td>`;
    });
  }

  if (data.sprint) {
    html += buildResultTable('冲刺赛', data.sprint, ['P','车手','车队','成绩/状态','积分'], s => {
      const color = teamColor(s.Constructor?.name);
      const time = s.Time?.time || s.status || '-';
      return `<td>${s.position}</td><td>${s.Driver.code}</td>
        <td><span class="team-dot" style="background:${color}"></span>${s.Constructor?.name||''}</td>
        <td>${time}</td><td>${s.points}</td>`;
    });
  }

  if (data.race) {
    html += buildResultTable('正赛', data.race, ['P','车手','车队','成绩/状态','积分'], r => {
      const color = teamColor(r.Constructor?.name);
      const time = r.Time?.time || r.status || '-';
      return `<td>${r.position}</td><td>${r.Driver.code}</td>
        <td><span class="team-dot" style="background:${color}"></span>${r.Constructor?.name||''}</td>
        <td>${time}</td><td>${r.points}</td>`;
    });
  }

  if (!html || html.replace(/<div id="[^"]*"><\/div>/g, '').trim() === '') {
    html += '<div class="detail-loading">暂无成绩数据</div>';
  }
  el.innerHTML = html;

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
