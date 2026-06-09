import { H as Hls } from './hls-vendor-dru42stk.js';

const select = (selector, parent = document) => parent.querySelector(selector);
const selectAll = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function initMenu() {
  const button = select('.menu-button');
  const nav = select('.mobile-nav');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function initHero() {
  const hero = select('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = selectAll('[data-hero-slide]', hero);
  const dots = selectAll('[data-hero-dot]', hero);
  if (slides.length === 0) {
    return;
  }
  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.heroDot || 0);
      show(index);
    });
  });
  window.setInterval(() => {
    show(current + 1);
  }, 5600);
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function applyFilter(input, root) {
  const value = normalize(input.value);
  const activeChip = select('[data-filter-chip].is-active');
  const activeCategory = activeChip ? activeChip.dataset.filterChip : 'all';
  const cards = selectAll('.movie-card', root);
  let visibleCount = 0;
  cards.forEach((card) => {
    const haystack = normalize(card.dataset.search || card.textContent);
    const category = card.dataset.category || '';
    const matchesText = !value || haystack.includes(value);
    const matchesCategory = !activeCategory || activeCategory === 'all' || category === activeCategory;
    const visible = matchesText && matchesCategory;
    card.hidden = !visible;
    if (visible) {
      visibleCount += 1;
    }
  });
  const emptyState = select('.empty-state', root);
  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
}

function initListFiltering() {
  const root = select('[data-list-page]');
  if (!root) {
    return;
  }
  const input = select('.filter-input', root);
  const params = new URLSearchParams(window.location.search);
  if (input && params.get('q')) {
    input.value = params.get('q');
  }
  if (input) {
    input.addEventListener('input', () => applyFilter(input, root));
    applyFilter(input, root);
  }
  selectAll('[data-filter-chip]', root).forEach((chip) => {
    chip.addEventListener('click', () => {
      selectAll('[data-filter-chip]', root).forEach((item) => item.classList.remove('is-active'));
      chip.classList.add('is-active');
      if (input) {
        applyFilter(input, root);
      }
    });
  });
}

function initHeaderSearch() {
  selectAll('form[action="./search.html"]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = select('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = `./search.html?q=${encodeURIComponent(input.value.trim())}`;
    });
  });
}

function initPlayer() {
  const video = select('#moviePlayer');
  const button = select('.player-start');
  const stage = select('.player-stage');
  if (!video || !button || !stage) {
    return;
  }
  const source = video.dataset.hls;
  let playerReady = false;
  let hlsInstance = null;
  const setError = () => {
    button.classList.remove('is-hidden');
    button.setAttribute('aria-label', '重新播放');
  };
  const loadSource = () => {
    if (playerReady || !source) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      playerReady = true;
      return;
    }
    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data && data.fatal) {
          setError();
        }
      });
      playerReady = true;
    }
  };
  const start = async () => {
    loadSource();
    video.controls = true;
    button.classList.add('is-hidden');
    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
    }
  };
  button.addEventListener('click', start);
  stage.addEventListener('click', (event) => {
    if (event.target === video && button.classList.contains('is-hidden')) {
      return;
    }
    if (!button.classList.contains('is-hidden')) {
      start();
    }
  });
  video.addEventListener('error', setError);
  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

initMenu();
initHero();
initHeaderSearch();
initListFiltering();
initPlayer();
