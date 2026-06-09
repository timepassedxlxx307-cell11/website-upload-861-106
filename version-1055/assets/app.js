(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchScope = document.querySelector('[data-search-scope]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));

    if (searchInput && searchScope) {
        var cards = Array.prototype.slice.call(searchScope.querySelectorAll('[data-search-card]'));
        var activeChip = '';

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filterCards() {
            var query = normalize(searchInput.value);
            var chip = normalize(activeChip);

            cards.forEach(function (card) {
                var keywords = normalize(card.getAttribute('data-keywords'));
                var matchesQuery = !query || keywords.indexOf(query) !== -1;
                var matchesChip = !chip || keywords.indexOf(chip) !== -1;
                card.hidden = !(matchesQuery && matchesChip);
            });
        }

        searchInput.addEventListener('input', filterCards);

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter-chip') || '';
                activeChip = activeChip === value ? '' : value;

                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button && activeChip === value);
                });

                filterCards();
            });
        });
    }
})();
