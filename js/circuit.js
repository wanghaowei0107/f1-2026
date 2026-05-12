import { circuitSvgFiles } from './circuit-map.js';

const svgCache = {};

export async function renderCircuitSvg(round) {
  const container = document.getElementById(`circuit-svg-r${round}`);
  if (!container) return;

  const filename = circuitSvgFiles[round];
  if (!filename) {
    container.innerHTML = '<span class="no-circuit">赛道图暂未收录</span>';
    return;
  }

  try {
    if (!svgCache[round]) {
      const response = await fetch(`circuits/${filename}`);
      if (!response.ok) throw new Error('Not found');
      svgCache[round] = await response.text();
    }

    // Adjust SVG colors for current theme
    let svg = svgCache[round];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      svg = svg.replace(/stroke:#fff/g, 'stroke:#555');
      svg = svg.replace(/stroke:#000/g, 'stroke:#ccc');
    } else {
      svg = svg.replace(/stroke:#fff/g, 'stroke:#ddd');
      svg = svg.replace(/stroke:#000/g, 'stroke:#333');
    }

    container.innerHTML = svg;
    // Make SVG responsive
    const svgEl = container.querySelector('svg');
    if (svgEl) {
      svgEl.removeAttribute('width');
      svgEl.removeAttribute('height');
      svgEl.style.maxWidth = '100%';
      svgEl.style.maxHeight = '180px';
    }
  } catch (e) {
    container.innerHTML = '<span class="no-circuit">赛道图加载失败</span>';
  }
}

export function initCircuitObserver() {
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
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
