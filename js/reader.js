(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  // Get cover URL from Gutendex formats (can be string or array)
  function pickCover(formats) {
    if (!formats) return 'imgs/logo.png';
    var keys = ['image/jpeg', 'image/png'];
    for (var i = 0; i < keys.length; i++) {
      var v = formats[keys[i]];
      if (!v) continue;
      return Array.isArray(v) ? v[0] : v;
    }
    return 'imgs/logo.png';
  }

  function pickTextUrl(formats) {
    if (!formats) return null;
    var keys = [
      'text/plain; charset=utf-8',
      'text/plain; charset=us-ascii',
      'text/plain'
    ];
    for (var i = 0; i < keys.length; i++) {
      var v = formats[keys[i]];
      if (!v) continue;
      return Array.isArray(v) ? v[0] : v;
    }
    return null;
  }

  var params = new URLSearchParams(window.location.search);
  var urlId = params.get('id');
  var currentBook = urlId || localStorage.getItem('bc_reader_last_book') || 'Pride and Prejudice';
  localStorage.setItem('bc_reader_last_book', currentBook);

  async function fetchBookFromAPI(title) {
    var container = $('book-reader');
    var titleDisplay = $('book-title-display');
    if (!container || !titleDisplay) return;

    titleDisplay.textContent = title + ' — Loading…';
    container.innerHTML =
      '<div class="text-center p-5">' +
        '<div class="spinner-border text-primary" role="status"></div>' +
        '<p class="mt-3">Fetching public-domain text from Project Gutenberg…</p>' +
      '</div>';

    try {
      var searchRes = await fetch('https://gutendex.com/books?search=' + encodeURIComponent(title));
      if (!searchRes.ok) throw new Error('Gutendex request failed (HTTP ' + searchRes.status + ').');
      var searchData = await searchRes.json();

      if (!searchData.results || !searchData.results.length) {
        throw new Error('Book not found in the Gutenberg database.');
      }

      var book = searchData.results[0];
      var author = (book.authors && book.authors[0]) ? book.authors[0].name : 'Unknown author';
      titleDisplay.textContent = book.title + ' — ' + author;

      var textUrl = pickTextUrl(book.formats);
      if (!textUrl) throw new Error('No readable plain-text format available for this book.');

      // Gutenberg blocks direct browser fetch — use a public CORS proxy
      var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(textUrl);
      var textRes = await fetch(proxyUrl);
      if (!textRes.ok) throw new Error('Could not download the book text (HTTP ' + textRes.status + ').');
      var fullText = await textRes.text();

      // Trim Project Gutenberg header/footer
      var startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK';
      var endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK';
      var startIdx = fullText.indexOf(startMarker);
      if (startIdx !== -1) {
        var afterStart = fullText.indexOf('\n', startIdx);
        fullText = fullText.substring(afterStart !== -1 ? afterStart + 1 : startIdx + startMarker.length);
      }
      var endIdx = fullText.indexOf(endMarker);
      if (endIdx !== -1) fullText = fullText.substring(0, endIdx);

      var paragraphs = fullText.split('\n\n')
        .map(function (p) { return p.trim(); })
        .filter(function (p) { return p.length > 50; })
        .slice(0, 15);

      if (!paragraphs.length) throw new Error('The downloaded text did not contain readable paragraphs.');

      var cover = pickCover(book.formats);
      var html =
        '<header class="reader-header pb-3 mb-4">' +
          '<img src="' + escapeHtml(cover) + '" alt="Cover" style="height:150px;object-fit:cover;border-radius:8px;">' +
          '<div>' +
            '<h1 class="mb-1">' + escapeHtml(book.title) + '</h1>' +
            '<p class="mb-0">' + escapeHtml(author) + ' · Public Domain</p>' +
          '</div>' +
        '</header>';

      paragraphs.forEach(function (p, i) {
        html += '<p class="reader-para p-2 mb-3" id="para-' + i + '">' + escapeHtml(p) + '</p>';
      });

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML =
        '<div class="auth-error p-4">' +
          '<strong>⚠ Error:</strong> ' + escapeHtml(err.message) +
          '<br>Try another book or check your connection.' +
        '</div>';
      titleDisplay.textContent = 'Error loading book';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bookSel = $('book-select');
    if (bookSel) {
      if (currentBook) bookSel.value = currentBook;
      bookSel.addEventListener('change', function (e) {
        if (e.target.value) {
          window.location.href = 'reader.html?id=' + encodeURIComponent(e.target.value);
        }
      });
    }
    if (currentBook) fetchBookFromAPI(currentBook);
  });
})();