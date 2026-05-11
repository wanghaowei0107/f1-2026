// ─── ONBOARD CAMERA ──────────────────────────────────────────────────────────
// Embeds F1 official YouTube live stream for onboard cameras.
// Since OpenF1 does not provide video URLs, we embed the official F1 YouTube channel.

// F1 YouTube channel ID for live streams
const F1_YT_CHANNEL = 'UCB_qr75-ydFVKSF9Dmo6izg'; // Formula 1 official channel

export function initOnboard() {
  // Wire up global function for HTML onclick
  window.showOnboard = showOnboard;
}

export function showOnboard(container, meetingName) {
  if (!container) return;

  // Check if already showing
  if (container.querySelector('.onboard-container')) {
    container.querySelector('.onboard-container').remove();
    return;
  }

  const div = document.createElement('div');
  div.className = 'onboard-container';
  div.innerHTML = `
    <div class="onboard-header">
      <span class="detail-label">车载摄像头</span>
      <span class="onboard-status"><span class="live-dot"></span> LIVE</span>
    </div>
    <div class="onboard-video">
      <iframe
        src="https://www.youtube.com/embed?listType=channel&list=${F1_YT_CHANNEL}&autoplay=0"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
    <div class="onboard-note">仅在比赛进行时可用 - 直播来自 F1 官方 YouTube 频道</div>
  `;

  container.appendChild(div);
}

export function showOnboardDirect(containerEl, videoId) {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div class="onboard-container">
      <div class="onboard-header">
        <span class="detail-label">车载摄像头</span>
        <span class="onboard-status"><span class="live-dot"></span> LIVE</span>
      </div>
      <div class="onboard-video">
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=0"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <div class="onboard-note">仅在比赛进行时可用</div>
    </div>
  `;
}
