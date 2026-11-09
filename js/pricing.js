(function () {
  var radios = document.querySelectorAll('input[name="billing"]');
  var priceEls = document.querySelectorAll('.price[data-monthly]');
  var note = document.getElementById('billing-note');
  if (!radios.length || !priceEls.length) return;

  var YEARLY_DISCOUNT = 0.2;
  var plans = Array.prototype.map.call(priceEls, function (el) {
    return { el: el, monthly: parseFloat(el.dataset.monthly) };
  });

  function formatPrice(monthly, period) {
    var amount, suffix;
    switch (period) {
      case 'yearly':
        amount = monthly * 12 * (1 - YEARLY_DISCOUNT);
        suffix = ' / year';
        break;
      default:
        amount = monthly;
        suffix = ' / month';
    }
    return { text: amount === 0 ? '$0' : '$' + amount.toFixed(2), suffix: suffix };
  }

  function render(period) {
    plans.forEach(function (p) {
      var f = formatPrice(p.monthly, period);
      p.el.classList.add('price-updating');
      setTimeout(function () {
        p.el.innerHTML = f.text + '<small>' + f.suffix + '</small>';
        p.el.classList.remove('price-updating');
      }, 200);
    });
    if (note) {
      note.textContent = period === 'yearly'
        ? 'Billed once a year — you save 20%.'
        : 'Prices shown per month.';
    }
  }

  radios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (!radio.checked) return;
      render(radio.value);
      if (window.Sound) window.Sound.playBeep(650, 0.06);
    });
  });
})();