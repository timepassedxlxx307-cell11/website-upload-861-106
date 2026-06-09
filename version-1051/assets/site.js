(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
        initSearchPage();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var section = input.closest("section") || document;
            var items = Array.prototype.slice.call(section.querySelectorAll("[data-filter-item]"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                items.forEach(function (item) {
                    var text = [
                        item.getAttribute("data-title") || "",
                        item.getAttribute("data-region") || "",
                        item.getAttribute("data-genre") || "",
                        item.getAttribute("data-tags") || "",
                        item.textContent || ""
                    ].join(" ").toLowerCase();
                    item.classList.toggle("is-hidden", Boolean(query) && text.indexOf(query) === -1);
                });
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector(".player-cover");
            if (!video || !button) {
                return;
            }
            var streamUrl = video.getAttribute("data-stream");
            var connected = false;
            function connect() {
                if (connected || !streamUrl) {
                    return;
                }
                connected = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
            function play() {
                connect();
                button.classList.add("is-hidden");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    function initSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !input || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function createCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "<article class=\"movie-card\">" +
                "<a class=\"poster-link\" href=\"" + escapeHtml(movie.page) + "\">" +
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                "<span class=\"poster-shade\"></span>" +
                "<span class=\"play-chip\">立即观看</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                "<div class=\"movie-card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
                "<h3><a href=\"" + escapeHtml(movie.page) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                "<p>" + escapeHtml(movie.oneLine || movie.genre || "") + "</p>" +
                "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
                "</article>";
        }
        function render() {
            var query = input.value.trim().toLowerCase();
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                if (!query) {
                    return true;
                }
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
                return text.indexOf(query) !== -1;
            }).slice(0, 120);
            results.innerHTML = list.length ? list.map(createCard).join("") : "<div class=\"empty-state\">没有找到匹配的影片</div>";
        }
        var form = input.closest("form");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var nextUrl = input.value.trim() ? "search.html?q=" + encodeURIComponent(input.value.trim()) : "search.html";
                window.history.replaceState(null, "", nextUrl);
                render();
            });
        }
        input.addEventListener("input", render);
        render();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
