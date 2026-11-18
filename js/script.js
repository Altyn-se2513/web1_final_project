document.addEventListener('DOMContentLoaded', () => {
  // 1. Глобальная инициализация для всех страниц
  initTheme();
  initMobileMenu();

  // 2. Определение текущей страницы по data-page в теге <body>
  const page = document.body.dataset.page;

  switch (page) {
    case 'index':
      initHomeApi();
      initQuotes();
      break;
    case 'catalog':
      initCatalog();
      break;
    case 'book-details':
      initBookDetails();
      break;
    case 'account':
      initAuth();
      break;
    case 'profile':
      initProfile();
      break;
    case 'pricing':
      initPricing();
      break;
    case 'contact':
      initContactForm();
      break;
    case 'reader':
      initReader();
      break;
    case 'about':
      initAboutReadMore();
      break;
  }
});

/* ==========================================
   1. ГЛОБАЛЬНЫЕ КОМПОНЕНТЫ (ТЕМА И МЕНЮ)
   ========================================== */

function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const iconSpan = toggleBtn.querySelector('.theme-icon');

  function updateIcon(theme) {
    if (iconSpan) {
      iconSpan.textContent = theme === 'dark' ? '☀' : '☾';
    }
  }

  const currentTheme = document.documentElement.dataset.theme || 'light';
  updateIcon(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.dataset.theme = next;
    localStorage.setItem('dbc-theme', next);
    updateIcon(next);
  });
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu');
  const mainNav = document.getElementById('main-nav');
  if (!menuBtn || !mainNav) return;

  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !expanded);
    mainNav.classList.toggle('show');
  });
}

/* ==========================================
   2. ГЛАВНАЯ СТРАНИЦА (index.html)
   ========================================== */

function initHomeApi() {
  const statusEl = document.getElementById('home-api-status');
  const resultsEl = document.getElementById('home-api-results');
  if (!resultsEl) return;

  fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=4')
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(data => {
      if (!data.items) {
        if (statusEl) statusEl.textContent = 'No recommendations found.';
        return;
      }
      if (statusEl) statusEl.remove();
      
      resultsEl.innerHTML = data.items.map(item => {
        const info = item.volumeInfo;
        const title = info.title || 'Untitled';
        const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
        const thumb = info.imageLinks ? info.imageLinks.thumbnail : 'images/favicon.svg';
        return `
          <article class="api-card" style="display:flex; gap:12px; align-items:center; background:var(--card-bg); padding:12px; border-radius:8px; border:1px solid var(--border-color);">
            <img src="${thumb}" alt="${title}" style="width:50px; height:70px; object-fit:cover; border-radius:4px;">
            <div>
              <h3 style="font-size:1rem; margin-bottom:4px;">${title}</h3>
              <p style="font-size:0.85rem; opacity:0.8; margin:0;">${authors}</p>
            </div>
          </article>
        `;
      }).join('');
    })
    .catch(err => {
      if (statusEl) statusEl.textContent = 'Could not load live recommendations right now.';
      console.error(err);
    });
}

function initQuotes() {
  // Дополнительная логика цитат при необходимости
}

/* ==========================================
   3. КАТАЛОГ (catalog.html)
   ========================================== */

function initCatalog() {
  const searchInput = document.getElementById('catalog-search');
  const filterBtns = document.querySelectorAll('#genre-filters .filter-chip');
  
  if (!searchInput && !filterBtns.length) return;
  
  // Базовая интерактивность фильтров каталога
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ==========================================
   4. ДЕТАЛИ КНИГИ (book-details.html)
   ========================================== */

function initBookDetails() {
  const container = document.getElementById('book-detail');
  if (!container) return;
  // Рендеринг или логика отзывов / рейтинга
}

/* ==========================================
   5. АККАУНТ И ВАЛИДАЦИЯ (account.html)
   ========================================== */

function initAuth() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabs = document.querySelectorAll('.auth-tab');

  if (tabs.length && loginForm && signupForm) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.authTab;
        if (target === 'login') {
          loginForm.hidden = false;
          signupForm.hidden = true;
        } else {
          loginForm.hidden = true;
          signupForm.hidden = false;
        }
      });
    });
  }

  // Строгая кастомная валидация по ТЗ (novalidate)
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const name = document.getElementById('signup-name');
      const email = document.getElementById('signup-email');
      const phone = document.getElementById('signup-phone');
      const password = document.getElementById('signup-password');
      const confirm = document.getElementById('signup-confirm');

      // 1. Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailOk = emailRegex.test(email.value.trim());
      setError('signup-email', !emailOk ? 'Invalid email format.' : '');
      if (!emailOk) isValid = false;

      // 2. Phone pattern (7-20 символов, цифры, +, пробелы, дефисы)
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
      const phoneOk = phoneRegex.test(phone.value.trim());
      setError('signup-phone', !phoneOk ? 'Invalid phone number (7-20 digits, +, spaces allowed).' : '');
      if (!phoneOk) isValid = false;

      // 3. Password strength (минимум 8 символов, 1 заглавная, 1 строчная, 1 цифра)
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      const passOk = passRegex.test(password.value);
      setError('signup-password', !passOk ? 'Weak password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit.' : '');
      if (!passOk) isValid = false;

      // 4. Confirm Password
      const matchOk = password.value === confirm.value;
      setError('signup-confirm', !matchOk ? 'Passwords do not match.' : '');
      if (!matchOk) isValid = false;

      if (isValid) {
        const userData = {
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          goal: 20
        };
        localStorage.setItem('dbc-user', JSON.stringify(userData));
        window.location.href = 'profile.html';
      }
    });
  }
}

