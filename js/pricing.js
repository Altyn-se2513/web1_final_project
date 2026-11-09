(function () {
  var radios = document.querySelectorAll('input[name="billing"]');
  var priceEls = document.querySelectorAll('.price[data-monthly]');
  if (!radios.length) return;

  radios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (!radio.checked) return;
      var isYearly = radio.value === 'yearly';
      priceEls.forEach(function (el) {
        var monthly = parseFloat(el.dataset.monthly);
        var amount = isYearly ? monthly * 12 * 0.8 : monthly;
        el.innerHTML = '$' + amount.toFixed(2) + '<small> / ' + (isYearly ? 'year' : 'month') + '</small>';
      });
    });
  });
})();