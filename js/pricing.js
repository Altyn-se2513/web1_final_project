(function () {
  var radios = document.querySelectorAll('input[name="billing"]');
  var priceEls = document.querySelectorAll('.price[data-monthly]');
  var note = document.getElementById('billing-note');
  if (!radios.length) return;

  function updatePrices(isYearly) {
    priceEls.forEach(function (el) {
      var monthly = parseFloat(el.dataset.monthly);
      var amount = isYearly ? monthly * 12 * 0.8 : monthly;
      el.classList.add('price-updating');
      setTimeout(function () {
        el.innerHTML = '$' + amount.toFixed(2) +
          '<small> / ' + (isYearly ? 'year' : 'month') + '</small>';
        el.classList.remove('price-updating');
      }, 150);
    });
    if (note) {
      note.textContent = isYearly
        ? 'Prices shown per year (20% discount applied).'
        : 'Prices shown per month.';
    }
  }

  radios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (!radio.checked) return;
      updatePrices(radio.value === 'yearly');
    });
  });
})();