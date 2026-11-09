(function () {
  var KEY_SHELF = 'bc_shelf';
  var getShelf = function () { return JSON.parse(localStorage.getItem(KEY_SHELF) || '[]'); };
  var setShelf = function (a) { localStorage.setItem(KEY_SHELF, JSON.stringify(a)); };

  function updateButtons() {
    var shelf = getShelf();
    document.querySelectorAll('.add-to-shelf').forEach(function (btn) {
      var on = shelf.some(function (b) { return b.id === btn.dataset.id; });
      btn.classList.toggle('on-shelf', on);
      btn.innerHTML = on ? 'On your shelf' : 'Add to Shelf';
    });
  }

  document.querySelectorAll('.add-to-shelf').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.id;
      var shelf = getShelf();
      var idx = shelf.findIndex(function (b) { return b.id === id; });
      if (idx > -1) shelf.splice(idx, 1);
      else shelf.push({
        id: id,
        title: btn.dataset.title,
        author: btn.dataset.author,
        cover: btn.dataset.cover,
        addedAt: Date.now()
      });
      setShelf(shelf);
      updateButtons();
      if (window.Sound) window.Sound.playBeep(800, 0.1);
      btn.style.transform = 'scale(0.9)';
      setTimeout(function () { btn.style.transform = 'scale(1)'; }, 150);
    });
  });
  updateButtons();

  function openBookFromHash() {
    var id = window.location.hash.slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (target && target.tagName === 'DETAILS') {
      target.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  window.addEventListener('DOMContentLoaded', openBookFromHash);
  window.addEventListener('hashchange', openBookFromHash);

  (function () {
    var STORAGE = 'bc_ratings';
    var COLOR_ON = '#f5b301';
    var COLOR_OFF = '#ccc';
    function getRatings() {
      try { return JSON.parse(localStorage.getItem(STORAGE) || '{}'); }
      catch (e) { return {}; }
    }
    function setRatings(r) { localStorage.setItem(STORAGE, JSON.stringify(r)); }
    function paint(container, value) {
      container.querySelectorAll('.rating-star').forEach(function (s, i) {
        s.style.color = (i + 1) <= value ? COLOR_ON : COLOR_OFF;
      });
    }

    document.querySelectorAll('.add-to-shelf').forEach(function (btn) {
      if (!btn.dataset.id) return;
      if (btn.parentElement.querySelector('.book-rating')) return;
      var div = document.createElement('div');
      div.className = 'book-rating my-3';
      div.dataset.bookId = btn.dataset.id;
      btn.parentElement.insertBefore(div, btn);
    });

    document.querySelectorAll('.book-rating').forEach(function (container) {
      var bookId = container.dataset.bookId;
      if (!bookId) return;
      var saved = getRatings()[bookId] || 0;
      container.innerHTML = '';
      for (var i = 1; i <= 5; i++) {
        (function (n) {
          var star = document.createElement('span');
          star.className = 'rating-star';
          star.dataset.value = n;
          star.textContent = '★';
          star.style.cursor = 'pointer';
          star.style.fontSize = '1.4rem';
          star.style.marginRight = '2px';
          star.setAttribute('role', 'button');
          star.setAttribute('tabindex', '0');
          star.setAttribute('aria-label', 'Rate ' + n + ' star' + (n > 1 ? 's' : ''));
          star.addEventListener('click', function () {
            var ratings = getRatings();
            ratings[bookId] = n;
            setRatings(ratings);
            paint(container, n);
            if (window.Sound) window.Sound.playBeep(900, 0.1);
            star.style.transform = 'scale(1.3)';
            setTimeout(function () { star.style.transform = 'scale(1)'; }, 200);
          });
          star.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); star.click(); }
          });
          container.appendChild(star);
        })(i);
      }
      paint(container, saved);
    });
  })();

  (function () {
    var input = document.getElementById('highlight-search');
    if (!input) return;
    var scope = document.querySelector('.book-list');
    if (!scope) return;

    function clearMarks() {
      scope.querySelectorAll('mark.search-hl').forEach(function (m) {
        m.replaceWith(document.createTextNode(m.textContent));
      });
      if (scope.normalize) scope.normalize();
    }

    function highlight(term) {
      clearMarks();
      term = term.trim();
      if (!term) return;
      var safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var testRe = new RegExp(safe, 'i');
      var execRe = new RegExp('(' + safe + ')', 'gi');

      var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.parentElement) return NodeFilter.FILTER_REJECT;
          if (node.parentElement.closest('script, style, mark')) return NodeFilter.FILTER_REJECT;
          return testRe.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var text = node.nodeValue;
        var frag = document.createDocumentFragment();
        var last = 0, m;
        execRe.lastIndex = 0;
        while ((m = execRe.exec(text)) !== null) {
          if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          var mark = document.createElement('mark');
          mark.className = 'search-hl';
          mark.textContent = m[0];
          frag.appendChild(mark);
          last = m.index + m[0].length;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      });
    }
    input.addEventListener('input', function () { highlight(input.value); });
  })();
})();