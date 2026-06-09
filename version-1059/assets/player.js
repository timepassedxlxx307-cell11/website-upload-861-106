import { H as Hls } from "./hls-dru42stk.js";

export function setupPlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var poster = document.getElementById(config.posterId);
    var shell = document.getElementById(config.shellId);
    var loaded = false;
    var hls = null;

    var start = function () {
        if (!video || !config.source) {
            return;
        }

        if (!loaded) {
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
            } else {
                video.src = config.source;
            }
        }

        if (poster) {
            poster.classList.add("is-hidden");
        }

        video.setAttribute("controls", "controls");

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.setAttribute("controls", "controls");
            });
        }
    };

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    }

    if (poster) {
        poster.addEventListener("click", function (event) {
            event.preventDefault();
            start();
        });
    }

    if (shell) {
        shell.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
            hls.destroy();
        }
    });
}
