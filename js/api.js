// ─── API WRAPPER WITH CACHING ──────────────────────────────────────────────

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';
const METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

const CACHE_TTL_JOLPICA = 5 * 60 * 1000;   // 5 minutes
const CACHE_TTL_METEO = 30 * 60 * 1000;     // 30 minutes

const memCache = {};

function cacheKey(prefix, ...args) {
  return `${prefix}:${args.join(':')}`;
}

function getCached(key, ttl) {
  const entry = memCache[key];
  if (entry && (Date.now() - entry.ts < ttl)) return entry.data;
  return null;
}

function setCache(key, data) {
  memCache[key] = { data, ts: Date.now() };
}

function getLSCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function setLSCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Jolpica (Ergast) API ──────────────────────────────────────────────────

export async function getDriverStandings(year = 2026) {
  const key = cacheKey('driverStandings', year);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/driverStandings.json`);
  const list = json.MRData?.StandingsTable?.StandingsLists?.[0];
  if (list) { setCache(key, list); return list; }
  return null;
}

export async function getConstructorStandings(year = 2026) {
  const key = cacheKey('constructorStandings', year);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/constructorStandings.json`);
  const list = json.MRData?.StandingsTable?.StandingsLists?.[0];
  if (list) { setCache(key, list); return list; }
  return null;
}

export async function getRaceResults(year = 2026, round) {
  const key = cacheKey('raceResults', year, round);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/${round}/results.json`);
  const races = json.MRData?.RaceTable?.Races;
  const data = races?.[0]?.Results || null;
  if (data) setCache(key, data);
  return data;
}

export async function getQualifyingResults(year = 2026, round) {
  const key = cacheKey('qualifyingResults', year, round);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/${round}/qualifying.json`);
  const races = json.MRData?.RaceTable?.Races;
  const data = races?.[0]?.QualifyingResults || null;
  if (data) setCache(key, data);
  return data;
}

export async function getSprintResults(year = 2026, round) {
  const key = cacheKey('sprintResults', year, round);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/${round}/sprint.json`);
  const races = json.MRData?.RaceTable?.Races;
  const data = races?.[0]?.SprintResults || null;
  if (data) setCache(key, data);
  return data;
}

export async function getRaceSchedule(year = 2026, round) {
  const key = cacheKey('raceSchedule', year, round);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/${round}.json`);
  const race = json.MRData?.RaceTable?.Races?.[0] || null;
  if (race) setCache(key, race);
  return race;
}

export async function getSeasonSchedule(year = 2026) {
  const key = cacheKey('seasonSchedule', year);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}.json`);
  const races = json.MRData?.RaceTable?.Races || [];
  setCache(key, races);
  return races;
}

export async function getAllResults(year = 2026) {
  const key = cacheKey('allResults', year);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/results.json?limit=1000`);
  const races = json.MRData?.RaceTable?.Races || [];
  setCache(key, races);
  return races;
}

export async function getAllSprintResults(year = 2026) {
  const key = cacheKey('allSprintResults', year);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/sprint.json?limit=1000`);
  const races = json.MRData?.RaceTable?.Races || [];
  setCache(key, races);
  return races;
}

export async function getDriverResults(year = 2026, driverId) {
  const key = cacheKey('driverResults', year, driverId);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/drivers/${driverId}/results.json?limit=100`);
  const races = json.MRData?.RaceTable?.Races || [];
  setCache(key, races);
  return races;
}

export async function getDriverSprintResults(year = 2026, driverId) {
  const key = cacheKey('driverSprintResults', year, driverId);
  const cached = getCached(key, CACHE_TTL_JOLPICA);
  if (cached) return cached;
  const json = await fetchJSON(`${JOLPICA_BASE}/${year}/drivers/${driverId}/sprint.json?limit=100`);
  const races = json.MRData?.RaceTable?.Races || [];
  setCache(key, races);
  return races;
}

// ─── OpenF1 API ────────────────────────────────────────────────────────────

export async function getLatestSession() {
  const json = await fetchJSON(`${OPENF1_BASE}/sessions?session_key=latest`);
  return json?.[0] || null;
}

export async function getLivePositions(sessionKey) {
  const json = await fetchJSON(`${OPENF1_BASE}/position?session_key=${sessionKey}`);
  return json || [];
}

export async function getLiveLaps(sessionKey) {
  const json = await fetchJSON(`${OPENF1_BASE}/laps?session_key=${sessionKey}`);
  return json || [];
}

export async function getLiveIntervals(sessionKey) {
  const json = await fetchJSON(`${OPENF1_BASE}/intervals?session_key=${sessionKey}`);
  return json || [];
}

export async function getLocationData(sessionKey, driverNumber) {
  const lsKey = `openf1:location:${sessionKey}:${driverNumber}`;
  const cached = getLSCache(lsKey);
  if (cached) return cached;
  const json = await fetchJSON(`${OPENF1_BASE}/location?session_key=${sessionKey}&driver_number=${driverNumber}`);
  const data = json || [];
  if (data.length) setLSCache(lsKey, data);
  return data;
}

// ─── Open-Meteo API ────────────────────────────────────────────────────────

export async function getWeatherForecast(lat, lng) {
  const key = cacheKey('weather', lat, lng);
  const cached = getCached(key, CACHE_TTL_METEO);
  if (cached) return cached;
  const url = `${METEO_BASE}?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto&forecast_days=14`;
  const json = await fetchJSON(url);
  setCache(key, json);
  return json;
}

// ─── CACHE MANAGEMENT ──────────────────────────────────────────────────────

export function clearCache() {
  Object.keys(memCache).forEach(k => delete memCache[k]);
}
