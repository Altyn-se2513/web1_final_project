(function () {
  try {
    var root = document.documentElement;
    var theme = localStorage.getItem('bc_theme');
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', theme);
    var accent = localStorage.getItem('bc_accent');
    if (accent) root.style.setProperty('--primary', accent);
  } catch (e) {
    // localStorage can be blocked in some browsers; fall back to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();