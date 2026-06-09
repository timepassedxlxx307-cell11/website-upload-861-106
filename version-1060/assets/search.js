(function () {
  var input = document.querySelector('[data-search-input]');
  var grid = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var data = window.SEARCH_DATA || [];

  if (!input || !grid) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function render(items) {
    grid.innerHTML = items.map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="movie-cover" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">' +
          '<img src="./' + escapeHtml(item.cover) + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="cover-type">' + escapeHtml(item.type) + '</span>' +
          '<span class="cover-play">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    if (empty) {
      empty.hidden = items.length !== 0;
    }
  }

  function search() {
    var keyword = input.value.trim().toLowerCase();
    var result = data.filter(function (item) {
      var text = [item.title, item.region, item.type, item.year, item.oneLine, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return keyword === '' || text.indexOf(keyword) !== -1;
    }).slice(0, 120);

    render(result);
  }

  input.addEventListener('input', search);
  search();
})();
