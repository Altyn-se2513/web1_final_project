'use strict';

/* ============================================================
   Digital Book Collection — main script
   Sections: data · helpers · global actions · theme · menu
   home · catalog · book details · account · profile · pricing
   contact · reader · about · router
   ============================================================ */

/* -------------------- DATA -------------------- */
const BOOKS = [
  { id:'gatsby', title:'The Great Gatsby', author:'F. Scott Fitzgerald', year:1925, genre:'classic', cover:'cover-gatsby',
    desc:'Nick Carraway is drawn into the dazzling world of Jay Gatsby, a mysterious millionaire chasing a lost love across the glittering parties of Long Island.',
    quote:'So we beat on, boats against the current, borne back ceaselessly into the past.' },
  { id:'1984', title:'1984', author:'George Orwell', year:1949, genre:'dystopian', cover:'cover-orwell',
    desc:'In a totalitarian future where every thought is watched, Winston Smith dares to keep a diary and fall in love.',
    quote:'Big Brother is watching you.' },
  { id:'hobbit', title:'The Hobbit', author:'J.R.R. Tolkien', year:1937, genre:'fantasy', cover:'cover-hobbit',
    desc:'Bilbo Baggins is swept into an adventure with thirteen dwarves and a wizard to reclaim a treasure guarded by a dragon.',
    quote:'In a hole in the ground there lived a hobbit.' },
  { id:'pride', title:'Pride and Prejudice', author:'Jane Austen', year:1813, genre:'romance', cover:'cover-pride',
    desc:'Elizabeth Bennet navigates family, society and the complicated Mr Darcy in this sharp comedy of manners.',
    quote:'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.' },
  { id:'mockingbird', title:'To Kill a Mockingbird', author:'Harper Lee', year:1960, genre:'classic', cover:'cover-mockingbird',
    desc:'Scout Finch grows up in a small Southern town as her father defends a black man unjustly accused.',
    quote:'You never really understand a person until you consider things from his point of view.' },
  { id:'frankenstein', title:'Frankenstein', author:'Mary Shelley', year:1818, genre:'classic', cover:'cover-frankenstein',
    desc:'Victor Frankenstein creates life and is haunted by the consequences of his ambition.',
    quote:'Beware; for I am fearless, and therefore powerful.' },
  { id:'alice', title:"Alice's Adventures in Wonderland", author:'Lewis Carroll', year:1865, genre:'fantasy', cover:'cover-alice',
    desc:'Alice falls down a rabbit hole into a world of riddles, talking animals and a very angry queen.',
    quote:'We are all mad here.' },
  { id:'dorian', title:'The Picture of Dorian Gray', author:'Oscar Wilde', year:1890, genre:'classic', cover:'cover-dorian',
    desc:'A beautiful young man stays forever young while his portrait bears the marks of his sins.',
    quote:'The books that the world calls immoral are books that show the world its own shame.' },
  { id:'treasure', title:'Treasure Island', author:'Robert Louis Stevenson', year:1883, genre:'adventure', cover:'cover-treasure',
    desc:'Jim Hawkins sets sail for buried treasure and meets the one-legged pirate Long John Silver.',
    quote:'Fifteen men on the dead man\u2019s chest — Yo-ho-ho, and a bottle of rum!' },
  { id:'jane', title:'Jane Eyre', author:'Charlotte Bronte', year:1847, genre:'romance', cover:'cover-jane',
    desc:'An orphaned governess falls for her brooding employer, only to discover a secret hidden in the attic.',
    quote:'I am no bird; and no net ensnares me.' },
  { id:'wild', title:'The Call of the Wild', author:'Jack London', year:1903, genre:'adventure', cover:'cover-wild',
    desc:'Buck, a domestic dog, is stolen and thrown into the brutal life of a sled dog in the Yukon.',
    quote:'He was beaten (he knew that); but he was not broken.' },
  { id:'brave', title:'Brave New World', author:'Aldous Huxley', year:1932, genre:'dystopian', cover:'cover-brave',
    desc:'A society engineered for happiness hides a chilling cost.',
    quote:'But I don\u2019t want comfort. I want God, I want poetry, I want real danger, I want freedom.' },
  { id:'fahrenheit', title:'Fahrenheit 451', author:'Ray Bradbury', year:1953, genre:'dystopian', cover:'cover-fahrenheit',
    desc:'A fireman who burns books begins to question the world he helps maintain.',
    quote:'It was a pleasure to burn.' },
  { id:'moby', title:'Moby-Dick', author:'Herman Melville', year:1851, genre:'adventure', cover:'cover-moby',
    desc:'Captain Ahab hunts the white whale that took his leg across the world\u2019s oceans.',
    quote:'Call me Ishmael.' },
  { id:'emma', title:'Emma', author:'Jane Austen', year:1815, genre:'romance', cover:'cover-emma',
    desc:'Emma Woodhouse cannot resist matchmaking — with predictably chaotic results.',
    quote:'I am going to take a heroine whom no one but myself will much like.' },
  { id:'lotr', title:'The Fellowship of the Ring', author:'J.R.R. Tolkien', year:1954, genre:'fantasy', cover:'cover-lotr',
    desc:'Frodo Baggins sets out to destroy the One Ring and save Middle-earth.',
    quote:'Even the smallest person can change the course of the future.' }
];

