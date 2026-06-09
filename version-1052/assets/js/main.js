(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function prepareHeader() {
        var header = document.querySelector("[data-header]");
        if (!header) {
            return;
        }
        var update = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function prepareMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function prepareHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            window.clearInterval(timer);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                stop();
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function prepareCategoryFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var input = document.querySelector("[data-category-search]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length || (!input && !chips.length)) {
            return;
        }
        var selected = "";
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var search = card.getAttribute("data-search") || "";
                var genre = (card.getAttribute("data-genre") || "").toLowerCase();
                var matchedQuery = !query || search.indexOf(query) !== -1;
                var matchedGenre = !selected || genre.indexOf(selected) !== -1 || search.indexOf(selected) !== -1;
                var matched = matchedQuery && matchedGenre;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                selected = chip.getAttribute("data-value") || "";
                apply();
            });
        });
        apply();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function cardTemplate(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-shade\"></span>",
            "<span class=\"play-mark\">▶</span>",
            "</a>",
            "<div class=\"movie-info\">",
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"tag-row\">" + (movie.tags || []).slice(0, 3).map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function prepareSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var input = document.querySelector("[data-search-input]");
        var form = document.querySelector("[data-search-form]");
        var more = document.querySelector("[data-load-more]");
        if (!results || !summary || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim();
        var pageSize = 60;
        var shown = 0;
        var matched = [];
        if (input) {
            input.value = keyword;
        }
        function normalize(value) {
            return String(value || "").toLowerCase();
        }
        function findMovies(value) {
            var q = normalize(value).trim();
            if (!q) {
                return [];
            }
            return window.SEARCH_MOVIES.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" ")).indexOf(q) !== -1;
            });
        }
        function render(reset) {
            if (reset) {
                shown = 0;
                results.innerHTML = "";
            }
            var next = matched.slice(shown, shown + pageSize);
            results.insertAdjacentHTML("beforeend", next.map(cardTemplate).join(""));
            shown += next.length;
            more.classList.toggle("is-visible", shown < matched.length);
        }
        function run(value) {
            keyword = (value || "").trim();
            matched = findMovies(keyword);
            if (!keyword) {
                summary.textContent = "输入关键词开始搜索";
                results.innerHTML = "";
                more.classList.remove("is-visible");
                return;
            }
            summary.textContent = matched.length ? "为你找到 " + matched.length + " 部相关影片" : "没有找到相关影片";
            render(true);
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input ? input.value.trim() : "";
                var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
                window.history.replaceState(null, "", url);
                run(value);
            });
        }
        if (more) {
            more.addEventListener("click", function () {
                render(false);
            });
        }
        run(keyword);
    }

    ready(function () {
        prepareHeader();
        prepareMobileMenu();
        prepareHeroCarousel();
        prepareCategoryFilters();
        prepareSearchPage();
    });
}());
