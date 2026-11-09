(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errBox = document.getElementById('contact-error');
    var successBox = document.getElementById('contact-success');
    
    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var message = document.getElementById('message').value.trim();

    var errors = [];
    if (!name) errors.push('Name is required.');
    if (!EMAIL_RE.test(email)) errors.push('Valid email is required.');
    if (!PHONE_RE.test(phone)) errors.push('Valid phone is required.');
    if (message.length < 10) errors.push('Message too short.');

    if (errors.length) {
      errBox.innerHTML = errors.map(function (m) { return '• ' + m; }).join('<br>');
      errBox.hidden = false;
      successBox.hidden = true;
      return;
    }

    errBox.hidden = true;
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    // Симуляция отправки
    setTimeout(function () {
      btn.disabled = false;
      btn.textContent = 'Send Message';
      successBox.textContent = 'Thank you, ' + name + '! Message sent.';
      successBox.hidden = false;
      form.reset();
      if (window.showToast) window.showToast('Message sent!', 'success');
    }, 1000);
  });
})();