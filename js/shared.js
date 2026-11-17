/* shared.js — theme toggle, footer datetime, background switcher */
(function () {
  'use strict';

  function setThemeIcons(theme) {
    var btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(function (btn) {
      btn.textContent = theme === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setThemeIcons(currentTheme);

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || 'light';
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('bc_theme', next);
        setThemeIcons(next);
      });
    });

    // Footer datetime
    var dt = document.getElementById('datetime');
    if (dt) {
      function updateTime() {
        var now = new Date();
        dt.textContent = now.toLocaleString('en-GB', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
      updateTime();
      setInterval(updateTime, 60000);
    }

    // Background colour button (book-details page)
    var bgBtn = document.getElementById('bg-color-btn');
    if (bgBtn) {
      var colors = ['', 'var(--bg-surface-2)', '#e8f4ea', '#fce8e8', '#f0e8fc'];
      var idx = 0;
      bgBtn.addEventListener('click', function () {
        idx = (idx + 1) % colors.length;
        document.body.style.background = colors[idx];
      });
    }
  });
})();