const QUOTES = [
  { text:'There is no friend as loyal as a book.', author:'Ernest Hemingway' },
  { text:'A reader lives a thousand lives before he dies.', author:'George R.R. Martin' },
  { text:'We read to know we are not alone.', author:'C.S. Lewis' },
  { text:'Books are a uniquely portable magic.', author:'Stephen King' },
  { text:'Not all those who wander are lost.', author:'J.R.R. Tolkien' },
  { text:'Until I feared I would lose it, I never loved to read. One does not love breathing.', author:'Harper Lee' }
];

/* -------------------- HELPERS -------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} },
  del(key) { try { localStorage.removeItem(key); } catch (e) {} }
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]
  ));
}

let toastTimer = null;
function showToast(message) {
  let el = document.getElementById('global-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

let audioCtx = null;
function playTone(freq = 660, duration = 0.08) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration + 0.02);
  } catch (e) {}
}

function setFieldError(input, message) {
  if (!input) return;
  input.classList.toggle('invalid', !!message);
  const err = document.getElementById(input.id + '-error');
  if (err) err.textContent = message;
}
function checkField(input, condition, message) {
  setFieldError(input, condition ? '' : message);
  return condition;
}

/* shelf */
function getShelf() { return Store.get('dbc-shelf', []); }
function isSaved(id) { return getShelf().includes(id); }
function toggleShelf(id) {
  const shelf = getShelf();
  const i = shelf.indexOf(id);
  if (i === -1) shelf.push(id); else shelf.splice(i, 1);
  Store.set('dbc-shelf', shelf);
  return i === -1;
}

/* dates */
function localISO(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}
function lastNDays(n) {
  const out = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ iso: localISO(d), day: d.getDate(), isToday: i === 0 });
  }
  return out;
}

/* book card */
function bookCard(book) {
  const saved = isSaved(book.id);
  return `<article class="book-card">
    <a class="cover ${book.cover}" href="book-details.html?id=${book.id}">
      <span>${esc(book.author.toUpperCase())}</span>
      <b>${esc(book.title)}</b>
      <small>${book.year} · ${esc(book.genre.toUpperCase())}</small>
    </a>
    <div class="book-meta">
      <h3>${esc(book.title)}</h3>
      <p>${esc(book.author)}</p>
      <div class="card-actions">
        <a href="book-details.html?id=${book.id}">Book details ↗</a>
        <button class="mini-btn ${saved ? 'is-saved' : ''}" type="button" data-save="${book.id}">${saved ? 'Saved ✓' : '+ Shelf'}</button>
      </div>
    </div>
  </article>`;
}

/* -------------------- GLOBAL ACTIONS -------------------- */
function initGlobalActions() {
  const savedAccent = localStorage.getItem('dbc-accent');
  if (savedAccent) document.documentElement.style.setProperty('--primary', savedAccent);

  document.addEventListener('click', event => {
    const saveBtn = event.target.closest('[data-save]');
    if (saveBtn) {
      const id = saveBtn.dataset.save;
      const saved = toggleShelf(id);
      $$(`[data-save="${id}"]`).forEach(btn => {
        btn.classList.toggle('is-saved', saved);
        btn.textContent = btn.classList.contains('mini-btn')
          ? (saved ? 'Saved ✓' : '+ Shelf')
          : (saved ? 'Saved to shelf ✓' : 'Add to shelf');
      });
      playTone(saved ? 880 : 440, 0.07);
      showToast(saved ? 'Added to your shelf' : 'Removed from your shelf');
      return;
    }
    const copyBtn = event.target.closest('[data-copy]');
    if (copyBtn) {
      const text = decodeURIComponent(copyBtn.dataset.copy || '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => showToast('Quote copied'))
          .catch(() => showToast('Could not copy'));
      } else {
        showToast('Clipboard is not available');
      }
    }
  });
}

/* -------------------- THEME -------------------- */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const icon = btn.querySelector('.theme-icon');

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  apply(document.documentElement.dataset.theme || 'light');

  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dbc-theme', next);
    apply(next);
  });
}

