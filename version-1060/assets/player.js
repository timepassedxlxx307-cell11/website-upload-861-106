import { H as Hls } from './hls-dru42stk.js';

export function setupPlayer(videoUrl) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var ready = false;
  var hls = null;

  if (!video || !videoUrl) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
  }

  function start() {
    attach();
    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
