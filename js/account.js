(function () {
  var USERS_KEY   = 'bc_users';
  var SESSION_KEY = 'bc_session_email';
  var SHELF_KEY   = 'bc_shelf';
  var READING_KEY = 'bc_reading';
  var DAYS_KEY    = 'bc_readDays';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[0-9\s\-()]{7,15}$/;

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function currentUser() {
    var email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    return getUsers().find(function (u) { return u.email === email; }) || null;
  }

  function validatePassword(p) {
    return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);
  }

  var escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  };

  function localDate(dt) {
    dt = dt || new Date();
    var y = dt.getFullYear();
    var m = String(dt.getMonth() + 1).padStart(2, '0');
    var d = String(dt.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  /* Tab switching */
  (function () {
    var tabLogin = document.getElementById('tab-login');
    var tabReg   = document.getElementById('tab-register');
    var loginSec = document.getElementById('login-section');
    var regSec   = document.getElementById('register-section');
    var linkReg  = document.getElementById('link-to-register');
    var linkLog  = document.getElementById('link-to-login');
    if (!loginSec || !regSec) return;

    function showLogin() {
      loginSec.hidden = false;
      regSec.hidden = true;
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
    }
    function showReg() {
      loginSec.hidden = true;
      regSec.hidden = false;
      if (tabReg) tabReg.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
    }

    if (tabLogin) tabLogin.addEventListener('click', showLogin);
    if (tabReg) tabReg.addEventListener('click', showReg);
    if (linkReg) linkReg.addEventListener('click', function (e) { e.preventDefault(); showReg(); });
    if (linkLog) linkLog.addEventListener('click', function (e) { e.preventDefault(); showLogin(); });
  })();

  /* Register */
  (function () {
    var form = document.getElementById('register-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = document.getElementById('register-error');
      var name = document.getElementById('reg-name').value.trim();
      var email = document.getElementById('reg-email').value.trim();
      var phone = document.getElementById('reg-phone').value.trim();
      var password = document.getElementById('reg-password').value;
      var confirm = document.getElementById('reg-password-confirm').value;
      var terms = document.getElementById('reg-terms').checked;
      var genre = document.getElementById('reg-genre').value;
      var goal = document.getElementById('reg-goal').value.trim();

      var errors = [];
      if (!name) errors.push('Name is required.');
      else if (name.length < 2) errors.push('Name must be at least 2 characters.');
      if (!email) errors.push('Email is required.');
      else if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');
      if (!phone) errors.push('Phone is required.');
      else if (!PHONE_RE.test(phone)) errors.push('Enter a valid phone number (7–15 digits, optional +, spaces, dashes, parentheses).');
      if (!password) errors.push('Password is required.');
      else if (!validatePassword(password)) errors.push('Password must be at least 8 characters and include uppercase, lowercase and a digit.');
      if (password !== confirm) errors.push('Passwords do not match.');
      if (!terms) errors.push('You must agree to the terms.');
      if (goal) {
        var goalNum = parseInt(goal, 10);
        if (isNaN(goalNum) || goalNum < 5 || goalNum > 180) {
          errors.push('Daily goal must be between 5 and 180 minutes.');
        }
      }
      if (errors.length) {
        errBox.innerHTML = errors.map(function (m) { return '• ' + m; }).join('<br>');
        errBox.hidden = false;
        if (window.Sound) window.Sound.playBeep(250, 0.12, 'square');
        return;
      }

      var users = getUsers();
      if (users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
        errBox.textContent = 'An account with this email already exists. Try logging in.';
        errBox.hidden = false;
        return;
      }
      users.push({
        name: name, email: email, phone: phone, password: password,
        genre: genre, goal: goal || '20', since: new Date().toISOString()
      });
      saveUsers(users);

      errBox.hidden = true;
      if (window.Sound) window.Sound.playBeep(900, 0.12);
      if (window.showToast) window.showToast('✓ Account created! Please log in.', 'success');

      form.reset();
      document.getElementById('tab-login').click();
      document.getElementById('login-email').value = email;
    });
  })();

  /* Login */
  (function () {
    var form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = document.getElementById('login-error');
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;

      errBox.hidden = true;
      if (!email || !password) {
        errBox.textContent = 'Please enter your email and password.';
        errBox.hidden = false;
        return;
      }
      if (!EMAIL_RE.test(email)) {
        errBox.textContent = 'Please enter a valid email address.';
        errBox.hidden = false;
        return;
      }

      var users = getUsers();
      var user = users.find(function (u) {
        return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
      });
      if (!user) {
        errBox.textContent = 'Wrong email or password.';
        errBox.hidden = false;
        if (window.Sound) window.Sound.playBeep(250, 0.12, 'square');
        return;
      }
      localStorage.setItem(SESSION_KEY, user.email);
      if (window.Sound) window.Sound.playBeep(1000, 0.12);
      if (window.showToast) window.showToast('✓ Welcome back, ' + user.name + '!', 'success');
      form.reset();
      renderProfile();
    });
  })();

  /* Logout */
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'logout-btn') {
      localStorage.removeItem(SESSION_KEY);
      if (window.showToast) window.showToast('Logged out.', 'info');
      renderProfile();
    }
  });

  /* Forgot password (demo) */
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'forgot-password-link') {
      e.preventDefault();
      var email = document.getElementById('login-email').value.trim();
      var errBox = document.getElementById('login-error');
      if (!email || !EMAIL_RE.test(email)) {
        errBox.textContent = 'Enter your email above first.';
        errBox.hidden = false;
        return;
      }
      errBox.hidden = true;
      if (window.showToast) window.showToast('Demo: password reset would be emailed to ' + email, 'info');
    }
  });

  /* Shelf + Reading + Streak */
  function getShelf() { return JSON.parse(localStorage.getItem(SHELF_KEY) || '[]'); }
  function setShelf(a) { localStorage.setItem(SHELF_KEY, JSON.stringify(a)); }
  function getReading() { return JSON.parse(localStorage.getItem(READING_KEY) || '[]'); }
  function setReading(a) { localStorage.setItem(READING_KEY, JSON.stringify(a)); }
  function getDays() { return JSON.parse(localStorage.getItem(DAYS_KEY) || '[]'); }
  function setDays(a) { localStorage.setItem(DAYS_KEY, JSON.stringify(a)); }

  function renderShelf() {
    var grid = document.getElementById('my-shelf');
    if (!grid) return;
    var shelf = getShelf();
    if (!shelf.length) {
      grid.innerHTML = '<p class="empty-msg p-3">No books yet. <a href="book-details.html">Add some from the catalog</a>.</p>';
      return;
    }
    grid.innerHTML = shelf.map(function (b) {
      return '<div class="shelf-item p-2">' +
        '<img src="' + escapeHtml(b.cover || 'imgs/logo.png') + '" alt="' + escapeHtml(b.title) + ' cover">' +
        '<div class="shelf-item-info"><h4>' + escapeHtml(b.title) + '</h4><p>' + escapeHtml(b.author || '') + '</p></div>' +
        '<button class="btn btn-sm btn-outline-danger shelf-remove" data-id="' + b.id + '" aria-label="Remove">✕</button>' +
        '</div>';
    }).join('');
    grid.querySelectorAll('.shelf-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setShelf(getShelf().filter(function (x) { return x.id !== btn.dataset.id; }));
        renderShelf();
        if (window.Sound) window.Sound.playBeep(400, 0.08);
      });
    });
  }

  function renderReading() {
    var box = document.getElementById('my-books');
    if (!box) return;
    var books = getReading();
    if (!books.length) {
      box.innerHTML = '<p class="empty-msg p-3">No books in progress. Add one below.</p>';
      return;
    }
    box.innerHTML = books.map(function (b) {
      var pct = b.total > 0 ? Math.min(100, Math.round((b.current / b.total) * 100)) : 0;
      return '<div class="book-item p-3">' +
        '<div class="book-item-info">' +
        '<h4 class="mb-1">' + escapeHtml(b.title) + '</h4>' +
        '<p class="book-item-author mb-1">' + escapeHtml(b.author || 'Unknown') + '</p>' +
        '<p class="book-item-progress mb-1">Page ' + b.current + ' of ' + (b.total || '?') + ' — ' + pct + '%</p>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div class="book-item-actions">' +
        '<button class="btn btn-sm btn-outline-primary" data-inc="' + b.id + '">+10</button>' +
        '<button class="btn btn-sm btn-outline-secondary" data-dec="' + b.id + '">−10</button>' +
        '<button class="btn btn-sm btn-outline-danger" data-del="' + b.id + '" aria-label="Remove">✕</button>' +
        '</div></div>';
    }).join('');

    box.querySelectorAll('[data-inc]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var books = getReading();
        var b = books.find(function (x) { return x.id === btn.dataset.inc; });
        if (b) {
          b.current = Math.min(b.total || (b.current + 10), b.current + 10);
          setReading(books);
          renderReading();
          if (window.Sound) window.Sound.playBeep(700, 0.06);
        }
      });
    });
    box.querySelectorAll('[data-dec]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var books = getReading();
        var b = books.find(function (x) { return x.id === btn.dataset.dec; });
        if (b) { b.current = Math.max(0, b.current - 10); setReading(books); renderReading(); }
      });
    });
    box.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setReading(getReading().filter(function (x) { return x.id !== btn.dataset.del; }));
        renderReading();
      });
    });
  }

  function updateStreakUI() {
    var days = getDays();
    var set = new Set(days);
    var current = 0;
    var d = new Date();
    if (!set.has(localDate(d))) d.setDate(d.getDate() - 1);
    while (set.has(localDate(d))) { current++; d.setDate(d.getDate() - 1); }

    var sorted = Array.from(set).sort();
    var best = 0, cur = 0, prev = null;
    sorted.forEach(function (s) {
      var date = new Date(s + 'T00:00:00');
      if (prev && (date - prev) / 86400000 === 1) cur++; else cur = 1;
      if (cur > best) best = cur;
      prev = date;
    });

    var total = set.size;
    function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
    setText('streak-count', current);
    setText('stat-current', current);
    setText('stat-current-2', current);
    setText('stat-best', best);
    setText('stat-best-2', best);
    setText('stat-total', total);
    setText('stat-total-2', total);
    setText('hero-streak', current);

    var msgEl = document.getElementById('streak-message');
    if (msgEl) {
      if (current === 0) msgEl.textContent = 'Log your first 20-min session today.';
      else if (current === 1) msgEl.textContent = 'Great start! Come back tomorrow.';
      else if (current < 7) msgEl.textContent = current + ' days in a row! Keep going.';
      else msgEl.textContent = current + '-day streak! You\'re on fire!';
    }

    var cal = document.getElementById('streak-calendar');
    if (cal) {
      cal.innerHTML = '';
      var today = new Date();
      for (var i = 27; i >= 0; i--) {
        var dt = new Date(today);
        dt.setDate(dt.getDate() - i);
        var iso = localDate(dt);
        var cell = document.createElement('div');
        cell.className = 'cal-cell';
        if (set.has(iso)) cell.classList.add('active');
        if (i === 0) cell.classList.add('today');
        cell.textContent = dt.getDate();
        cell.title = iso;
        cal.appendChild(cell);
      }
    }
  }

  function renderProfile() {
    var user = currentUser();
    var authSec = document.getElementById('auth-section');
    var profSec = document.getElementById('profile-section');
    if (!authSec || !profSec) return;

    if (!user) {
      authSec.hidden = false;
      profSec.hidden = true;
      return;
    }
    authSec.hidden = true;
    profSec.hidden = false;

    var setText = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    setText('user-name', user.name);
    setText('acc-name', user.name);
    setText('acc-email', user.email);
    setText('acc-phone', user.phone || '—');
    setText('acc-genre', user.genre || '—');
    setText('acc-goal', user.goal || '20');
    if (user.since) {
      setText('acc-since', new Date(user.since).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    } else {
      setText('acc-since', '—');
    }

    updateStreakUI();
    renderShelf();
    renderReading();
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderProfile();

    var streakToggle = document.getElementById('streak-toggle');
    var streakPanel = document.getElementById('streak-panel');
    if (streakToggle && streakPanel) {
      streakToggle.addEventListener('click', function () {
        streakPanel.hidden = !streakPanel.hidden;
        streakToggle.setAttribute('aria-expanded', String(!streakPanel.hidden));
        if (window.Sound) window.Sound.playBeep(700, 0.05);
      });
    }

    var logBtn = document.getElementById('log-read-btn');
    if (logBtn) {
      logBtn.addEventListener('click', function () {
        if (!currentUser()) {
          if (window.showToast) window.showToast('Please log in first.', 'error');
          return;
        }
        var today = localDate();
        var days = getDays();
        if (days.indexOf(today) !== -1) {
          if (window.showToast) window.showToast('Already logged for today.', 'info');
          return;
        }
        days.push(today);
        setDays(days);
        updateStreakUI();
        if (window.Sound) window.Sound.playBeep(1100, 0.15);
        if (window.showToast) window.showToast('🔥 Streak updated!', 'success');
      });
    }

    var addForm = document.getElementById('add-book-form');
    if (addForm) {
      addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var title = document.getElementById('book-title').value.trim();
        var author = document.getElementById('book-author').value.trim();
        var total = parseInt(document.getElementById('book-total').value, 10) || 0;
        var current = parseInt(document.getElementById('book-current').value, 10) || 0;
        if (!title) {
          if (window.showToast) window.showToast('Book title is required.', 'error');
          return;
        }
        var books = getReading();
        books.push({ id: 'book_' + Date.now(), title: title, author: author, total: total, current: current, updatedAt: Date.now() });
        setReading(books);
        addForm.reset();
        renderReading();
        if (window.Sound) window.Sound.playBeep(800, 0.1);
        if (window.showToast) window.showToast('✓ Book added.', 'success');
      });
    }
  });
})();