function setError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) errorEl.textContent = message;
}

/* ==========================================
   6. ПРОФИЛЬ (profile.html)
   ========================================== */

function initProfile() {
  const root = document.getElementById('profile-root');
  if (!root) return;

  const user = JSON.parse(localStorage.getItem('dbc-user')) || {
    name: 'Curious Reader',
    email: 'reader@example.com',
    goal: 20
  };

  root.innerHTML = `
    <div class="profile-card" style="background:var(--card-bg); padding:24px; border-radius:12px; border:1px solid var(--border-color);">
      <h2>Welcome back, ${user.name}!</h2>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone || 'Not specified'}</p>
      <p><strong>Daily Reading Goal:</strong> ${user.goal} minutes</p>
      <a href="index.html" class="btn btn-primary" style="margin-top:16px;">Back to home</a>
    </div>
  `;
}

/* ==========================================
   7. ЦЕНЫ (pricing.html)
   ========================================== */

function initPricing() {
  const billingBtns = document.querySelectorAll('.billing-btn');
  if (!billingBtns.length) return;

  billingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      billingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const period = btn.dataset.period;

      document.querySelectorAll('.price strong').forEach(priceEl => {
        const val = priceEl.dataset[period];
        if (val !== undefined) {
          priceEl.textContent = val === '0' ? '$0' : `$${val}`;
        }
      });
    });
  });
}

/* ==========================================
   8. КОНТАКТЫ (contact.html)
   ========================================== */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const feedback = document.getElementById('contact-feedback');
    if (feedback) {
      feedback.textContent = 'Thank you! Your message has been sent successfully.';
      feedback.style.color = 'var(--accent, #2563EB)';
    }
    form.reset();
  });
}

/* ==========================================
   9. ЧИТАЛКА (reader.html)
   ========================================== */

function initReader() {
  const form = document.getElementById('reader-form');
  const statusEl = document.getElementById('reader-status');
  const resultsEl = document.getElementById('reader-results');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('reader-query').value.trim();
    if (!query) return;

    if (statusEl) statusEl.textContent = 'Searching public catalogue...';
    if (resultsEl) resultsEl.innerHTML = '';

    fetch(`https://gutendex.com/books?search=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.results || data.results.length === 0) {
          if (statusEl) statusEl.textContent = 'No public domain books found.';
          return;
        }
        if (statusEl) statusEl.textContent = `Found results:`;
        
        resultsEl.innerHTML = data.results.slice(0, 4).map(book => `
          <div class="reader-book-item" style="background:var(--card-bg); padding:16px; margin-bottom:12px; border-radius:8px; border:1px solid var(--border-color);">
            <h3>${book.title}</h3>
            <p>${book.authors.map(a => a.name).join(', ')}</p>
            <a href="${book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'] || '#'}" target="_blank" class="btn btn-sm btn-outline">Read text edition</a>
          </div>
        `).join('');
      })
      .catch(err => {
        if (statusEl) statusEl.textContent = 'Failed to fetch books.';
        console.error(err);
      });
  });
}

/* ==========================================
   10. О НАС (about.html)
   ========================================== */

function initAboutReadMore() {
  const btn = document.getElementById('read-more-btn');
  const more = document.getElementById('about-more');
  if (!btn || !more) return;

  btn.addEventListener('click', () => {
    const isHidden = more.hidden;
    more.hidden = !isHidden;
    btn.setAttribute('aria-expanded', isHidden);
    btn.innerHTML = isHidden ? 'Read less <span>－</span>' : 'Read more <span>＋</span>';
  });
}