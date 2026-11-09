(function () {
  function dayPart(hour) {
    switch (Math.floor(hour / 6)) {
      case 1:  return 'morning';
      case 2:  return 'afternoon';
      case 3:  return 'evening';
      default: return 'night';
    }
  }

  var greetEl = document.getElementById('greeting-message');
  if (greetEl) {
    var messages = {
      morning:   'Good morning! Start your day with a great book.',
      afternoon: 'Good afternoon! Take a reading break.',
      evening:   'Good evening! Time to relax with a story.',
      night:     'Good night! Read a few pages before sleep.'
    };
    greetEl.textContent = messages[dayPart(new Date().getHours())];
  }

  var btn = document.getElementById('greet-btn');
  var input = document.getElementById('greet-name');
  var out = document.getElementById('personal-greeting');
  if (btn && input && out) {
    function greet() {
      var name = input.value.trim();
      if (!name) { out.textContent = 'Please enter your name first.'; return; }
      out.textContent = 'Good ' + dayPart(new Date().getHours()) + ', ' + name + '! Ready for your next book?';
      out.style.transition = 'none';
      out.style.opacity = '0';
      setTimeout(function () {
        out.style.transition = 'opacity .3s';
        out.style.opacity = '1';
      }, 30);
      if (window.Sound) window.Sound.playBeep(700, 0.08);
      localStorage.setItem('bc_userName', name);
    }
    var saved = localStorage.getItem('bc_userName');
    if (saved) input.value = saved;
    btn.addEventListener('click', greet);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); greet(); }
    });
  }

  var mainImg = document.getElementById('gallery-main-img');
  var thumbs = document.querySelectorAll('.gallery-thumb');
  if (mainImg && thumbs.length) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-src');
        if (!src) return;
        mainImg.setAttribute('src', src);
        var img = thumb.querySelector('img');
        if (img && img.alt) mainImg.setAttribute('alt', img.alt);
        thumbs.forEach(function (t) { t.classList.remove('active-thumb'); });
        thumb.classList.add('active-thumb');
        if (window.Sound) window.Sound.playBeep(500, 0.05);
      });
    });
  }

  var quoteBtn = document.getElementById('random-quote-btn');
  var quoteDisplay = document.getElementById('random-quote-display');
  if (quoteBtn && quoteDisplay && window.QuoteLibrary) {
    quoteBtn.addEventListener('click', function () {
      window.Sound.playBeep(600, 0.08);
      window.QuoteLibrary.renderTo(quoteDisplay);
    });
  }

  var popup = document.getElementById('popup-overlay');
  var openBtn = document.getElementById('open-popup');
  var closeBtn = document.getElementById('close-popup');
  var popupForm = document.getElementById('popup-subscribe-form');
  var popupError = document.getElementById('popup-error');
  var popupEmail = document.getElementById('popup-email');

  function openPopup() {
    if (!popup) return;
    popup.hidden = false;
    document.body.style.overflow = 'hidden';
    if (popupEmail) popupEmail.focus();
  }
  function closePopup() {
    if (!popup) return;
    popup.hidden = true;
    document.body.style.overflow = '';
    if (popupError) popupError.hidden = true;
  }
  if (openBtn) openBtn.addEventListener('click', openPopup);
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (popup) {
    popup.addEventListener('click', function (e) { if (e.target === popup) closePopup(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !popup.hidden) closePopup();
    });
  }
  if (popupForm) {
    popupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = popupEmail ? popupEmail.value.trim() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (popupError) { popupError.textContent = 'Please enter a valid email address.'; popupError.hidden = false; }
        if (window.Sound) window.Sound.playBeep(250, 0.12, 'square');
        return;
      }
      if (window.Sound) window.Sound.playBeep(900, 0.1);
      if (window.showToast) window.showToast('Subscribed (demo).', 'success');
      popupForm.reset();
      closePopup();
    });
  }

  var nf = document.getElementById('newsletter-form');
  if (nf) {
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.Sound) window.Sound.playBeep(900, 0.1);
      if (window.showToast) window.showToast('Subscribed (demo).', 'success');
      nf.reset();
    });
  }

  try {
    function localDate(dt) {
      dt = dt || new Date();
      var y = dt.getFullYear();
      var m = String(dt.getMonth() + 1).padStart(2, '0');
      var day = String(dt.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + day;
    }
    var days = JSON.parse(localStorage.getItem('bc_readDays') || '[]');
    var set = new Set(days);
    var current = 0;
    var d = new Date();
    if (!set.has(localDate(d))) d.setDate(d.getDate() - 1);
    while (set.has(localDate(d))) { current++; d.setDate(d.getDate() - 1); }
    var streakEl = document.getElementById('hero-streak-preview');
    if (streakEl) streakEl.textContent = current;
  } catch (e) {}
})();