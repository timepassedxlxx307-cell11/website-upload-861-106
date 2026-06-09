import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const button = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
  });
}

function initHeroCarousel() {
  const carousel = $('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = $$('.hero-slide', carousel);
  const dots = $$('.hero-dot', carousel);
  let index = 0;
  let timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startAutoPlay() {
    if (slides.length < 2) {
      return;
    }

    stopAutoPlay();
    timer = window.setInterval(() => showSlide(index + 1), 5600);
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const nextIndex = Number(dot.dataset.slideTo || 0);
      showSlide(nextIndex);
      startAutoPlay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);
  showSlide(0);
  startAutoPlay();
}

function initFilters() {
  const panel = $('[data-filter-panel]');

  if (!panel) {
    return;
  }

  const input = $('[data-filter-input]', panel);
  const regionSelect = $('[data-filter-region]', panel);
  const yearSelect = $('[data-filter-year]', panel);
  const genreSelect = $('[data-filter-genre]', panel);
  const resultCount = $('[data-result-count]', panel);
  const cards = $$('[data-movie-card]');
  const grid = $('[data-grid-view]') || $('.full-ranking-list');
  const viewButtons = $$('[data-view]', panel);

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  if (query && input) {
    input.value = query;
  }

  function normalized(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matchesSelect(selected, rawValue) {
    if (!selected || selected.startsWith('全部')) {
      return true;
    }

    return normalized(rawValue).includes(normalized(selected));
  }

  function applyFilters() {
    const keyword = normalized(input ? input.value : '');
    const region = regionSelect ? regionSelect.value : '';
    const year = yearSelect ? yearSelect.value : '';
    const genre = genreSelect ? genreSelect.value : '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = normalized([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.category,
      ].join(' '));

      const isVisible = (!keyword || haystack.includes(keyword))
        && matchesSelect(region, card.dataset.region)
        && matchesSelect(year, card.dataset.year)
        && matchesSelect(genre, card.dataset.genre);

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = String(visibleCount);
    }
  }

  [input, regionSelect, yearSelect, genreSelect].filter(Boolean).forEach((control) => {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      viewButtons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');

      if (grid) {
        grid.classList.toggle('is-list-view', button.dataset.view === 'list');
      }
    });
  });

  applyFilters();
}

function initHlsPlayer() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-play-button]');

    if (!button) {
      return;
    }

    const shell = button.closest('[data-player-shell]');
    const video = shell ? $('video', shell) : null;

    if (!shell || !video) {
      return;
    }

    const source = video.dataset.src;

    if (!source) {
      shell.classList.add('is-playing');
      return;
    }

    shell.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }

      video.play().catch(() => {
        shell.classList.remove('is-playing');
      });
      return;
    }

    if (Hls && Hls.isSupported()) {
      if (!video.__hlsInstance) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {
            shell.classList.remove('is-playing');
          });
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video.__hlsInstance = null;
              shell.classList.remove('is-playing');
            }
          }
        });

        video.__hlsInstance = hls;
      } else {
        video.play().catch(() => {
          shell.classList.remove('is-playing');
        });
      }
    }
  });
}

function initBackToTop() {
  const button = $('[data-back-to-top]');

  if (!button) {
    return;
  }

  window.addEventListener('scroll', () => {
    button.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

initMobileMenu();
initHeroCarousel();
initFilters();
initHlsPlayer();
initBackToTop();
