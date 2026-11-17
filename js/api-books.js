(function () {
  var container = document.getElementById('api-books');
  if (!container) return;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  container.innerHTML =
    '<div class="col-12 text-center p-4">' +
      '<div class="spinner-border text-primary" role="status"></div>' +
      '<p class="mt-2 text-muted">Loading recommendations…</p>' +
    '</div>';

  fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=3')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (!data.items || !data.items.length) {
        container.innerHTML = '<p class="text-muted">No recommendations available right now.</p>';
        return;
      }
      container.innerHTML = data.items.map(function (item) {
        var info = item.volumeInfo || {};
        var title = escapeHtml(info.title || 'Untitled');
        var authors = info.authors ? escapeHtml(info.authors.join(', ')) : 'Unknown author';
        var thumb = (info.imageLinks && info.imageLinks.thumbnail)
          ? info.imageLinks.thumbnail.replace(/^http:/, 'https:')
          : 'imgs/logo.png';
        thumb = escapeHtml(thumb);
        return '<div class="col-12 col-md-4">' +
          '<div class="card h-100">' +
            '<img src="' + thumb + '" class="card-img-top" style="height:200px;object-fit:cover;" alt="' + title + ' cover">' +
            '<div class="card-body">' +
              '<h5 class="card-title">' + title + '</h5>' +
              '<p class="card-text small text-muted">' + authors + '</p>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function () {
      container.innerHTML =
        '<p class="text-muted">Could not load recommendations. Please try again later.</p>';
    });
})();