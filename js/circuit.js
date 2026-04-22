// js/circuit.js

const circuitPaths = {
  1:  { viewBox:'0 0 400 300', path:'M 80,250 C 60,200 50,150 70,100 C 90,50 140,30 200,25 C 260,20 320,40 350,80 C 380,120 370,180 340,220 C 310,260 250,280 200,275 C 150,270 100,260 80,250 Z', drs:[{x1:200,y1:25,x2:320,y2:40},{x1:80,y1:250,x2:70,y2:150}], start:{x:100,y:260} },
  2:  { viewBox:'0 0 400 300', path:'M 50,200 L 50,100 C 50,60 80,40 120,40 L 250,40 C 280,40 300,60 300,80 L 300,120 C 300,140 320,150 340,140 L 370,120 C 380,115 390,130 380,145 L 340,200 C 330,220 300,230 280,220 L 200,180 C 180,170 160,180 160,200 L 160,240 C 160,260 140,270 120,260 L 70,230 C 55,220 50,210 50,200 Z', drs:[{x1:50,y1:200,x2:50,y2:100}], start:{x:50,y:180} },
  3:  { viewBox:'0 0 400 300', path:'M 60,180 C 40,140 50,80 100,50 C 150,20 220,30 260,70 C 280,90 260,130 230,140 C 200,150 180,170 200,200 C 220,230 280,240 320,220 C 360,200 380,150 360,110 C 340,70 300,60 280,80 L 260,70 C 300,30 370,40 390,100 C 410,160 380,240 320,260 C 260,280 180,270 140,240 C 100,210 80,220 60,180 Z', drs:[{x1:60,y1:180,x2:100,y2:50}], start:{x:80,y:200} },
  8:  { viewBox:'0 0 400 300', path:'M 40,200 L 40,100 C 40,70 60,50 90,50 L 300,50 C 330,50 350,70 350,100 L 350,130 C 350,150 340,160 320,160 L 200,160 C 180,160 170,170 170,190 L 170,240 C 170,260 150,270 130,260 L 60,220 C 45,215 40,210 40,200 Z', drs:[], start:{x:40,y:180} },
  11: { viewBox:'0 0 400 300', path:'M 100,260 L 40,200 C 25,185 30,160 50,150 L 120,120 C 140,110 150,90 140,70 L 130,50 C 125,35 140,25 160,30 L 280,60 C 300,65 320,55 330,40 C 340,25 360,25 370,40 L 380,80 C 385,100 370,120 350,120 L 300,130 C 280,135 270,150 280,170 L 320,240 C 330,260 310,280 290,270 L 200,230 C 180,220 160,230 150,250 L 140,260 C 130,275 110,275 100,260 Z', drs:[{x1:100,y1:260,x2:40,y2:200},{x1:280,y1:170,x2:320,y2:240}], start:{x:120,y:260} },
  15: { viewBox:'0 0 400 300', path:'M 80,260 L 60,80 C 55,50 80,30 110,35 L 300,60 C 330,65 350,90 340,120 L 320,180 C 310,210 330,240 350,240 C 370,240 380,220 370,200 L 360,160 C 355,140 365,120 380,120 C 395,120 400,140 390,160 L 350,270 C 340,290 310,290 300,270 L 260,200 C 250,180 220,180 200,200 L 120,270 C 110,280 90,275 80,260 Z', drs:[{x1:80,y1:260,x2:60,y2:80},{x1:300,y1:270,x2:350,y2:270}], start:{x:80,y:240} },
};

export function renderCircuitSvg(round) {
  const container = document.getElementById(`circuit-svg-r${round}`);
  if (!container) return;
  const data = circuitPaths[round];
  if (!data) { container.innerHTML = '<span class="no-circuit">赛道图暂未收录</span>'; return; }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const trackColor = isDark ? '#555' : '#ccc';
  let svg = `<svg viewBox="${data.viewBox}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<path d="${data.path}" fill="none" stroke="${trackColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (const drs of data.drs) {
    svg += `<line x1="${drs.x1}" y1="${drs.y1}" x2="${drs.x2}" y2="${drs.y2}" stroke="#00cc44" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
  }
  if (data.start) {
    svg += `<circle cx="${data.start.x}" cy="${data.start.y}" r="5" fill="var(--red)"/>`;
    svg += `<text x="${data.start.x + 10}" y="${data.start.y + 4}" fill="${isDark ? '#aaa' : '#666'}" font-size="11" font-family="DM Sans">S/F</text>`;
  }
  svg += `<rect x="10" y="270" width="16" height="3" rx="1" fill="#00cc44" opacity="0.7"/>`;
  svg += `<text x="30" y="274" fill="${isDark ? '#777' : '#999'}" font-size="9" font-family="DM Sans">DRS</text>`;
  svg += `</svg>`;
  container.innerHTML = svg;
}

export function initCircuitObserver() {
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.classList?.contains('race-detail')) {
          const svgContainer = node.querySelector('[id^="circuit-svg-r"]');
          if (svgContainer) {
            const round = parseInt(svgContainer.id.replace('circuit-svg-r', ''));
            renderCircuitSvg(round);
          }
        }
      }
    }
  });
  const scheduleList = document.getElementById('schedule-list');
  if (scheduleList) observer.observe(scheduleList, { childList: true });
}
