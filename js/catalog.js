(function () {
  var searchInput = document.getElementById('catalog-search');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var suggestionsList = document.getElementById('search-suggestions');
  var SECTION_IDS = ['classics', 'scifi', 'fantasy', 'romance', 'history'];

  function getSections() {
    return SECTION_IDS.map(function (id) {
      var h2 = document.getElementById(id);
      return h2 ? { id: id, h2: h2, row: h2.nextElementSibling } : null;
    }).filter(Boolean);
  }

  function applyFilter(filter) {
    var sections = getSections();
    var visible;
    switch (filter) {
      case 'all': visible = SECTION_IDS; break;
      case 'classics': case 'scifi': case 'fantasy': case 'romance': case 'history':
        visible = [filter]; break;
      default: visible = SECTION_IDS;
    }
    sections.forEach(function (s) {
      var show = visible.indexOf(s.id) !== -1;
      s.h2.style.display = show ? '' : 'none';
      if (s.row) {
        s.row.style.display = show ? '' : 'none';
        s.row.classList.remove('fade-in-up');
        if (show) { void s.row.offsetWidth; s.row.classList.add('fade-in-up'); }
      }
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      applyFilter(filter);
      localStorage.setItem('bc_catalog_filter', filter);
      if (window.Sound) window.Sound.playBeep(700, 0.05);
    });
  });

  function filterBySearch(query) {
    var needle = query.toLowerCase();
    var sections = getSections();
    sections.forEach(function (s) {
      var anyVisible = false;
      if (s.row) {
        s.row.querySelectorAll('.col-12').forEach(function (cell) {
          var match = !needle || cell.textContent.toLowerCase().indexOf(needle) > -1;
          cell.style.display = match ? '' : 'none';
          if (match) anyVisible = true;
        });
      }
      s.h2.style.display = anyVisible ? '' : 'none';
      if (s.row) s.row.style.display = anyVisible ? '' : 'none';
    });
  }

  var books = [];
  if (window.jQuery) {
    $('#classics, #scifi, #fantasy, #romance, #history').each(function () {
      var $row = $(this).next('.row');
      $row.find('.card').each(function () {
        var $card = $(this);
        var title = $.trim($card.find('.card-title').text());
        var meta = $.trim($card.find('.card-text').text());
        if (title) books.push({ title: title, meta: meta, $card: $card });
      });
    });
  }

  function showSuggestions(query) {
    if (!suggestionsList) return;
    suggestionsList.innerHTML = '';
    if (!query) { suggestionsList.style.display = 'none'; return; }
    var needle = query.toLowerCase();
    var matches = books.filter(function (b) {
      return b.title.toLowerCase().indexOf(needle) > -1 ||
             b.meta.toLowerCase().indexOf(needle) > -1;
    }).slice(0, 8);
    if (!matches.length) { suggestionsList.style.display = 'none'; return; }
    matches.forEach(function (b) {
      var li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action';
      li.style.cursor = 'pointer';
      li.textContent = b.title + ' — ' + b.meta.split(' · ')[0];
      li.addEventListener('click', function () {
        searchInput.value = b.title;
        suggestionsList.style.display = 'none';
        filterBySearch(b.title);
        if (b.$card && b.$card.offset()) {
          window.scrollTo({ top: b.$card.offset().top - 110, behavior: 'smooth' });
        }
      });
      suggestionsList.appendChild(li);
    });
    suggestionsList.style.display = 'block';
  }

  if (searchInput) {
    var savedSearch = localStorage.getItem('bc_catalog_search') || '';
    if (savedSearch) {
      searchInput.value = savedSearch;
      filterBySearch(savedSearch);
    }
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim();
      localStorage.setItem('bc_catalog_search', q);
      filterBySearch(q);
      showSuggestions(q);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#catalog-search, #search-suggestions') && suggestionsList) {
        suggestionsList.style.display = 'none';
      }
    });
  }

  var savedFilter = localStorage.getItem('bc_catalog_filter');
  if (savedFilter && filterBtns.length) {
    filterBtns.forEach(function (b) {
      b.classList.toggle('active', b.dataset.filter === savedFilter);
    });
    applyFilter(savedFilter);
  }
})();