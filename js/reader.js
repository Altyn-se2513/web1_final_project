(function () {
  var KEY_HL   = 'bc_reader_highlights';
  var KEY_BM   = 'bc_reader_bookmarks';
  var KEY_LAST = 'bc_reader_last_book';
  var KEY_SHELF = 'bc_shelf';

  var $ = function (id) { return document.getElementById(id); };
  var getHL = function () { return JSON.parse(localStorage.getItem(KEY_HL) || '[]'); };
  var setHL = function (a) { localStorage.setItem(KEY_HL, JSON.stringify(a)); };
  var getBM = function () { return JSON.parse(localStorage.getItem(KEY_BM) || '[]'); };
  var setBM = function (a) { localStorage.setItem(KEY_BM, JSON.stringify(a)); };
  var getShelf = function () { return JSON.parse(localStorage.getItem(KEY_SHELF) || '[]'); };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g,
      function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; });
  }

  var BOOKS = {
    pride: {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      cover: 'imgs/pride.jpg',
      paragraphs: [
        'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
        'However little known the feelings or views of such a man may be on his first entering a neighbourhood...'
      ]
    },
    gatsby: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      cover: 'imgs/gatsby.jpg',
      paragraphs: [
        'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since.',
        'Whenever you feel like criticizing any one, he told me, just remember that all the people in this world haven\'t had the advantages that you\'ve had.'
      ]
    }
  };

  var params = new URLSearchParams(window.location.search);
  var urlId = params.get('id');
  var currentBook;

  if (urlId) {
    if (BOOKS[urlId]) {
      currentBook = urlId;
      localStorage.setItem(KEY_LAST, currentBook);
    } else {
      currentBook = null;
    }
  } else {
    currentBook = localStorage.getItem(KEY_LAST) || 'pride';
    if (!BOOKS[currentBook]) currentBook = 'pride';
    localStorage.setItem(KEY_LAST, currentBook);
  }

  function renderBook() {
    var container = $('book-reader');
    if (!container) return;
    var book = BOOKS[currentBook];
    var titleDisplay = $('book-title-display');
    if (titleDisplay) {
      titleDisplay.textContent = book.title + ' — ' + book.author;
   