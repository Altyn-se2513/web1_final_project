(function () {
  // Newsletter validation
  var nf = document.getElementById('newsletter-form');
  if (nf) {
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('nl-email').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (window.showToast) window.showToast('Please enter a valid email.', 'error');
        return;
      }
      if (window.showToast) window.showToast('Subscribed (demo).', 'success');
      nf.reset();
    });
  }
})();