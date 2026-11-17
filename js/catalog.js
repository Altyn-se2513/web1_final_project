(function () {
  'use strict';

  var searchInput = document.getElementById('catalog-search');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.catalog-card');

  function applyFilter() {
    var active = document.querySelector('.filter-btn.active');
    var genre = active ? active.dataset.filter : 'all';
    var term = searchInput ? searchInput.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var title = (card.dataset.title || '').toLowerCase();
      var author = (card.dataset.author || '').toLowerCase();
      var cardGenre = card.dataset.genre || '';
      var matchesGenre = genre === 'all' || cardGenre === genre;
      var matchesTerm = !term || title.indexOf(term) > -1 || author.indexOf(term) > -1;
      var wrapper = card.closest('[data-card-wrapper]') || card;
      wrapper.style.display = (matchesGenre && matchesTerm) ? '' : 'none';
    });

    // Hide empty sections
    ['classics', 'scifi', 'fantasy', 'romance', 'history'].forEach(function (id) {
      var h2 = document.getElementById(id);
      if (!h2) return;
      var row = h2.nextElementSibling;
      if (!row) return;
      var visible = row.querySelectorAll('[data-card-wrapper]:not([style*="display: none"])').length;
      h2.style.display = visible ? '' : 'none';
      row.style.display = visible ? '' : 'none';
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }
})();