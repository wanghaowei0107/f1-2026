// js/weather.js
import { races, circuitInfo, weatherIcon } from './data.js';
import * as api from './api.js';

export async function initWeather() {
  const today = new Date();
  const in14Days = new Date(today);
  in14Days.setDate(in14Days.getDate() + 14);
  const todayStr = today.toISOString().slice(0, 10);
  const futureStr = in14Days.toISOString().slice(0, 10);

  const upcoming = races.filter(rc =>
    !rc.cancelled && rc.date >= todayStr && rc.date <= futureStr
  );

  for (const rc of upcoming) {
    const ci = circuitInfo[rc.r];
    if (!ci?.lat || !ci?.lng) continue;
    try {
      const weather = await api.getWeatherForecast(ci.lat, ci.lng);
      if (!weather?.daily) continue;
      const raceIdx = weather.daily.time.indexOf(rc.date);
      if (raceIdx !== -1) {
        const code = weather.daily.weathercode[raceIdx];
        const hi = Math.round(weather.daily.temperature_2m_max[raceIdx]);
        const lo = Math.round(weather.daily.temperature_2m_min[raceIdx]);
        const span = document.getElementById(`weather-r${rc.r}`);
        if (span) span.textContent = `${weatherIcon(code)} ${lo}-${hi}°C`;
      }
    } catch(e) {}
  }

  observeWeatherDetail();
}

function observeWeatherDetail() {
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.classList?.contains('race-detail')) {
          const container = node.querySelector('[id^="weather-detail-r"]');
          if (container) {
            const round = parseInt(container.id.replace('weather-detail-r', ''));
            fillWeatherDetail(round, container);
          }
        }
      }
    }
  });
  const scheduleList = document.getElementById('schedule-list');
  if (scheduleList) observer.observe(scheduleList, { childList: true });
}

async function fillWeatherDetail(round, container) {
  const rc = races.find(r => r.r === round);
  if (!rc || rc.cancelled) return;
  const ci = circuitInfo[round];
  if (!ci?.lat || !ci?.lng) return;
  const today = new Date().toISOString().slice(0, 10);
  if (rc.end < today) return;

  try {
    const weather = await api.getWeatherForecast(ci.lat, ci.lng);
    if (!weather?.daily) return;

    const startDate = new Date(rc.date);
    const endDate = new Date(rc.end);
    const days = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const idx = weather.daily.time.indexOf(dateStr);
      if (idx !== -1) {
        days.push({
          label: d.toLocaleDateString('zh-CN', { weekday:'short', month:'numeric', day:'numeric' }),
          code: weather.daily.weathercode[idx],
          hi: Math.round(weather.daily.temperature_2m_max[idx]),
          lo: Math.round(weather.daily.temperature_2m_min[idx]),
          precip: weather.daily.precipitation_probability_max?.[idx] ?? '-',
          wind: weather.daily.windspeed_10m_max?.[idx] ? Math.round(weather.daily.windspeed_10m_max[idx]) : '-',
        });
      }
    }
    if (!days.length) return;

    let html = '<div class="detail-label">比赛周末天气</div><div class="weather-detail-grid">';
    for (const day of days) {
      html += `<div class="weather-day">
        <div class="weather-day-label">${day.label}</div>
        <div class="weather-day-icon">${weatherIcon(day.code)}</div>
        <div class="weather-day-temp">${day.lo}° / ${day.hi}°</div>
        <div class="weather-day-detail">降水 ${day.precip}% · 风 ${day.wind}km/h</div>
      </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
  } catch(e) {}
}
