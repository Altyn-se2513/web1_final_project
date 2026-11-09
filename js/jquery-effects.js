$(document).ready(function () {
  'use strict';
  console.log('jQuery is ready!');

  // Scroll Progress
  (function scrollProgress() {
    if (!$('#scroll-progress').length) {
      $('body').prepend('<div id="scroll-progress" aria-hidden="true"></div>');
    }
    var $bar = $('#scroll-progress');
    function update() {
      var docH = $(document).height() - $(window).height();
      var pct = docH > 0 ? ($(window).scrollTop() / docH) * 100 : 0;
      $bar.css('width', pct + '%');
    }
    $(window).on('scroll resize', update);
    update();
  })();

  // Toasts
  window.showToast = function (message, type) {
    type = type || 'success';
    var $toast = $('<div>', { 'class': 'toast-notification toast-' + type, text: message }).appendTo('body');
    setTimeout(function () { $toast.addClass('toast-visible'); }, 10);
    setTimeout(function () {
      $toast.removeClass('toast-visible').addClass('toast-hide');
      setTimeout(function () { $toast.remove(); }, 400);
    }, 2800);
  };
});