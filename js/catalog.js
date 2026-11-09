(function () {
  var searchInput = document.getElementById('catalog-search');
  var filterBtns = document.querySelectorAll('.filter-btn');
  
  // Оставил базовую логику
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      
      var sections = ['classics', 'scifi', 'fantasy', 'romance', 'history'];
      sections.forEach(function (id) {
        var h2 = document.getElementById(id);
        if (!h2) return;
        var row = h2.nextElementSibling;
        var show = (filter === 'all' || filter === id);
        h2.style.display = show ? '' : 'none';
        if (row) row.style.display = show ? '' : 'none';
      });
    });
  });
})();