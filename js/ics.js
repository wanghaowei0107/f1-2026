import { races, circuitInfo } from './data.js';

export function exportICS() {
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//F1 2026//CN\r\nCALSCALE:GREGORIAN\r\n';
  races.forEach(rc => {
    if (rc.cancelled) return;
    const start = rc.date.replace(/-/g, '');
    const endD = new Date(rc.end);
    endD.setDate(endD.getDate() + 1);
    const end = endD.toISOString().slice(0,10).replace(/-/g, '');
    ics += `BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\n`;
    ics += `SUMMARY:F1 R${rc.r} ${rc.name}${rc.sprint ? ' (冲刺周末)' : ''}\r\n`;
    const ci = circuitInfo[rc.r];
    if (ci) ics += `LOCATION:${ci.circuit}, ${ci.city}\r\n`;
    ics += `END:VEVENT\r\n`;
  });
  ics += 'END:VCALENDAR\r\n';
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'F1-2026-Calendar.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}
