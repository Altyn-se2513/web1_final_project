window.escapeHtml = function (str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

/* Theme toggle */
(function () {
  var KEY = 'bc_theme';
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');

  function updateBtn() {
    if (!btn) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  updateBtn();

  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      root.style.removeProperty('--bg-page');
      updateBtn();
      if (window.Sound) window.Sound.playBeep(500, 0.06);
    });
  }
})();

/* Sound utility */
window.Sound = (function () {
  var ctx = null;
  var current = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playBeep(freq, dur, type) {
    freq = freq || 800;
    dur = dur || 0.1;
    type = type || 'sine';
    try {
      var c = getCtx();
      if (current) { try { current.stop(); } catch (e) {} }
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + dur);
      current = osc;
      osc.onended = function () {
        osc.disconnect();
        gain.disconnect();
        if (current === osc) current = null;
      };
    } catch (e) {}
  }

  return { playBeep: playBeep };
})();

/* QuoteLibrary */
window.QuoteLibrary = {
  quotes: [
    { text: 'So we beat on, boats against the current, borne back ceaselessly into the past.', author: 'F. Scott Fitzgerald, The Great Gatsby' },
    { text: 'Big Brother is watching you.', author: 'George Orwell, 1984' },
    { text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', author: 'Jane Austen, Pride and Prejudice' },
    { text: 'In a hole in the ground there lived a hobbit.', author: 'J.R.R. Tolkien, The Hobbit' },
    { text: 'A man can be destroyed but not defeated.', author: 'Ernest Hemingway, The Old Man and the Sea' },
    { text: 'When you want something, all the universe conspires in helping you to achieve it.', author: 'Paulo Coelho, The Alchemist' },
    { text: 'Pain and suffering are always inevitable for a large intelligence and a deep heart.', author: 'Fyodor Dostoevsky, Crime and Punishment' },
    { text: 'It was a pleasure to burn.', author: 'Ray Bradbury, Fahrenheit 451' }
  ],
  lastIndex: -1,
  getRandom: function () {
    var i;
    do { i = Math.floor(Math.random() * this.quotes.length); }
    while (i === this.lastIndex && this.quotes.length > 1);
    this.lastIndex = i;
    return this.quotes[i];
  },
  renderTo: function (el) {
    if (!el) return;
    var q = this.getRandom();
    el.innerHTML = '“' + window.escapeHtml(q.text) + '”<br><small class="text-muted">— ' + window.escapeHtml(q.author) + '</small>';
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(function () {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50);
  }
};

/* FAQ Accordion (pricing) */
(function () {
  var headers = document.querySelectorAll('.accordion-header');
  if (!headers.length) return;

  function closeItem(item) {
    item.classList.remove('active');
    var content = item.querySelector('.accordion-content');
    var header = item.querySelector('.accordion-header');
    if (content) content.style.maxHeight = null;
    if (header) header.setAttribute('aria-expanded', 'false');
  }

  headers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var content = btn.nextElementSibling;
      var isOpen = item.classList.contains('active');
      document.querySelectorAll('.accordion-item-custom.active').forEach(function (other) {
        if (other !== item) closeItem(other);
      });
      if (isOpen) closeItem(item);
      else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
      if (window.Sound) window.Sound.playBeep(600, 0.04);
    });
  });
})();

/* Background color changer */
(function () {
  var light = ['#eef5fc', '#c11a1a', '#ee7c11', '#eee311', '#00ff04', '#1267e6', '#f8059b'];
  var dark  = ['#0a1a2e', '#651616', '#82500b', '#a69f10', '#0a3f15', '#09274e', '#6c0a43'];
  var idx = 0;
  var btn = document.getElementById('bg-color-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    var colors = theme === 'dark' ? dark : light;
    idx = (idx + 1) % colors.length;
    document.documentElement.style.setProperty('--bg-page', colors[idx]);
    if (window.Sound) window.Sound.playBeep(450, 0.05);
  });
})();

/* Live clock */
(function () {
  var el = document.getElementById('datetime');
  if (!el) return;
  function update() {
    el.textContent = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  }
  update();
  setInterval(update, 1000);
})();

/* Keyboard nav */
(function () {
  var nav = document.querySelector('.navbar-nav');
  if (!nav) return;
  var links = nav.querySelectorAll('.nav-link');
  if (!links.length) return;
  links.forEach(function (link, i) {
    link.addEventListener('keydown', function (e) {
      var next = null;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': next = (i + 1) % links.length; break;
        case 'ArrowLeft':  case 'ArrowUp':   next = (i - 1 + links.length) % links.length; break;
        case 'Home': next = 0; break;
        case 'End':  next = links.length - 1; break;
        default: return;
      }
      e.preventDefault();
      links[next].focus();
    });
  });
})();

/* Read More toggle */
(function () {
  var btn = document.getElementById('read-more-btn');
  var content = document.getElementById('read-more-content');
  if (!btn || !content) return;
  content.style.display = 'none';
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', function () {
    var hidden = content.style.display === 'none';
    if (hidden) {
      content.style.display = 'block';
      btn.textContent = 'Read Less';
      content.style.transition = 'none';
      content.style.opacity = '0';
      content.style.transform = 'translateY(-10px)';
      setTimeout(function () {
        content.style.transition = 'opacity 0.3s, transform 0.3s';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 50);
    } else {
      content.style.display = 'none';
      btn.textContent = 'Read More';
    }
    btn.setAttribute('aria-expanded', String(hidden));
    if (window.Sound) window.Sound.playBeep(400, 0.05);
  });
})();