// ─── RACE DATA ──────────────────────────────────────────────────────────────
export const races = [
  { r:1,  name:'澳大利亚大奖赛',       flag:'🇦🇺', date:'2026-03-08', end:'2026-03-08', sprint:false, cancelled:false },
  { r:2,  name:'中国大奖赛',           flag:'🇨🇳', date:'2026-03-13', end:'2026-03-15', sprint:true,  cancelled:false },
  { r:3,  name:'日本大奖赛',           flag:'🇯🇵', date:'2026-03-27', end:'2026-03-29', sprint:false, cancelled:false },
  { r:4,  name:'巴林大奖赛',           flag:'🇧🇭', date:'2026-04-12', end:'2026-04-12', sprint:false, cancelled:true  },
  { r:5,  name:'沙特阿拉伯大奖赛',     flag:'🇸🇦', date:'2026-04-19', end:'2026-04-19', sprint:false, cancelled:true  },
  { r:6,  name:'迈阿密大奖赛',         flag:'🇺🇸', date:'2026-05-01', end:'2026-05-03', sprint:true,  cancelled:false },
  { r:7,  name:'加拿大大奖赛',         flag:'🇨🇦', date:'2026-05-22', end:'2026-05-24', sprint:true,  cancelled:false },
  { r:8,  name:'摩纳哥大奖赛',         flag:'🇲🇨', date:'2026-06-05', end:'2026-06-07', sprint:false, cancelled:false },
  { r:9,  name:'巴塞罗那大奖赛',       flag:'🇪🇸', date:'2026-06-12', end:'2026-06-14', sprint:false, cancelled:false },
  { r:10, name:'奥地利大奖赛',         flag:'🇦🇹', date:'2026-06-26', end:'2026-06-28', sprint:false, cancelled:false },
  { r:11, name:'英国大奖赛',           flag:'🇬🇧', date:'2026-07-03', end:'2026-07-05', sprint:true,  cancelled:false },
  { r:12, name:'比利时大奖赛',         flag:'🇧🇪', date:'2026-07-17', end:'2026-07-19', sprint:false, cancelled:false },
  { r:13, name:'匈牙利大奖赛',         flag:'🇭🇺', date:'2026-07-24', end:'2026-07-26', sprint:false, cancelled:false },
  { r:14, name:'荷兰大奖赛',           flag:'🇳🇱', date:'2026-08-21', end:'2026-08-23', sprint:true,  cancelled:false },
  { r:15, name:'意大利大奖赛',         flag:'🇮🇹', date:'2026-09-04', end:'2026-09-06', sprint:false, cancelled:false },
  { r:16, name:'西班牙大奖赛(马德里)', flag:'🇪🇸', date:'2026-09-11', end:'2026-09-13', sprint:false, cancelled:false },
  { r:17, name:'阿塞拜疆大奖赛',       flag:'🇦🇿', date:'2026-09-25', end:'2026-09-27', sprint:false, cancelled:false },
  { r:18, name:'新加坡大奖赛',         flag:'🇸🇬', date:'2026-10-02', end:'2026-10-04', sprint:true,  cancelled:false },
  { r:19, name:'美国大奖赛',           flag:'🇺🇸', date:'2026-10-16', end:'2026-10-18', sprint:false, cancelled:false },
  { r:20, name:'墨西哥大奖赛',         flag:'🇲🇽', date:'2026-10-23', end:'2026-10-25', sprint:false, cancelled:false },
  { r:21, name:'巴西大奖赛',           flag:'🇧🇷', date:'2026-10-30', end:'2026-11-01', sprint:false, cancelled:false },
  { r:22, name:'拉斯维加斯大奖赛',     flag:'🇺🇸', date:'2026-11-21', end:'2026-11-21', sprint:false, cancelled:false },
  { r:23, name:'卡塔尔大奖赛',         flag:'🇶🇦', date:'2026-11-27', end:'2026-11-29', sprint:false, cancelled:false },
  { r:24, name:'阿布扎比大奖赛',       flag:'🇦🇪', date:'2026-12-04', end:'2026-12-06', sprint:false, cancelled:false },
];

// ─── TEAM COLORS ────────────────────────────────────────────────────────────
export const teamColors = {
  'Mercedes': '#00D2BE', 'Ferrari': '#E8002D', 'McLaren': '#FF8000',
  'Red Bull': '#3671C6', 'Haas': '#B6BABD', 'Alpine': '#0093CC',
  'Racing Bulls': '#6692FF', 'Audi': '#BB9966', 'Williams': '#00A3E0',
  'Aston Martin': '#358C75', 'Cadillac': '#CC0000',
};

export function teamColor(name) {
  for (const k in teamColors) if (name && name.includes(k)) return teamColors[k];
  return '#888';
}

