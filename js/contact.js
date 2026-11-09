(function () {
  var form = document.getElementById('contact-form');
  var errBox = document.getElementById('contact-error');
  var successBox = document.getElementById('contact-success');
  if (!form) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[0-9\s\-()]{7,15}$/;

  function showError(list) {
    errBox.innerHTML = list.map(function (m) { return '• ' + m; }).join('<br>');
    errBox.hidden = false;
    errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (window.Sound) window.Sound.playBeep(250, 0.12, 'square');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (successBox) successBox.hidden = true;

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var message = document.getElementById('message').value.trim();

    var errors = [];
    if (!name) errors.push('Name is required.');
    else if (name.length < 2) errors.push('Name must be at least 2 characters.');
    if (!email) errors.push('Email is required.');
    else if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');
    if (!phone) errors.push('Phone is required.');
    else if (!PHONE_RE.test(phone)) errors.push('Enter a valid phone number (7–15 digits, optional +, spaces, dashes, parentheses).');
    if (!message) errors.push('Message is required.');
    else if (message.length < 10) errors.push('Message must be at least 10 characters.');

    if (errors.length) { showError(errors); return; }
    errBox.hidden = true;

    var submitBtn = form.querySelector('button[type="submit"]');
    var orig = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, phone: phone, message: message })
    })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (successBox) {
          successBox.textContent = 'Thank you, ' + name + '! Your message has been sent (id ' + data.id + '). We will respond within 24 hours.';
          successBox.hidden = false;
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (window.Sound) window.Sound.playBeep(1000, 0.12);
        form.reset();
      })
      .catch(function (err) {
        errBox.textContent = 'Could not send message: ' + err.message;
        errBox.hidden = false;
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = orig;
      });
  });

  form.addEventListener('reset', function () {
    errBox.hidden = true;
    if (successBox) successBox.hidden = true;
  });

  var picker = document.getElementById('theme-color');
  if (picker) {
    var saved = localStorage.getItem('bc_accent');
    if (saved) picker.value = saved;
    picker.addEventListener('input', function (e) {
      document.documentElement.style.setProperty('--primary', e.target.value);
      localStorage.setItem('bc_accent', e.target.value);
    });
  }
})();