/* -------------------- MOBILE MENU -------------------- */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  nav.addEventListener('click', e => {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -------------------- HOME -------------------- */
function initHome() {
  initGreeting();
  renderFeatured();
  initQuoteRotation();
  initNewsletter();
  loadHomeApi();
}

function initGreeting() {
  const note = document.querySelector('.hero-note');
  if (!note) return;
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const user = Store.get('dbc-user', null);
  const name = user && user.name ? String(user.name).split(' ')[0] : 'reader';
  note.id = 'hero-greeting';
  note.innerHTML = `<span class="status-dot"></span> ${esc(part)}, ${esc(name)} — a little library that travels with you.`;
}

function renderFeatured() {
  const grid = document.querySelector('.featured-grid');
  if (!grid) return;
  const picks = [BOOKS[0], BOOKS[1], BOOKS[2], BOOKS[3]];
  grid.id = 'featured-grid';
  grid.innerHTML = picks.map(bookCard).join('');
}

function initQuoteRotation() {
  const band = document.querySelector('.quote-band');
  if (!band) return;
  const quoteEl = band.querySelector('blockquote');
  const authorEl = band.querySelector('p');
  if (!quoteEl || !authorEl) return;
  quoteEl.id = 'quote-text';
  authorEl.id = 'quote-author';

  if (!band.querySelector('[data-open-newsletter]')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline';
    btn.dataset.openNewsletter = '';
    btn.style.marginTop = '16px';
    btn.textContent = 'Subscribe to weekly notes';
    band.appendChild(btn);
  }

  let last = -1;
  function tick() {
    let i;
    do { i = Math.floor(Math.random() * QUOTES.length); } while (i === last && QUOTES.length > 1);
    last = i;
    quoteEl.classList.remove('quote-in');
    void quoteEl.offsetWidth;
    quoteEl.classList.add('quote-in');
    quoteEl.textContent = '“' + QUOTES[i].text + '”';
    authorEl.textContent = '— ' + QUOTES[i].author;
  }
  tick();
  setInterval(tick, 9000);
}

function initNewsletter() {
  let modal = document.getElementById('newsletter-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'newsletter-modal';
    modal.className = 'newsletter-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="newsletter-modal">
        <button class="modal-close" type="button" data-close-newsletter aria-label="Close">✕</button>
        <h2>Weekly reading notes</h2>
        <p>One thoughtful email a week. No spam — just stories worth your time.</p>
        <form id="newsletter-form" novalidate>
          <div class="field">
            <label for="newsletter-email">Email address</label>
            <input id="newsletter-email" type="text" placeholder="name@example.com">
            <small class="field-error" id="newsletter-email-error"></small>
          </div>
          <p id="newsletter-feedback" class="form-feedback" role="status"></p>
          <button class="btn btn-primary w-100" type="submit">Subscribe</button>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }

  const open  = () => modal.classList.add('show');
  const close = () => modal.classList.remove('show');

  $$('[data-open-newsletter]').forEach(b => b.addEventListener('click', open));
  $$('[data-close-newsletter]').forEach(b => b.addEventListener('click', close));
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email');
      const fb = document.getElementById('newsletter-feedback');
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      setFieldError(email, ok ? '' : 'Enter a valid email address.');
      if (!ok) return;
      if (fb) fb.textContent = 'You are subscribed! (demo)';
      showToast('Subscribed — welcome!');
      playTone(760, 0.09);
      form.reset();
      setTimeout(close, 900);
    });
  }
}

function loadHomeApi() {
  const status = document.getElementById('home-api-status');
  const results = document.getElementById('home-api-results');
  if (!results) return;

  if (status) { status.classList.add('loading'); status.textContent = 'Loading book recommendations…'; }

  fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=4')
    .then(res => { if (!res.ok) throw new Error('Network'); return res.json(); })
    .then(data => {
      const items = data.items || [];
      if (!items.length) {
        renderFallbackHome();
        return;
      }
      if (status) status.remove();
      results.innerHTML = items.map(item => {
        const v = item.volumeInfo || {};
        const title = v.title || 'Untitled';
        const authors = (v.authors || ['Unknown author']).join(', ');
        const thumb = v.imageLinks && v.imageLinks.thumbnail;
        return `<article class="api-book">
          ${thumb ? `<img src="${esc(thumb)}" alt="">` : `<div class="api-cover-fallback">BOOK</div>`}
          <div><h3>${esc(title)}</h3><p>${esc(authors)}</p></div>
        </article>`;
      }).join('');
    })
    .catch(renderFallbackHome);

  function renderFallbackHome() {
    if (status) {
      status.classList.remove('loading');
      status.textContent = 'Showing curated recommendations — live data unavailable right now.';
    }
    const picks = [BOOKS[4], BOOKS[5], BOOKS[6], BOOKS[7]];
    results.innerHTML = picks.map(b => `
      <article class="api-book">
        <div class="api-cover-fallback">BOOK</div>
        <div>
          <h3>${esc(b.title)}</h3>
          <p>${esc(b.author)}</p>
        </div>
      </article>`).join('');
  }
}

