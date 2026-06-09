function initMoviePlayer(sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var hlsInstance = null;
    var started = false;

    if (!video || !sourceUrl) {
        return;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function start() {
        hideOverlay();
        if (started) {
            playVideo();
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            return;
        }
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
