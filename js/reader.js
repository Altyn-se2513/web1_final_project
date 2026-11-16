(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // Защита от XSS при вставке текста из API
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // Получаем ID книги из URL (например, reader.html?id=Pride and Prejudice)
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get('id');
  
  // Если ID нет в URL, берем последнюю книгу из LocalStorage или ставим дефолтную
  let currentBook = urlId || localStorage.getItem('bc_reader_last_book') || 'Pride and Prejudice';
  localStorage.setItem('bc_reader_last_book', currentBook);

  // Асинхронная функция для получения текста книги
  async function fetchBookFromAPI(title) {
    const container = $('book-reader');
    const titleDisplay = $('book-title-display');
    
    titleDisplay.textContent = title + " — Loading...";
    container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-3">Fetching real book text from Gutenberg API...</p></div>';

    try {
      // 1. Ищем книгу в базе Gutendex (API Project Gutenberg)
      const searchRes = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(title)}`);
      const searchData = await searchRes.json();

      if (!searchData.results || searchData.results.length === 0) {
        throw new Error("Book not found in Gutenberg database.");
      }

      const book = searchData.results[0];
      titleDisplay.textContent = book.title + " — " + (book.authors[0] ? book.authors[0].name : 'Unknown');

      // Ищем ссылку на текстовый файл
      let textUrl = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain; charset=us-ascii'] || book.formats['text/plain'];
      if (!textUrl) throw new Error("No readable text available for this book.");

      // 2. Используем CORS Proxy (allorigins) для скачивания текста, так как Gutenberg блокирует прямые запросы из браузера
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(textUrl)}`;
      const textRes = await fetch(proxyUrl);
      let fullText = await textRes.text();

      // 3. Очищаем текст от лицензии Project Gutenberg
      const startIdx = fullText.indexOf('*** START OF THE PROJECT GUTENBERG EBOOK');
      if (startIdx !== -1) fullText = fullText.substring(startIdx + 40);
      
      // Берем только первые 15 абзацев, чтобы не перегружать браузер
      let paragraphs = fullText.split('\n\n').filter(p => p.trim().length > 50).slice(0, 15);

      // 4. Рендерим HTML
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
      // Обработка ошибок, если API упало или книга не найдена
      container.innerHTML = `<div class="auth-error p-4"><strong>⚠ Error:</strong> ${err.message} <br> Try another book or check your connection.</div>`;
      titleDisplay.textContent = "Error loading book";
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const bookSel = $('book-select');
    
    // Синхронизация выпадающего списка с текущей книгой
    if (bookSel) {
      if (currentBook) bookSel.value = currentBook;
      bookSel.addEventListener('change', (e) => {
        if (e.target.value) window.location.href = 'reader.html?id=' + encodeURIComponent(e.target.value);
      });
    }
    
    // Запуск загрузки книги
    if (currentBook) fetchBookFromAPI(currentBook);
  });
})();