(function () {
  var container = document.getElementById('api-books');
  if (!container) return;

  fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=3')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      container.innerHTML = data.items.map(function (item) {
        var info = item.volumeInfo;
        var title = info.title || 'Untitled';
        var thumb = info.imageLinks ? info.imageLinks.thumbnail : 'imgs/logo.png';
        return '<div class="col-12 col-md-4"><div class="card h-100"><img src="' + thumb + '" class="card-img-top" style="height:200px;object-fit:cover;"><div class="card-body"><h5>' + title + '</h5></div></div></div>';
      }).join('');
    })
    .catch(function () { container.innerHTML = '<p>Error loading API.</p>'; });
})();