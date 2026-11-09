(function () {
  var container = document.getElementById('api-books');
  if (!container) return;

  function renderLoading() {
    container.innerHTML = '<p class="text-muted p-3">Loading books from Google Books API…</p>';
  }

  function renderError(msg) {
    container.innerHTML = '<p class="auth-error p-3">⚠ ' + window.escapeHtml(msg) +
      ' <button class="btn btn-sm btn-outline-primary ms-2" id="api-retry">Retry</button></p>';
    var retry = document.getElementById('api-retry');
    if (retry) retry.addEventListener('click', load);
  }

  function renderBooks(items) {
    if (!items || !items.length) {
      container.innerHTML = '<p class="text-muted p-3">No books found.</p>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      var info = item.volumeInfo || {};
      var title = info.title || 'Untitled';
      var authors = (info.authors || []).join(', ') || 'Unknown author';
      var published = info.publishedDate || '';
      var desc = (info.description || 'No description available.').slice(0, 140);
      var thumb = (info.imageLinks && info.imageLinks.thumbnail) || 'imgs/logo.png';
      return '<div class="col-12 col-sm-6 col-md-6 col-lg-4">' +
        '<div class="card h-100">' +
        '<img src="' + window.escapeHtml(thumb) + '" alt="' + window.escapeHtml(title) + ' cover" class="card-img-top" style="object-fit:cover;height:220px" referrerpolicy="no-referrer">' +
        '<div class="card-body d-flex flex-column">' +
        '<h5 class="card-title">' + window.escapeHtml(title) + '</h5>' +
        '<p class="card-text flex-grow-1">' + window.escapeHtml(authors) +
        (published ? ' · ' + window.escapeHtml(published) : '') +
        '<br><small>' + window.escapeHtml(desc) + '…</small></p>' +
        '</div></div></div>';
    }).join('');
  }

  function load() {
    renderLoading();
    fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=6')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) { renderBooks(data.items); })
      .catch(function (err) {
        renderError('Could not load books from API (' + err.message + '). Try again later.');
      });
  }

  load();
})();