(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        document.querySelectorAll(".menu-toggle").forEach(function (button) {
            button.addEventListener("click", function () {
                var panel = document.querySelector(".mobile-panel");
                if (panel) {
                    panel.classList.toggle("is-open");
                }
            });
        });

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector(".page-filter-input");
            var list = panel.parentElement.querySelector(".filter-list");
            var empty = panel.parentElement.querySelector(".empty-state");
            var activeKind = "all";
            var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
            if (input && urlQuery) {
                input.value = urlQuery;
            }

            function update() {
                if (!list) {
                    return;
                }
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                list.querySelectorAll(".movie-card").forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var kind = card.getAttribute("data-kind") || "";
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchKind = activeKind === "all" || kind.indexOf(activeKind) !== -1;
                    var keep = matchQuery && matchKind;
                    card.style.display = keep ? "" : "none";
                    if (keep) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", update);
            }
            panel.querySelectorAll("[data-filter-kind]").forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeKind = chip.getAttribute("data-filter-kind") || "all";
                    panel.querySelectorAll("[data-filter-kind]").forEach(function (item) {
                        item.classList.toggle("active", item === chip);
                    });
                    update();
                });
            });
            update();
        });
    });
})();
