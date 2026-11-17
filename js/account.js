(function () {
  'use strict';

  var USERS_KEY   = 'bc_users';
  var SESSION_KEY = 'bc_session_email';
  var SHELF_KEY   = 'bc_shelf';
  var DAYS_KEY    = 'bc_readDays';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function validatePassword(p) {
    return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);
  }

  function localDate(dt) {
    dt = dt || new Date();
    var y = dt.getFullYear();
    var m = String(dt.getMonth() + 1).padStart(2, '0');
    var d = String(dt.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  // Calculate real consecutive-day streak
  function calculateStreak(days) {
    if (!days.length) return { current: 0, best: 0 };
    var sorted = days
      .map(function (d) { return new Date(d + 'T00:00:00'); })
      .sort(function (a, b) { return a - b; });

    var best = 1, streak = 1;
    for (var i = 1; i < sorted.length; i++) {
      var diff = (sorted[i] - sorted[i - 1]) / 86400000;
      if (diff === 1) { streak++; }
      else if (diff > 1) { streak = 1; }
      if (streak > best) best = streak;
    }

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var last = sorted[sorted.length - 1];
    var lastDiff = (today - last) / 86400000;
    var current = 0;
    if (lastDiff <= 1) {
      current = 1;
      for (var j = sorted.length - 1; j > 0; j--) {
        if ((sorted[j] - sorted[j - 1]) / 86400000 === 1) current++;
        else break;
      }
    }
    return { current: current, best: best };
  }

  // Auth tabs
  var tabLogin = document.getElementById('tab-login');
  var tabReg   = document.getElementById('tab-register');
  var loginSec = document.getElementById('login-section');
  var regSec   = document.getElementById('register-section');

  if (tabLogin && tabReg && loginSec && regSec) {
    tabLogin.addEventListener('click', function () {
      loginSec.hidden = false; regSec.hidden = true;
      tabLogin.classList.add('active'); tabReg.classList.remove('active');
    });
    tabReg.addEventListener('click', function () {
      loginSec.hidden = true; regSec.hidden = false;
      tabReg.classList.add('active'); tabLogin.classList.remove('active');
    });
  }

  // Registration
  var rForm = document.getElementById('register-form');
  if (rForm) {
    rForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = document.getElementById('register-error');
      if (!errBox) return;
      var name = document.getElementById('reg-name').value.trim();
      var email = document.getElementById('reg-email').value.trim();
      var phone = document.getElementById('reg-phone').value.trim();
      var password = document.getElementById('reg-password').value;
      var confirm = document.getElementById('reg-password-confirm').value;
      var terms = document.getElementById('reg-terms').checked;

      var errors = [];
      if (!name) errors.push('Name required.');
      if (!EMAIL_RE.test(email)) errors.push('Invalid email format.');
      if (!PHONE_RE.test(phone)) errors.push('Invalid phone number (7–20 digits, +, spaces, dashes allowed).');
      if (!validatePassword(password)) errors.push('Weak password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit.');
      if (password !== confirm) errors.push('Passwords do not match.');
      if (!terms) errors.push('You must agree to the terms.');

      if (errors.length) {
        errBox.innerHTML = errors.map(function (m) { return '• ' + escapeHtml(m); }).join('<br>');
        errBox.hidden = false;
        return;
      }

      var users = getUsers();
      if (users.some(function (u) { return u.email === email; })) {
        errBox.textContent = 'Email already exists.';
        errBox.hidden = false;
        return;
      }

      users.push({
        name: name, email: email, phone: phone, password: password,
        genre: document.getElementById('reg-genre').value,
        since: new Date().toISOString()
      });
      saveUsers(users);

      rForm.reset();
      if (tabLogin) tabLogin.click();
      var loginEmail = document.getElementById('login-email');
      if (loginEmail) loginEmail.value = email;
      if (window.showToast) window.showToast('Account created! Please log in.', 'success');
    });
  }

  // Login
  var lForm = document.getElementById('login-form');
  if (lForm) {
    lForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = document.getElementById('login-error');
      if (!errBox) return;
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;

      var user = getUsers().find(function (u) {
        return u.email === email && u.password === password;
      });
      if (!user) {
        errBox.textContent = 'Wrong email or password.';
        errBox.hidden = false;
        return;
      }

      localStorage.setItem(SESSION_KEY, user.email);
      lForm.reset();
      renderProfile();
      if (window.showToast) window.showToast('Welcome back, ' + user.name + '!', 'success');
    });
  }

  // Logout
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'logout-btn') {
      localStorage.removeItem(SESSION_KEY);
      renderProfile();
      if (window.showToast) window.showToast('Logged out.', 'info');
    }
  });

  // Profile rendering
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

    var nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = user.name;
    var accName = document.getElementById('acc-name');
    if (accName) accName.textContent = user.name;
    var accEmail = document.getElementById('acc-email');
    if (accEmail) accEmail.textContent = user.email;
    var accPhone = document.getElementById('acc-phone');
    if (accPhone) accPhone.textContent = user.phone;
    var accGenre = document.getElementById('acc-genre');
    if (accGenre) accGenre.textContent = user.genre || '—';

    var accSince = document.getElementById('acc-since');
    if (accSince && user.since) {
      var dateObj = new Date(user.since);
      accSince.textContent = dateObj.toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    var avatar = document.getElementById('user-avatar');
    if (avatar) {
      avatar.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(user.name);
    }

    // Shelf
    var shelf = [];
    try { shelf = JSON.parse(localStorage.getItem(SHELF_KEY) || '[]'); } catch (e) {}
    var shelfCountEl = document.getElementById('my-shelf-count');
    if (shelfCountEl) shelfCountEl.textContent = shelf.length;

    var myShelf = document.getElementById('my-shelf');
    if (myShelf) {
      if (shelf.length === 0) {
        myShelf.innerHTML = '<p class="text-muted text-center w-100 mt-3">Your shelf is empty. Add some books from the catalog!</p>';
      } else {
        myShelf.innerHTML = shelf.map(function (b) {
          return '<div class="shelf-item p-2">' +
            '<img src="' + escapeHtml(b.cover || 'imgs/logo.png') + '" alt="Cover">' +
            '<div class="shelf-item-info"><h4>' + escapeHtml(b.title) + '</h4>' +
            '<p class="text-muted small mb-0">' + escapeHtml(b.author || '') + '</p></div>' +
            '</div>';
        }).join('');
      }
    }

    // Reading streak
    var days = [];
    try { days = JSON.parse(localStorage.getItem(DAYS_KEY) || '[]'); } catch (e) {}
    var streak = calculateStreak(days);

    var totalEl = document.getElementById('stat-total-2');
    if (totalEl) totalEl.textContent = days.length;
    var bestEl = document.getElementById('stat-best-2');
    if (bestEl) bestEl.textContent = streak.best;
    var heroEl = document.getElementById('hero-streak');
    if (heroEl) heroEl.textContent = streak.current + ' Day Streak';
  }

  // Accent colour picker
  var picker = document.getElementById('theme-color');
  if (picker) {
    var saved = localStorage.getItem('bc_accent');
    if (saved) picker.value = saved;
    picker.addEventListener('input', function (e) {
      document.documentElement.style.setProperty('--primary', e.target.value);
      localStorage.setItem('bc_accent', e.target.value);
    });
  }

  // "I read today" button
  var logBtn = document.getElementById('log-read-btn');
  if (logBtn) {
    logBtn.addEventListener('click', function () {
      if (!currentUser()) {
        if (window.showToast) window.showToast('Please log in first!', 'error');
        else alert('Please log in first!');
        return;
      }
      var today = localDate();
      var days = [];
      try { days = JSON.parse(localStorage.getItem(DAYS_KEY) || '[]'); } catch (e) {}
      if (days.indexOf(today) === -1) {
        days.push(today);
        localStorage.setItem(DAYS_KEY, JSON.stringify(days));
        renderProfile();
        if (window.showToast) window.showToast('Reading day logged!', 'success');
      } else {
        if (window.showToast) window.showToast('Already logged today.', 'info');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', renderProfile);
})();