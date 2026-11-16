$(document).ready(function () {
  'use strict';
  console.log('jQuery is ready!');

  // --- Scroll Progress Bar ---
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

  // --- Toast Notifications ---
  window.showToast = function (message, type) {
    type = type || 'success';
    var $toast = $('<div>', { 'class': 'toast-notification toast-' + type, text: message }).appendTo('body');
    setTimeout(function () { $toast.addClass('toast-visible'); }, 10);
    setTimeout(function () {
      $toast.removeClass('toast-visible').addClass('toast-hide');
      setTimeout(function () { $toast.remove(); }, 400);
    }, 2800);
  };

  // --- Read More Button (About Page) ---
  var $readMoreBtn = $('#read-more-btn');
  var $readMoreContent = $('#read-more-content');
  
  if ($readMoreBtn.length && $readMoreContent.length) {
    $readMoreBtn.on('click', function() {
      // Плавное раскрытие/скрытие контента
      $readMoreContent.slideToggle(300);
      
      // Меняем текст кнопки в зависимости от состояния
      var isVisible = $readMoreContent.is(':visible');
      $(this).text(isVisible ? 'Read Less' : 'Read More');
    });
  }

  // --- Highlight Search (Book Details Page) ---
  var $highlightSearch = $('#highlight-search');
  if ($highlightSearch.length) {
    $highlightSearch.on('keyup', function() {
      var term = $(this).val().trim();
      
      // Убираем старые выделения
      $('.book-list').find('mark.search-hl').contents().unwrap();
      
      if (term.length > 2) {
        // Ищем текст в параграфах и заголовках карточек
        $('.book-list').find('.book-info h3, .book-short, .book-details p').each(function() {
          var originalText = $(this).text();
          var regex = new RegExp('(' + term + ')', 'gi');
          var newText = originalText.replace(regex, '<mark class="search-hl">$1</mark>');
          $(this).html(newText);
        });
      }
    });
  }
});