/* -------------------- CATALOG -------------------- */
function initCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const line = document.querySelector('.results-line');
  if (line && !document.getElementById('catalog-sort')) {
    const label = document.createElement('label');
    label.className = 'sort-label';
    label.innerHTML = 'Sort by <select id="catalog-sort">' +
      '<option value="default">Featured</option>' +
      '<option value="title">Title A–Z</option>' +
      '<option value="year">Year (oldest)</option>' +
      '<option value="author">Author A–Z</option>' +
      '</select>';
    const spans = line.querySelectorAll('span');
    if (spans.length > 1) spans[1].replaceWith(label);
    else line.appendChild(label);
  }

  const search   = document.getElementById('catalog-search');
  const filters  = $$('#genre-filters .filter-chip');
  const sortSel  = document.getElementById('catalog-sort');
  const countEl  = document.getElementById('catalog-count');
  const emptyEl  = document.getElementById('catalog-empty');

  const state = Store.get('dbc-catalog', { q:'', genre:'all', sort:'default' });
  if (search) search.value = state.q;
  filters.forEach(b => b.classList.toggle('active', b.dataset.genre === state.genre));
  if (sortSel) sortSel.value = state.sort;

  function render() {
    let list = BOOKS.slice();
    if (state.genre !== 'all') list = list.filter(b => b.genre === state.genre);
    const q = state.q.trim().toLowerCase();
    if (q) list = list.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
    if (state.sort === 'title')  list.sort((a, b) => a.title.localeCompare(b.title));
    if (state.sort === 'year')   list.sort((a, b) => a.year - b.year);
    if (state.sort === 'author') list.sort((a, b) => a.author.localeCompare(b.author));

    grid.innerHTML = list.map(bookCard).join('');
    if (countEl) countEl.textContent = list.length === BOOKS.length
      ? 'Showing all books'
      : `Showing ${list.length} of ${BOOKS.length} books`;
    if (emptyEl) emptyEl.hidden = list.length !== 0;
  }
  render();

  if (search) search.addEventListener('input', () => {
    state.q = search.value;
    Store.set('dbc-catalog', state);
    render();
  });
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.genre = btn.dataset.genre;
    Store.set('dbc-catalog', state);
    render();
  }));
  if (sortSel) sortSel.addEventListener('change', () => {
    state.sort = sortSel.value;
    Store.set('dbc-catalog', state);
    render();
  });
}

/* -------------------- BOOK DETAILS -------------------- */
function initBookDetails() {
  const root = document.getElementById('book-detail');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id') || BOOKS[0].id;
  const book = BOOKS.find(b => b.id === id);
  if (!book) {
    root.innerHTML = `<div class="empty-state"><p>We couldn't find that book.</p>
      <a class="btn btn-primary" href="catalog.html">Back to catalog</a></div>`;
    return;
  }

  document.title = book.title + ' | Digital Book Collection';

  const saved = isSaved(book.id);
  const ratings = Store.get('dbc-ratings', {});
  const rating = ratings[book.id] || 0;
  const genreLabel = book.genre.charAt(0).toUpperCase() + book.genre.slice(1);

  root.innerHTML = `
    <div class="detail-cover">
      <div class="cover ${book.cover}">
        <span>${esc(book.author.toUpperCase())}</span>
        <b>${esc(book.title)}</b>
        <small>${book.year} · ${esc(book.genre.toUpperCase())}</small>
      </div>
    </div>
    <div class="detail-copy">
      <h2>${esc(book.title)}</h2>
      <p class="detail-author">by ${esc(book.author)} · ${book.year}</p>
      <p>${esc(book.desc)}</p>
      <blockquote class="detail-quote">
        “${esc(book.quote)}”
        <button class="mini-btn" type="button" data-copy="${encodeURIComponent(book.quote)}">Copy quote</button>
      </blockquote>
      <div class="detail-facts">
        <div><span>GENRE</span><strong>${esc(genreLabel)}</strong></div>
        <div><span>FIRST PUBLISHED</span><strong>${book.year}</strong></div>
        <div><span>YOUR RATING</span><strong id="rating-value">${rating ? rating + '/5' : 'Not rated'}</strong></div>
      </div>
      <div class="rating" id="star-rating" data-value="${rating}" aria-label="Rate this book">
        ${[1,2,3,4,5].map(n => `<button type="button" data-star="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary ${saved ? 'is-saved' : ''}" type="button" data-save="${book.id}">
          ${saved ? 'Saved to shelf ✓' : 'Add to shelf'}
        </button>
        <a class="btn btn-outline" href="reader.html">Read online</a>
        <a class="btn btn-outline" href="catalog.html">← Catalog</a>
      </div>
      <h3 class="serif-heading">Reader reviews</h3>
      <div id="book-api-reviews" class="status-message">Loading reviews…</div>
    </div>`;

  bindRating(book);
  renderRelated(book);
  loadBookApi(book);
}

function bindRating(book) {
  const wrap = document.getElementById('star-rating');
  if (!wrap) return;
  const buttons = $$('button', wrap);
  const valueEl = document.getElementById('rating-value');

  const paint = v => buttons.forEach((b, i) => b.classList.toggle('on', i < v));
  paint(parseInt(wrap.dataset.value, 10) || 0);

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => paint(+btn.dataset.star));
    btn.addEventListener('mouseleave', () => paint(parseInt(wrap.dataset.value, 10) || 0));
    btn.addEventListener('click', () => {
      const v = +btn.dataset.star;
      wrap.dataset.value = v;
      const all = Store.get('dbc-ratings', {});
      all[book.id] = v;
      Store.set('dbc-ratings', all);
      paint(v);
      if (valueEl) valueEl.textContent = v + '/5';
      playTone(720, 0.07);
      showToast('Thanks for rating!');
    });
  });
}

function renderRelated(book) {
  const block = document.querySelector('.related-block');
  if (!block) return;
  let grid = document.getElementById('related-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'related-grid';
    grid.className = 'book-grid';
    block.appendChild(grid);
  }
  let related = BOOKS.filter(b => b.id !== book.id && b.genre === book.genre).slice(0, 4);
  if (!related.length) related = BOOKS.filter(b => b.id !== book.id).slice(0, 4);
  grid.innerHTML = related.map(bookCard).join('');
}

function loadBookApi(book) {
  const box = document.getElementById('book-api-reviews');
  if (!box) return;

  box.classList.add('loading');
  box.textContent = 'Loading reviews…';

  const query = `intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}`;

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`)
    .then(res => { if (!res.ok) throw new Error('Network'); return res.json(); })
    .then(data => {
      const items = data.items || [];
      box.classList.remove('loading');
      if (!items.length) { renderFallbackReviews(); return; }
      box.innerHTML = items.map(item => {
        const v = item.volumeInfo || {};
        const desc = v.description || 'No description available.';
        return `<article class="api-book" style="margin-bottom:10px;">
          <div>
            <h3>${esc(v.title || 'Untitled')}</h3>
            <p>${esc((v.authors || ['Unknown']).join(', '))}</p>
            <p>${esc(desc.slice(0, 180))}${desc.length > 180 ? '…' : ''}</p>
            ${v.averageRating ? `<p><strong>${v.averageRating}/5</strong> from Google Books</p>` : ''}
          </div>
        </article>`;
      }).join('');
    })
    .catch(() => { box.classList.remove('loading'); renderFallbackReviews(); });

  function renderFallbackReviews() {
    box.innerHTML = `
      <article class="api-book" style="margin-bottom:10px;">
        <div>
          <h3>About this book</h3>
          <p>${esc(book.title)} · ${esc(book.author)}</p>
          <p>${esc(book.desc)}</p>
        </div>
      </article>
      <article class="api-book">
        <div>
          <h3>A line to remember</h3>
          <p>“${esc(book.quote)}”</p>
          <p class="muted" style="font-size:11px;">Live reviews unavailable — showing curated content.</p>
        </div>
      </article>`;
  }
}

