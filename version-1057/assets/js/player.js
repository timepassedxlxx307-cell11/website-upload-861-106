(function () {
    window.initMoviePlayer = function (videoId, buttonId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !url) {
            return;
        }

        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
            video.setAttribute("data-ready", "1");
        }

        function play() {
            attach();
            button.classList.add("is-hidden");
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };
})();
