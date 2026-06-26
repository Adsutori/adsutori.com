const playBtn    = document.getElementById('playBtn');
const videoThumb = document.getElementById('videoThumb');
const videoEmbed = document.getElementById('videoEmbed');

// ── Wklej tutaj swój link ──────────────────────────────
const VIDEO_SRC = 'video/intro.mp4';
// Vimeo:   'https://player.vimeo.com/video/TWOJE_ID?autoplay=1&color=ffffff'
// YouTube: 'https://www.youtube.com/embed/TWOJE_ID?autoplay=1&rel=0'
// Lokalny: 'video/krzysiek-intro.mp4'
// ──────────────────────────────────────────────────────

const isLocalVideo = !VIDEO_SRC.startsWith('http');

if (playBtn && videoEmbed) {
  playBtn.addEventListener('click', () => {

    // Ukryj thumbnail
    videoThumb.style.opacity = '0';
    videoThumb.style.pointerEvents = 'none';

    // Pokaż kontener
    videoEmbed.removeAttribute('hidden');

    // Guard — nie twórz drugiego elementu jeśli już istnieje
    if (videoEmbed.querySelector('video, iframe')) return;

    if (isLocalVideo) {
      const video = document.createElement('video');
      video.src = VIDEO_SRC;
      video.autoplay = true;
      video.controls = true;
      video.playsinline = true;
      video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      videoEmbed.appendChild(video);
      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    } else {
      const iframe = document.createElement('iframe');
      iframe.src = VIDEO_SRC;
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
      videoEmbed.appendChild(iframe);
    }

  });
}


