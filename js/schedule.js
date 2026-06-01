import { races } from './data.js';
import { esc } from './data.js';

let countdownInterval;

function startCountdown(target) {
  clearInterval(countdownInterval);
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-d','cd-h','cd-m','cd-s'].forEach(id => document.getElementById(id).textContent = '0');
      return;
    }
    document.getElementById('cd-d').textContent = Math.floor(diff / 86400000);
    document.getElementById('cd-h').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
    document.getElementById('cd-m').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
    document.getElementById('cd-s').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

export function buildSchedule(raceList, onRaceClick) {
  const list = raceList || races;
  const today = new Date().toISOString().slice(0, 10);
  let nextSet = false;
  const el = document.getElementById('schedule-list');

  el.innerHTML = '';

  let nextRace = null;
  for (const rc of list) {
    if (!rc.cancelled && rc.end >= today && !nextSet) { nextRace = rc; nextSet = true; }
  }

  if (nextRace) {
    document.getElementById('nr-name').textContent = nextRace.name;
    const sd = new Date(nextRace.date);
    const ed = new Date(nextRace.end);
    document.getElementById('nr-date').textContent =
      `${sd.getMonth()+1} 月 ${sd.getDate()} — ${ed.getDate()} 日 · ${nextRace.flag}`;
    const roundEl = document.getElementById('nr-round');
    if (roundEl) roundEl.textContent = `第 ${String(nextRace.r).padStart(2,'0')} 站`;
    const issueEl = document.getElementById('ft-issue');
    if (issueEl) issueEl.textContent = String(nextRace.r).padStart(2,'0');
    startCountdown(new Date(nextRace.date + 'T06:00:00Z'));
  } else {
    clearInterval(countdownInterval);
    document.getElementById('nr-name').textContent = '赛季已结束';
    document.getElementById('nr-date').textContent = '期待 2027 赛季';
    const roundEl = document.getElementById('nr-round');
    if (roundEl) roundEl.textContent = '';
  }

  list.forEach(rc => {
    const isPast = rc.end < today;
    const isNext = nextRace && rc.r === nextRace.r;
    const div = document.createElement('div');
    div.className = 'race-row' + (isPast && !rc.cancelled ? ' is-past' : '') + (!rc.cancelled ? ' clickable' : '') + (isNext ? ' is-next' : '');

    const d = new Date(rc.date);
    const dateStr = `${d.getMonth()+1}月${d.getDate()}日`;

    let statusHtml = '';
    if (rc.cancelled) {
      statusHtml = '<span class="status-pill status-cancelled">已取消</span>';
    } else if (isPast) {
      statusHtml = '<span class="status-pill status-done">已完赛</span>';
    } else if (isNext) {
      statusHtml = '<span class="status-pill status-next">下一站</span>';
    }

    div.innerHTML = `
      <span class="rr-round">R${String(rc.r).padStart(2,'0')}</span>
      <span class="rr-flag">${rc.flag}</span>
      <div>
        <div class="rr-name">${esc(rc.name)}</div>
      </div>
      ${rc.sprint ? '<span class="sprint-pill">冲刺赛</span>' : '<span></span>'}
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="rr-date">${dateStr}</span>
        ${statusHtml}
        <span id="weather-r${rc.r}"></span>
      </div>
    `;

    if (!rc.cancelled) {
      div.addEventListener('click', () => {
        if (onRaceClick) onRaceClick(rc, div);
      });
    }

    el.appendChild(div);
  });
}
