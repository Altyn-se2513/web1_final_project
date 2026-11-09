(function () {
  const $ = (id) => document.getElementById(id);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  const params = new URLSearchParams(window.location.search);
  const urlId = params.get('id');
  let currentBook = urlId || localStorage.getItem('bc_reader_last_book') || 'Pride and Prejudice';
  localStorage.setItem('bc_reader_last_book', currentBook);

  async function fetchBookFromAPI(title) {
    const container = $('book-reader');
    const titleDisplay = $('book-title-display');
    
    titleDisplay.textContent = title + " — Loading...";
    container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-3">Fetching real book text from Gutenberg API...</p></div>';

    try {
      const searchRes = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(title)}`);
      const searchData = await searchRes.json();

      if (!searchData.results || searchData.results.length === 0) {
        throw new Error("Book not found.");
      }

      const book = searchData.results[0];
      titleDisplay.textContent = book.title + " — " + (book.authors[0] ? book.authors[0].name : 'Unknown');

      let textUrl = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain; charset=us-ascii'] || book.formats['text/plain'];
      if (!textUrl) throw new Error("No readable text available.");

      // CORS Proxy
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(textUrl)}`;
      const textRes = await fetch(proxyUrl);
      let fullText = await textRes.text();

      const startIdx = fullText.indexOf('*** START OF THE PROJECT GUTENBERG EBOOK');
      if (startIdx !== -1) fullText = fullText.substring(startIdx + 40);
      
      // Take first 15 paragraphs
      let paragraphs = fullText.split('\n\n').filter(p => p.trim().length > 50).slice(0, 15);

      let html = `
        <header class="reader-header pb-3 mb-4">
          <img src="${book.formats['image/jpeg'] || 'imgs/logo.png'}" alt="Cover" style="height:150px; object-fit:cover; border-radius: 8px;">
          <div>
            <h1 class="mb-1">${escapeHtml(book.title)}</h1>
            <p class="mb-0">${escapeHtml(book.authors[0] ? book.authors[0].name : '')} · Public Domain</p>
          </div>
        </header>`;

      paragraphs.forEach((p, i) => {
        html += `<p class="reader-para p-2 mb-3" id="para-${i}">${escapeHtml(p.trim())}</p>`;
      });

      container.innerHTML = html;

    } catch (err) {
      container.innerHTML = `<div class="auth-error p-4"><strong>⚠ Error:</strong> ${err.message} <br> Try another book.</div>`;
      titleDisplay.textContent = "Error";
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const bookSel = $('book-select');
    if (bookSel) {
      if (currentBook) bookSel.value = currentBook;
      bookSel.addEventListener('change', (e) => {
        if (e.target.value) window.location.href = 'reader.html?id=' + encodeURIComponent(e.target.value);
      });
    }
    if (currentBook) fetchBookFromAPI(currentBook);
  });
})();