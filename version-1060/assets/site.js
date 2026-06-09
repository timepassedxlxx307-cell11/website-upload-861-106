(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');

  if (filterInput) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = item.getAttribute('data-filter-text') || '';
        item.hidden = keyword !== '' && text.indexOf(keyword) === -1;
      });
    });
  }
})();
