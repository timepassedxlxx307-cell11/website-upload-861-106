(function () {
    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupCarousel() {
        var root = document.querySelector('[data-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-dot]'));
        var next = root.querySelector('[data-carousel-next]');
        var prev = root.querySelector('[data-carousel-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var type = scope.querySelector('[data-filter-type]');
            var year = scope.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var empty = scope.querySelector('[data-no-results]');

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var typeValue = normalize(type ? type.value : '');
                var yearValue = normalize(year ? year.value : '');
                var visible = 0;

                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var ok = true;

                    if (keyword && searchText.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        ok = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        ok = false;
                    }

                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupCarousel();
        setupFilters();
    });
}());
