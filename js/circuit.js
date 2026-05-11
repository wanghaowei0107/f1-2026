// js/circuit.js

import { circuitSvgData } from './circuit-data.js';

export function renderCircuitSvg(round) {
  const container = document.getElementById(`circuit-svg-r${round}`);
  if (!container) return;

  const data = circuitSvgData[round];
  if (!data) {
    container.innerHTML = '<span class="no-circuit">赛道图暂未收录</span>';
    return;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const trackColor = isDark ? '#555' : '#ccc';
  const textColor = isDark ? '#aaa' : '#666';
  const cornerColor = isDark ? '#666' : '#999';

  let svg = `<svg viewBox="${data.viewBox}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;max-height:100%;">`;

  // Render track paths
  for (const path of data.paths) {
    if (path.type === 'track') {
      svg += `<path d="${path.d}" fill="none" stroke="${trackColor}" stroke-width="${path.style.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }

  // Render DRS zones
  for (const path of data.paths) {
    if (path.type === 'drs') {
      svg += `<path d="${path.d}" fill="none" stroke="#00cc44" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
    }
  }

  // Render start/finish marker
  for (const marker of data.markers) {
    if (marker.type === 'start') {
      svg += `<circle cx="${marker.x}" cy="${marker.y}" r="5" fill="var(--red)"/>`;
      svg += `<text x="${marker.x + 10}" y="${marker.y + 4}" fill="${textColor}" font-size="11" font-family="DM Sans">${marker.label}</text>`;
    }
  }

  // Render corner numbers
  for (const corner of data.corners) {
    svg += `<circle cx="${corner.x}" cy="${corner.y}" r="12" fill="none" stroke="${cornerColor}" stroke-width="1"/>`;
    svg += `<text x="${corner.x}" y="${corner.y + 4}" text-anchor="middle" fill="${textColor}" font-size="10" font-family="DM Sans">${corner.number}</text>`;
  }

  // DRS legend
  svg += `<rect x="10" y="${parseInt(data.viewBox.split(' ')[3]) - 30}" width="16" height="3" rx="1" fill="#00cc44" opacity="0.7"/>`;
  svg += `<text x="30" y="${parseInt(data.viewBox.split(' ')[3]) - 26}" fill="${isDark ? '#777' : '#999'}" font-size="9" font-family="DM Sans">DRS</text>`;

  svg += '</svg>';
  container.innerHTML = svg;
}

export function initCircuitObserver() {
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        // Check if the added node itself has the SVG container
        const svgContainer = node.querySelector?.('[id^="circuit-svg-r"]');
        if (svgContainer) {
          const round = parseInt(svgContainer.id.replace('circuit-svg-r', ''));
          renderCircuitSvg(round);
        }
      }
    }
  });
  const scheduleList = document.getElementById('schedule-list');
  if (scheduleList) observer.observe(scheduleList, { childList: true, subtree: true });
}
