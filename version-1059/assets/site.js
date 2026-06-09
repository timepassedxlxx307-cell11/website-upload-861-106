document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
                dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        showSlide(0);

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }
});
