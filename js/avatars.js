// ─── DRIVER AVATARS ────────────────────────────────────────────────────────
// Headshots come from OpenF1's /drivers endpoint (official media.formula1.com
// images). One fetch builds two lookup maps so every consumer reads synchronously:
//   - byCode:   Jolpica Driver.code (e.g. "VER") → headshot URL
//   - byNumber: OpenF1 driver_number (e.g. 1)    → headshot URL  (for LIVE table)
// On any failure the maps stay empty and callers fall back to flag emoji.

import { esc } from './data.js';

const OPENF1_DRIVERS = 'https://api.openf1.org/v1/drivers?session_key=latest';
const LS_KEY = 'f1-avatars';
const TTL = 24 * 60 * 60 * 1000; // 24h — headshots rarely change

let byCode = {};
let byNumber = {};
let loaded = false;

function hydrateFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || (Date.now() - parsed.ts > TTL)) return false;
    byCode = parsed.byCode || {};
    byNumber = parsed.byNumber || {};
    return Object.keys(byCode).length > 0;
  } catch (e) {
    return false;
  }
}

function persistToLS() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), byCode, byNumber }));
  } catch (e) { /* quota / private mode — ignore */ }
}

export async function loadDriverAvatars() {
  if (loaded) return byCode;

  // Warm start from localStorage so the first paint can use cached headshots.
  if (hydrateFromLS()) {
    loaded = true;
    // Still refresh in the background to pick up mid-season driver changes.
    refreshFromNetwork();
    return byCode;
  }

  await refreshFromNetwork();
  loaded = true;
  return byCode;
}

async function refreshFromNetwork() {
  try {
    const res = await fetch(OPENF1_DRIVERS);
    if (!res.ok) return;
    const drivers = await res.json();
    if (!Array.isArray(drivers)) return;

    const nextCode = {};
    const nextNumber = {};
    for (const d of drivers) {
      const url = d.headshot_url;
      // Note: these URLs legitimately contain the literal "d_driver_fallback_image.png"
      // — that's a Cloudinary default-image *parameter*, not a sign of a missing photo.
      // The real headshot follows it; don't filter on "fallback". onerror handles the
      // rare case where the image genuinely 404s.
      if (!url) continue;
      if (d.name_acronym) nextCode[d.name_acronym] = url;
      if (d.driver_number != null) nextNumber[d.driver_number] = url;
    }

    if (Object.keys(nextCode).length) {
      byCode = nextCode;
      byNumber = nextNumber;
      persistToLS();
    }
  } catch (e) {
    /* OpenF1 unavailable — keep whatever we have (possibly empty) */
  }
}

export function driverHeadshot(code) {
  return code ? (byCode[code] || null) : null;
}

export function driverHeadshotByNumber(num) {
  return num != null ? (byNumber[num] || null) : null;
}

// Build an <img> that swaps to `fallbackHtml` if the headshot fails to load.
// The inline onerror replaces the <img>'s parent contents once, then clears
// itself to avoid loops. `cls` selects the size variant (.av-sm / .av-lg etc).
export function avatarImg(url, fallbackHtml, cls = '') {
  if (!url) return fallbackHtml;
  const safeUrl = esc(url);
  const safeFallback = String(fallbackHtml).replace(/"/g, '&quot;');
  return `<img src="${safeUrl}" class="avatar ${cls}" loading="lazy" alt=""
    onerror="this.outerHTML=this.dataset.fb" data-fb="${safeFallback}">`;
}