/* -------------------- ACCOUNT -------------------- */
function initAuth() {
  const tabs = $$('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (tabs.length && loginForm && signupForm) {
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.authTab === 'login';
      loginForm.hidden = !isLogin;
      signupForm.hidden = isLogin;
    }));
  }
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
}

function handleSignup(e) {
  e.preventDefault();
  const name    = document.getElementById('signup-name');
  const email   = document.getElementById('signup-email');
  const phone   = document.getElementById('signup-phone');
  const pass    = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-confirm');

  let ok = true;
  ok = checkField(name, name.value.trim().length >= 2, 'Please enter your name (2+ characters).') && ok;
  ok = checkField(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Enter a valid email address.') && ok;
  ok = checkField(phone, /^\+?[\d\s\-()]{7,20}$/.test(phone.value.trim()), 'Enter a valid phone number.') && ok;
  ok = checkField(pass, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass.value), 'Min 8 chars with upper, lower and a number.') && ok;
  ok = checkField(confirm, pass.value === confirm.value, 'Passwords do not match.') && ok;
  if (!ok) return;

  const users = Store.get('dbc-users', []);
  if (users.some(u => u.email === email.value.trim().toLowerCase())) {
    setFieldError(email, 'This email is already registered.');
    return;
  }

  const user = {
    name: name.value.trim(),
    email: email.value.trim().toLowerCase(),
    phone: phone.value.trim(),
    goal: 20
  };
  users.push({ ...user, password: pass.value });
  Store.set('dbc-users', users);
  Store.set('dbc-user', user);
  showToast('Account created — welcome!');
  playTone(880, 0.09);
  setTimeout(() => { location.href = 'profile.html'; }, 500);
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email');
  const pass  = document.getElementById('login-password');
  const fb    = document.getElementById('login-feedback');

  let ok = true;
  ok = checkField(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Enter a valid email.') && ok;
  ok = checkField(pass, pass.value.length >= 1, 'Enter your password.') && ok;
  if (!ok) return;

  const users = Store.get('dbc-users', []);
  const found = users.find(u =>
    u.email === email.value.trim().toLowerCase() && u.password === pass.value
  );
  if (!found) {
    if (fb) fb.textContent = 'Email or password is incorrect. Create an account first.';
    return;
  }

  Store.set('dbc-user', {
    name: found.name,
    email: found.email,
    phone: found.phone,
    goal: found.goal || 20
  });
  if (fb) fb.textContent = 'Welcome back! Redirecting…';
  showToast('Logged in');
  setTimeout(() => { location.href = 'profile.html'; }, 500);
}

/* -------------------- PROFILE -------------------- */
function initProfile() {
  const root = document.getElementById('profile-root');
  if (!root) return;

  function render() {
    const user = Store.get('dbc-user', null);
    if (!user) {
      root.innerHTML = `<div class="profile-area empty-state">
        <p>You're not signed in yet.</p>
        <a class="btn btn-primary" href="account.html">Sign in or create an account</a>
      </div>`;
      return;
    }

    const goal = Store.get('dbc-goal', user.goal || 20);
    const shelf = getShelf().map(id => BOOKS.find(b => b.id === id)).filter(Boolean);
    const streak = Store.get('dbc-streak', []);
    const days = lastNDays(28);
    const last7 = lastNDays(7).map(d => d.iso);
    const doneLast7 = last7.filter(d => streak.includes(d)).length;
    const pct = Math.round((doneLast7 / 7) * 100);

    const streakHtml = days.map(d => {
      const done = streak.includes(d.iso);
      return `<button class="streak-cell ${done ? 'done' : ''} ${d.isToday ? 'today' : ''}"
        type="button" data-day="${d.iso}" title="${d.iso}" aria-label="${d.iso}">${d.day}</button>`;
    }).join('');

    root.innerHTML = `
      <section class="profile-area">
        <div class="profile-head">
          <div>
            <span class="eyebrow">YOUR PROFILE</span>
            <h2>${esc(user.name)}</h2>
          </div>
          <div class="profile-actions">
            <a class="btn btn-outline" href="catalog.html">Browse catalog</a>
            <button class="btn btn-outline danger" type="button" data-logout>Log out</button>
          </div>
        </div>

        <div class="profile-details">
          <div><span>EMAIL</span><strong>${esc(user.email)}</strong></div>
          <div><span>PHONE</span><strong>${esc(user.phone || 'Not set')}</strong></div>
          <div><span>DAILY GOAL</span><strong>${goal} min</strong></div>
        </div>

        <div class="goal-card">
          <div>
            <h3>Reading consistency</h3>
            <p class="streak-summary">${doneLast7} of the last 7 days logged.</p>
            <div class="progress-bar"><i style="width:${pct}%"></i></div>
          </div>
          <div class="goal-controls">
            <button class="btn btn-outline" type="button" data-goal="-5">−5</button>
            <strong>${goal}</strong><span>min</span>
            <button class="btn btn-outline" type="button" data-goal="5">+5</button>
          </div>
        </div>

        <h3 class="serif-heading">28-day reading streak</h3>
        <p class="streak-summary">Tap a day to mark it as read.</p>
        <div class="streak-grid">${streakHtml}</div>

        <h3 class="serif-heading">Your shelf (${shelf.length})</h3>
        ${shelf.length
          ? `<div class="shelf-grid">${shelf.map(b => `
              <div class="shelf-item">
                <button class="remove-shelf" type="button" data-remove-shelf="${b.id}" aria-label="Remove ${esc(b.title)}">✕</button>
                <a class="cover ${b.cover}" href="book-details.html?id=${b.id}"><b>${esc(b.title)}</b></a>
                <h3>${esc(b.title)}</h3>
                <p>${esc(b.author)}</p>
              </div>`).join('')}</div>`
          : `<p class="empty-state">Your shelf is empty. <a href="catalog.html">Add a book →</a></p>`}
      </section>`;
  }
  render();

  root.addEventListener('click', e => {
    if (e.target.closest('[data-logout]')) {
      Store.del('dbc-user');
      showToast('Logged out');
      setTimeout(() => { location.href = 'index.html'; }, 300);
      return;
    }

    const goalBtn = e.target.closest('[data-goal]');
    if (goalBtn) {
      let g = Store.get('dbc-goal', 20);
      g = Math.max(5, Math.min(180, g + Number(goalBtn.dataset.goal)));
      Store.set('dbc-goal', g);
      playTone(600, 0.05);
      render();
      return;
    }

    const cell = e.target.closest('.streak-cell');
    if (cell) {
      const iso = cell.dataset.day;
      const set = Store.get('dbc-streak', []);
      const i = set.indexOf(iso);
      if (i === -1) { set.push(iso); playTone(880, 0.05); }
      else { set.splice(i, 1); playTone(330, 0.05); }
      Store.set('dbc-streak', set);
      render();
      return;
    }

    const rm = e.target.closest('[data-remove-shelf]');
    if (rm) {
      toggleShelf(rm.dataset.removeShelf);
      playTone(440, 0.06);
      render();
    }
  });
}

/* -------------------- PRICING -------------------- */
function initPricing() {
  const btns = $$('.billing-btn');
  const faqButtons = $$('.faq-q');

  if (btns.length) {
    const saved = localStorage.getItem('dbc-billing') || 'monthly';
    btns.forEach(b => b.classList.toggle('active', b.dataset.period === saved));
    applyBilling(saved);

    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localStorage.setItem('dbc-billing', btn.dataset.period);
      applyBilling(btn.dataset.period);
    }));
  }

  faqButtons.forEach(q => q.addEventListener('click', () => {
    const item = q.parentElement;
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
  }));

  function applyBilling(period) {
    $$('.price strong').forEach(el => {
      const val = el.dataset[period];
      if (val === undefined) return;
      el.textContent = '$' + val;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    });
    $$('.price span').forEach(s => {
      s.textContent = period === 'yearly' ? '/ month, billed yearly' : '/ month';
    });
    playTone(period === 'yearly' ? 820 : 620, 0.05);
  }
}

