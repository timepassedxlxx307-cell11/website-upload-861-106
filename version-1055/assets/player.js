(function () {
    var config = window.MoviePlayerConfig || {};
    var video = document.querySelector('[data-player-video]');
    var playButton = document.querySelector('[data-player-play]');
    var stream = config.stream || '';
    var hlsInstance = null;
    var initialized = false;

    function bindStream() {
        if (!video || !stream || initialized) {
            return;
        }

        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hlsInstance) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        destroyHls();
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else {
            video.src = stream;
        }
    }

    function destroyHls() {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    }

    function startPlayback() {
        if (!video) {
            return;
        }

        bindStream();

        if (playButton) {
            playButton.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (playButton) {
                    playButton.classList.remove('is-hidden');
                }
            });
        }
    }

    if (video) {
        bindStream();
        video.addEventListener('play', function () {
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        });
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }

    window.addEventListener('beforeunload', destroyHls);
})();
