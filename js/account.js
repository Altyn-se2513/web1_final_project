(function () {
  'use strict';

  // Константы для ключей LocalStorage (вынесены для удобства)
  var USERS_KEY   = 'bc_users';
  var SESSION_KEY = 'bc_session_email';
  var SHELF_KEY   = 'bc_shelf';
  var READING_KEY = 'bc_reading';
  var DAYS_KEY    = 'bc_readDays';

  // Регулярные выражения для валидации
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

  // --- Вспомогательные функции ---
  function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (e) { return []; } }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  
  function currentUser() {
    var email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    return getUsers().find(function (u) { return u.email === email; }) || null;
  }
  
  // Защита от XSS при вставке текста в HTML
  function escapeHtml(s) { 
    return String(s).replace(/[&<>"']/g, function (c) { 
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; 
    }); 
  }

  function validatePassword(p) { return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p); }
  
  function localDate(dt) { 
    dt = dt || new Date(); 
    var y = dt.getFullYear(); 
    var m = String(dt.getMonth() + 1).padStart(2, '0'); 
    var d = String(dt.getDate()).padStart(2, '0'); 
    return y + '-' + m + '-' + d; 
  }

  // --- Логика вкладок (Login / Register) ---
  var tabLogin = document.getElementById('tab-login');
  var tabReg   = document.getElementById('tab-register');
  var loginSec = document.getElementById('login-section');
  var regSec   = document.getElementById('register-section');
  
  if (tabLogin && tabReg) {
    tabLogin.addEventListener('click', function () { 
      loginSec.hidden = false; regSec.hidden = true; 
      tabLogin.classList.add('active'); tabReg.classList.remove('active'); 
    });
    tabReg.addEventListener('click', function () { 
      loginSec.hidden = true; regSec.hidden = false; 
      tabReg.classList.add('active'); tabLogin.classList.remove('active'); 
    });
  }

  // --- Логика регистрации ---
  var rForm = document.getElementById('register-form');
  if (rForm) {
    rForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = document.getElementById('register-error');
      var name = document.getElementById('reg-name').value.trim();
      var email = document.getElementById('reg-email').value.trim();
      var phone = document.getElementById('reg-phone').value.trim();
      var password = document.getElementById('reg-password').value;
      var confirm = document.getElementById('reg-password-confirm').value;
      var terms = document.getElementById('reg-terms').checked;

      var errors = [];
      if (!name) errors.push('Name required.');
      if (!EMAIL_RE.test(email)) errors.push('Invalid email format.');
      if (!PHONE_RE.test(phone)) errors.push('Invalid phone number.');
      if (!validatePassword(password)) errors.push('Weak password (min 8 chars, 1 Upper, 1 lower, 1 digit).');
      if (password !== confirm) errors.push('Passwords do not match.');
      if (!terms) errors.push('You must agree to terms.');

      if (errors.length) { 
        errBox.innerHTML = errors.join('<br>'); 
        errBox.hidden = false; 
        return; 
      }
      
      var users = getUsers();
      if (users.some(function (u) { return u.email === email; })) { 
        errBox.textContent = 'Email already exists.'; 
        errBox.hidden = false; 
        return; 
      }
      
      // Сохранение пользователя
      users.push({ 
        name: name, email: email, phone: phone, password: password, 
        genre: document.getElementById('reg-genre').value, 
        since: new Date().toISOString() 
      });
      saveUsers(users);
      
      // Переключение на логин и автозаполнение
      rForm.reset(); 
      tabLogin.click(); 
      document.getElementById('login-email').value = email;
    });
  }

  // --- Логика входа ---
  var lForm = document.getElementById('login-form');
  if (lForm) {
    lForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = document.getElementById('login-error');
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      
      var user = getUsers().find(function (u) { return u.email === email && u.password === password; });
      if (!user) { 
        errBox.textContent = 'Wrong email or password.'; 
        errBox.hidden = false; 
        return; 
      }
      
      localStorage.setItem(SESSION_KEY, user.email);
      lForm.reset(); 
      renderProfile();
    });
  }

  // --- Выход из аккаунта ---
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'logout-btn') {
      localStorage.removeItem(SESSION_KEY); 
      renderProfile();
    }
  });

  // --- Отрисовка профиля ---
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

    // Заполнение текстовых данных
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('acc-name').textContent = user.name;
    document.getElementById('acc-email').textContent = user.email;
    document.getElementById('acc-phone').textContent = user.phone;
    document.getElementById('acc-genre').textContent = user.genre;
    
    // Форматирование даты регистрации
    if (user.since && document.getElementById('acc-since')) {
      var dateObj = new Date(user.since);
      document.getElementById('acc-since').textContent = dateObj.toLocaleDateString('en-GB', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
    }
    
    // Аватар через DiceBear API
    document.getElementById('user-avatar').src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(user.name);

    // Загрузка полки (Books Saved)
    var shelf = JSON.parse(localStorage.getItem(SHELF_KEY) || '[]');
    var shelfCountEl = document.getElementById('my-shelf-count');
    if(shelfCountEl) shelfCountEl.textContent = shelf.length;

    var shelfHtml = '';
    if (shelf.length === 0) {
      shelfHtml = '<p class="text-muted text-center w-100 mt-3">Your shelf is empty. Add some books from the catalog!</p>';
    } else {
      shelfHtml = shelf.map(function (b) {
        // Защита от XSS!
        var safeTitle = escapeHtml(b.title);
        var safeCover = escapeHtml(b.cover);
        return '<div class="shelf-item p-2"><img src="' + safeCover + '" alt="Cover"><div class="shelf-item-info"><h4>' + safeTitle + '</h4></div></div>';
      }).join('');
    }
    if(document.getElementById('my-shelf')) document.getElementById('my-shelf').innerHTML = shelfHtml;

    // Загрузка статистики чтения (Streak)
    var days = JSON.parse(localStorage.getItem(DAYS_KEY) || '[]');
    var totalDaysEl = document.getElementById('stat-total-2');
    if (totalDaysEl) totalDaysEl.textContent = days.length;
    
    // Простой расчет лучшего стрика (можно улучшить при необходимости)
    var bestStreak = days.length > 0 ? days.length : 0; 
    var bestStreakEl = document.getElementById('stat-best-2');
    if (bestStreakEl) bestStreakEl.textContent = bestStreak;

    var heroStreakEl = document.getElementById('hero-streak');
    if (heroStreakEl) heroStreakEl.textContent = days.length + ' Day Streak';
  }

  // --- Смена акцентного цвета ---
  var picker = document.getElementById('theme-color');
  if (picker) {
    var saved = localStorage.getItem('bc_accent');
    if (saved) picker.value = saved;
    picker.addEventListener('input', function (e) {
      document.documentElement.style.setProperty('--primary', e.target.value);
      localStorage.setItem('bc_accent', e.target.value);
    });
  }

  // --- Кнопка "I read today" ---
  var logBtn = document.getElementById('log-read-btn');
  if (logBtn) {
    logBtn.addEventListener('click', function () {
      if (!currentUser()) {
         alert('Please log in first!');
         return;
      }
      var today = localDate();
      var days = JSON.parse(localStorage.getItem(DAYS_KEY) || '[]');
      
      if (!days.includes(today)) {
        days.push(today);
        localStorage.setItem(DAYS_KEY, JSON.stringify(days));
        renderProfile(); // Обновляем UI
        if (window.showToast) window.showToast('🔥 Streak updated!', 'success');
      } else {
        if (window.showToast) window.showToast('Already logged today!', 'info');
      }
    });
  }

  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', renderProfile);
})();