/* -------------------- CONTACT -------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const card = form.closest('.form-card') || form;
  if (!document.getElementById('accent-color')) {
    const box = document.createElement('div');
    box.className = 'accent-picker';
    box.innerHTML = `<label for="accent-color">Accent colour</label>
      <input id="accent-color" type="color" value="${localStorage.getItem('dbc-accent') || '#4285B4'}">`;
    card.appendChild(box);
  }
  const accent = document.getElementById('accent-color');
  if (accent) {
    accent.addEventListener('input', () => {
      document.documentElement.style.setProperty('--primary', accent.value);
      localStorage.setItem('dbc-accent', accent.value);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('contact-name');
    const email = document.getElementById('contact-email');
    const phone = document.getElementById('contact-phone');
    const msg   = document.getElementById('contact-message');
    const fb    = document.getElementById('contact-feedback');

    let ok = true;
    ok = checkField(name, name.value.trim().length >= 2, 'Please enter your name.') && ok;
    ok = checkField(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Enter a valid email address.') && ok;
    ok = checkField(phone, /^\+?[\d\s\-()]{7,20}$/.test(phone.value.trim()), 'Enter a valid phone number.') && ok;
    ok = checkField(msg, msg.value.trim().length >= 10, 'Message should be at least 10 characters.') && ok;

    if (!ok) {
      if (fb) { fb.textContent = 'Please fix the highlighted fields.'; fb.style.color = 'var(--red)'; }
      return;
    }
    if (fb) { fb.textContent = 'Thank you! Your message has been received (demo only).'; fb.style.color = 'var(--primary)'; }
    showToast('Message sent');
    playTone(760, 0.09);
    form.reset();
  });
}

/* -------------------- READER -------------------- */
function initReader() {
  const form = document.getElementById('reader-form');
  if (!form) return;

  const status  = document.getElementById('reader-status');
  const results = document.getElementById('reader-results');
  const content = document.getElementById('reader-content');
  const textEl  = content ? content.querySelector('.reader-text') : null;
  const titleEl = document.getElementById('reader-title');
  const authorEl= document.getElementById('reader-author');
  if (!textEl || !content) return;

  let cache = {};
  let activeBook = null;

  if (!content.querySelector('.reader-controls')) {
    const controls = document.createElement('div');
    controls.className = 'reader-controls';
    controls.innerHTML = `
      <div class="hl-colors" role="group" aria-label="Highlight colour">
        <button class="hl-btn active" type="button" data-color="yellow" style="--c:#ffe58a" aria-label="Yellow"></button>
        <button class="hl-btn" type="button" data-color="green" style="--c:#b8f0c5" aria-label="Green"></button>
        <button class="hl-btn" type="button" data-color="blue" style="--c:#b9d8ff" aria-label="Blue"></button>
        <button class="hl-btn" type="button" data-color="pink" style="--c:#ffc7e0" aria-label="Pink"></button>
        <button class="hl-btn" type="button" data-color="orange" style="--c:#ffd3a8" aria-label="Orange"></button>
      </div>
      <div class="font-controls">
        <button type="button" data-font="-1" aria-label="Smaller text">A−</button>
        <button type="button" data-font="1" aria-label="Larger text">A+</button>
        <button type="button" data-line="-0.1" aria-label="Tighter lines">↕−</button>
        <button type="button" data-line="0.1" aria-label="Looser lines">↕+</button>
      </div>
      <button id="reader-clear-hl" class="btn btn-outline" type="button">Clear highlights</button>`;
    content.insertBefore(controls, textEl);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const query = document.getElementById('reader-query').value.trim();
    if (!query) return;

    status.textContent = 'Searching public catalogue…';
    status.classList.add('loading');
    results.innerHTML = '';

    fetch(`https://gutendex.com/books?search=${encodeURIComponent(query)}`)
      .then(res => { if (!res.ok) throw new Error('Network'); return res.json(); })
      .then(data => {
        const list = (data.results || []).slice(0, 8);
        cache = {};
        list.forEach(b => { cache[String(b.id)] = b; });

        if (!list.length) {
          status.textContent = 'No public-domain books found.';
          return;
        }
        status.textContent = `Found ${data.count} result(s).`;
        results.innerHTML = list.map(b => `
          <article class="reader-result">
            <div>
              <h3>${esc(b.title)}</h3>
              <p>${esc((b.authors[0] || {}).name || 'Unknown author')}</p>
            </div>
            <button class="btn btn-outline" type="button" data-open-book="${b.id}">Open</button>
          </article>`).join('');
      })
      .catch(() => { status.textContent = 'Could not reach the public catalogue.'; })
      .finally(() => status.classList.remove('loading'));
  });

  results.addEventListener('click', e => {
    const btn = e.target.closest('[data-open-book]');
    if (!btn) return;
    openBook(cache[btn.dataset.openBook]);
  });

  function openBook(book) {
    if (!book) return;
    const plain = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'];
    if (!plain) { showToast('No plain-text edition for this book.'); return; }

    status.textContent = 'Downloading text…';
    status.classList.add('loading');

    fetch(plain)
      .then(res => { if (!res.ok) throw new Error('Network'); return res.text(); })
      .then(text => {
        if (text.length > 300000) text = text.slice(0, 300000) + '\n\nThe text has been shortened for this demo.';
        activeBook = book;
        if (titleEl) titleEl.textContent = book.title;
        if (authorEl) authorEl.textContent = (book.authors || []).map(a => a.name).join(', ') || 'Unknown author';
        renderText(text, book);
        content.hidden = false;
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
        status.textContent = '';
      })
      .catch(() => {
        status.innerHTML = `Could not download automatically. <a href="${esc(plain)}" target="_blank" rel="noopener">Open the text edition ↗</a>`;
      })
      .finally(() => status.classList.remove('loading'));
  }

  function renderText(text, book) {
    const savedHtml = localStorage.getItem('dbc-reader-html-' + book.id);
    if (savedHtml) {
      textEl.innerHTML = savedHtml;
    } else {
      const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).slice(0, 500);
      textEl.innerHTML = paras.map((p, i) => `
        <p class="reader-p" data-p="${i}">
          <button class="bookmark-btn" type="button" data-bookmark="${i}" aria-label="Bookmark paragraph ${i + 1}">☆</button>
          <span class="para-text">${esc(p)}</span>
        </p>`).join('');
    }
    const bm = Store.get('dbc-reader-bm-' + book.id, []);
    $$('.bookmark-btn', textEl).forEach((b, i) => {
      const on = bm.includes(i);
      b.classList.toggle('active', on);
      b.textContent = on ? '★' : '☆';
    });
    applyReaderPrefs();
  }

  $$('.hl-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.hl-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    textEl.dataset.color = btn.dataset.color;
  }));
  if (!textEl.dataset.color) textEl.dataset.color = 'yellow';

  document.addEventListener('mouseup', () => {
    if (!content || content.hidden) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!textEl.contains(range.commonAncestorContainer)) return;

    const paraOf = node => {
      const el = node.nodeType === 1 ? node : node.parentElement;
      return el ? el.closest('.para-text') : null;
    };
    const startPara = paraOf(range.startContainer);
    const endPara   = paraOf(range.endContainer);
    if (!startPara || startPara !== endPara) {
      showToast('Highlight within a single paragraph.');
      sel.removeAllRanges();
      return;
    }

    try {
      const mark = document.createElement('mark');
      mark.className = 'hl-' + (textEl.dataset.color || 'yellow');
      mark.appendChild(range.extractContents());
      range.insertNode(mark);
      sel.removeAllRanges();
      persistHtml();
      playTone(640, 0.05);
    } catch (err) {
      showToast('Select a smaller piece of text.');
    }
  });

  textEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-bookmark]');
    if (!btn || !activeBook) return;
    const idx = Number(btn.dataset.bookmark);
    const key = 'dbc-reader-bm-' + activeBook.id;
    const arr = Store.get(key, []);
    const i = arr.indexOf(idx);
    if (i === -1) arr.push(idx); else arr.splice(i, 1);
    Store.set(key, arr);
    const on = arr.includes(idx);
    btn.classList.toggle('active', on);
    btn.textContent = on ? '★' : '☆';
    playTone(on ? 880 : 440, 0.06);
  });

  function persistHtml() {
    if (!activeBook) return;
    try { localStorage.setItem('dbc-reader-html-' + activeBook.id, textEl.innerHTML); } catch (e) {}
  }

  $$('[data-font]').forEach(btn => btn.addEventListener('click', () => {
    let size = parseInt(localStorage.getItem('dbc-reader-font') || '17', 10);
    size = Math.min(26, Math.max(13, size + Number(btn.dataset.font)));
    localStorage.setItem('dbc-reader-font', String(size));
    applyReaderPrefs();
  }));
  $$('[data-line]').forEach(btn => btn.addEventListener('click', () => {
    let lh = parseFloat(localStorage.getItem('dbc-reader-lh') || '1.85');
    lh = Math.min(2.4, Math.max(1.4, Number((lh + Number(btn.dataset.line)).toFixed(2))));
    localStorage.setItem('dbc-reader-lh', String(lh));
    applyReaderPrefs();
  }));

  function applyReaderPrefs() {
    textEl.style.fontSize = (localStorage.getItem('dbc-reader-font') || '17') + 'px';
    textEl.style.lineHeight = (localStorage.getItem('dbc-reader-lh') || '1.85');
  }

  const clearHl = document.getElementById('reader-clear-hl');
  if (clearHl) clearHl.addEventListener('click', () => {
    if (!activeBook) { showToast('Open a book first.'); return; }
    $$('mark', textEl).forEach(m => m.replaceWith(...Array.from(m.childNodes)));
    localStorage.removeItem('dbc-reader-html-' + activeBook.id);
    showToast('Highlights cleared');
  });

  const closeBtn = document.getElementById('reader-clear');
  if (closeBtn) closeBtn.addEventListener('click', () => {
    content.hidden = true;
    textEl.innerHTML = '';
    activeBook = null;
  });
}

/* -------------------- ABOUT -------------------- */
function initAboutReadMore() {
  const btn = document.getElementById('read-more-btn');
  const more = document.getElementById('about-more');
  if (!btn || !more) return;

  btn.addEventListener('click', () => {
    const isHidden = more.hidden;
    more.hidden = !isHidden;
    btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    btn.innerHTML = isHidden ? 'Read less <span>－</span>' : 'Read more <span>＋</span>';
  });
}

/* -------------------- ROUTER -------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initGlobalActions();
  initTheme();
  initMobileMenu();

  const page = document.body.dataset.page;
  const routes = {
    index: initHome,
    catalog: initCatalog,
    'book-details': initBookDetails,
    account: initAuth,
    profile: initProfile,
    pricing: initPricing,
    contact: initContactForm,
    reader: initReader,
    about: initAboutReadMore
  };
  if (routes[page]) routes[page]();
});
