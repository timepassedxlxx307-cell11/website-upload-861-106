(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function startPlayer(video, overlay, streamUrl) {
        var started = false;
        var hls = null;

        function play() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        function attach() {
            if (started) {
                play();
                return;
            }
            started = true;
            overlay.classList.add('is-hidden');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    play();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        video.src = streamUrl;
                        play();
                    }
                });
                return;
            }

            video.src = streamUrl;
            play();
        }

        overlay.addEventListener('click', attach);
        video.addEventListener('click', function () {
            if (!started) {
                attach();
            }
        });
    }

    window.MoviePlayer = {
        start: function (videoId, overlayId, streamUrl) {
            ready(function () {
                var video = document.getElementById(videoId);
                var overlay = document.getElementById(overlayId);
                if (video && overlay && streamUrl) {
                    startPlayer(video, overlay, streamUrl);
                }
            });
        }
    };
}());
