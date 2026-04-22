import { races } from './data.js';

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
    const fmt = d => d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    document.getElementById('nr-date').textContent =
      `${fmt(sd)} — ${ed.getDate()}日 · ${nextRace.flag}`;
    startCountdown(new Date(nextRace.date + 'T06:00:00Z'));
  } else {
    document.getElementById('nr-name').textContent = '赛季已结束';
    document.getElementById('nr-date').textContent = '期待2027赛季';
  }

  list.forEach(rc => {
    const isPast = rc.end < today;
    const isNext = nextRace && rc.r === nextRace.r;
    const div = document.createElement('div');
    div.className = 'race-row' + (isPast && !rc.cancelled ? ' is-past clickable' : '') + (isNext ? ' is-next' : '');

    const d = new Date(rc.date);
    const dateStr = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

    let statusHtml = '';
    if (rc.cancelled) {
      statusHtml = '<span class="status-pill status-cancelled">已取消</span>';
    } else if (isPast) {
      statusHtml = '<span class="status-pill status-done">已完赛</span>';
    } else if (isNext) {
      statusHtml = '<span class="status-pill status-next">下一站</span>';
    }

    div.innerHTML = `
      <span class="rr-round">R${rc.r}</span>
      <span class="rr-flag">${rc.flag}</span>
      <div>
        <div class="rr-name">${rc.name}</div>
      </div>
      ${rc.sprint ? '<span class="sprint-pill">冲刺</span>' : '<span></span>'}
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="rr-date">${dateStr}</span>
        ${statusHtml}
        <span id="weather-r${rc.r}"></span>
      </div>
    `;

    if (isPast && !rc.cancelled) {
      div.addEventListener('click', () => {
        if (onRaceClick) onRaceClick(rc, div);
      });
    }

    el.appendChild(div);
  });
}