// ─── CIRCUIT DATA ──────────────────────────────────────────────────────────
export const circuitInfo = {
  1:  { circuit:'Albert Park Grand Prix Circuit', city:'Melbourne', laps:58, length:'5.278 km', lat:-37.8497, lng:144.9680 },
  2:  { circuit:'Shanghai International Circuit', city:'Shanghai', laps:56, length:'5.451 km', lat:31.3389, lng:121.2197 },
  3:  { circuit:'Suzuka International Racing Course', city:'Suzuka', laps:53, length:'5.807 km', lat:34.8431, lng:136.5407 },
  4:  { circuit:'Bahrain International Circuit', city:'Sakhir', laps:57, length:'5.412 km', lat:26.0325, lng:50.5106 },
  5:  { circuit:'Jeddah Corniche Circuit', city:'Jeddah', laps:50, length:'6.174 km', lat:21.6319, lng:39.1044 },
  6:  { circuit:'Miami International Autodrome', city:'Miami', laps:57, length:'5.412 km', lat:25.9581, lng:-80.2389 },
  7:  { circuit:'Circuit Gilles Villeneuve', city:'Montreal', laps:70, length:'4.361 km', lat:45.5000, lng:-73.5228 },
  8:  { circuit:'Circuit de Monaco', city:'Monte Carlo', laps:78, length:'3.337 km', lat:43.7347, lng:7.4206 },
  9:  { circuit:'Circuit de Barcelona-Catalunya', city:'Barcelona', laps:66, length:'4.657 km', lat:41.5700, lng:2.2611 },
  10: { circuit:'Red Bull Ring', city:'Spielberg', laps:71, length:'4.318 km', lat:47.2197, lng:14.7647 },
  11: { circuit:'Silverstone Circuit', city:'Silverstone', laps:52, length:'5.891 km', lat:52.0786, lng:-1.0169 },
  12: { circuit:'Circuit de Spa-Francorchamps', city:'Spa', laps:44, length:'7.004 km', lat:50.4372, lng:5.9714 },
  13: { circuit:'Hungaroring', city:'Budapest', laps:70, length:'4.381 km', lat:47.5789, lng:19.2486 },
  14: { circuit:'Circuit Zandvoort', city:'Zandvoort', laps:72, length:'4.259 km', lat:52.3888, lng:4.5409 },
  15: { circuit:'Autodromo Nazionale di Monza', city:'Monza', laps:53, length:'5.793 km', lat:45.6156, lng:9.2811 },
  16: { circuit:'Madrid Street Circuit', city:'Madrid', laps:66, length:'5.473 km', lat:40.4168, lng:-3.7038 },
  17: { circuit:'Baku City Circuit', city:'Baku', laps:51, length:'6.003 km', lat:40.3725, lng:49.8533 },
  18: { circuit:'Marina Bay Street Circuit', city:'Singapore', laps:62, length:'4.940 km', lat:1.2914, lng:103.8640 },
  19: { circuit:'Circuit of the Americas', city:'Austin', laps:56, length:'5.513 km', lat:30.1328, lng:-97.6411 },
  20: { circuit:'Autódromo Hermanos Rodríguez', city:'Mexico City', laps:71, length:'4.304 km', lat:19.4042, lng:-99.0907 },
  21: { circuit:'Autódromo José Carlos Pace', city:'São Paulo', laps:71, length:'4.309 km', lat:-23.7036, lng:-46.6997 },
  22: { circuit:'Las Vegas Strip Circuit', city:'Las Vegas', laps:50, length:'6.201 km', lat:36.1147, lng:-115.1728 },
  23: { circuit:'Lusail International Circuit', city:'Lusail', laps:57, length:'5.419 km', lat:25.4900, lng:51.4542 },
  24: { circuit:'Yas Marina Circuit', city:'Abu Dhabi', laps:58, length:'5.281 km', lat:24.4672, lng:54.6031 },
};

// ─── DRIVER FLAGS ──────────────────────────────────────────────────────────
export function driverFlag(nat) {
  const map = {
    'Italian':'🇮🇹','British':'🇬🇧','Monegasque':'🇲🇨','Australian':'🇦🇺',
    'Dutch':'🇳🇱','French':'🇫🇷','Spanish':'🇪🇸','German':'🇩🇪',
    'Finnish':'🇫🇮','Mexican':'🇲🇽','Canadian':'🇨🇦','Japanese':'🇯🇵',
    'Chinese':'🇨🇳','American':'🇺🇸','Brazilian':'🇧🇷','Danish':'🇩🇰',
    'Thai':'🇹🇭','New Zealander':'🇳🇿','Argentine':'🇦🇷','Swiss':'🇨🇭',
    'Swedish':'🇸🇪',
  };
  return map[nat] || '🏁';
}

// ─── POSITION CLASS ────────────────────────────────────────────────────────
export function posClass(p) {
  return p === 1 ? 'gold' : p === 2 ? 'silver' : p === 3 ? 'bronze' : '';
}

// ─── WEATHER ICONS (WMO codes) ─────────────────────────────────────────────
export const weatherIcons = {
  0: '☀️',   // Clear sky
  1: '🌤️',  // Mainly clear
  2: '⛅',   // Partly cloudy
  3: '☁️',   // Overcast
  45: '🌫️', // Fog
  48: '🌫️', // Depositing rime fog
  51: '🌦️', // Light drizzle
  53: '🌦️', // Moderate drizzle
  55: '🌧️', // Dense drizzle
  56: '🌧️', // Light freezing drizzle
  57: '🌧️', // Dense freezing drizzle
  61: '🌧️', // Slight rain
  63: '🌧️', // Moderate rain
  65: '🌧️', // Heavy rain
  66: '🌧️', // Light freezing rain
  67: '🌧️', // Heavy freezing rain
  71: '🌨️', // Slight snow
  73: '🌨️', // Moderate snow
  75: '🌨️', // Heavy snow
  77: '🌨️', // Snow grains
  80: '🌦️', // Slight rain showers
  81: '🌧️', // Moderate rain showers
  82: '🌧️', // Violent rain showers
  85: '🌨️', // Slight snow showers
  86: '🌨️', // Heavy snow showers
  95: '⛈️', // Thunderstorm
  96: '⛈️', // Thunderstorm with slight hail
  99: '⛈️', // Thunderstorm with heavy hail
};

export function weatherIcon(wmoCode) {
  return weatherIcons[wmoCode] || '❓';
}
