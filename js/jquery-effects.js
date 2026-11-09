$(document).ready(function () {
  'use strict';
  console.log('jQuery is ready!');

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

  window.showToast = function (message, type) {
    type = type || 'success';
    var $toast = $('<div>', {
      'class': 'toast-notification toast-' + type,
      role: 'status',
      text: message
    }).appendTo('body');
    setTimeout(function () { $toast.addClass('toast-visible'); }, 10);
    setTimeout(function () {
      $toast.removeClass('toast-visible').addClass('toast-hide');
      setTimeout(function () { $toast.remove(); }, 400);
    }, 2800);
  };

  (function spinnerOnSubmit() {
    var $form = $('#contact-form');
    if (!$form.length) return;
    $form.on('submit', function () {
      var $btn = $form.find('button[type="submit"]');
      if ($btn.prop('disabled')) return;
      setTimeout(function () {
        if (!$btn.prop('disabled') && $btn.text().trim().indexOf('Sending') === -1) return;
        var original = $btn.data('original-html') || $btn.html();
        $btn.data('original-html', original);
        $btn.prop('disabled', true).html(
          '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait...'
        );
        setTimeout(function () {
          if ($btn.prop('disabled')) {
            $btn.prop('disabled', false).html(original);
            $btn.removeData('original-html');
          }
        }, 4000);
      }, 50);
    });
    $form.on('reset', function () {
      $form.find('button[type="submit"]').removeData('original-html');
    });
  })();

  (function copyButtons() {
    $('.book-details blockquote').each(function () {
      var $bq = $(this);
      if ($bq.data('copy-attached')) return;
      $bq.data('copy-attached', true);
      var $btn = $('<button>', {
        type: 'button',
        'class': 'btn btn-sm btn-outline-secondary ms-2 copy-quote-btn',
        'aria-label': 'Copy quote to clipboard'
      }).html('📋 Copy');

      $btn.on('click', function () {
        var text = $.trim($bq.clone().children().remove().end().text())
          .replace(/^["“]|["”]$/g, '').trim();
        copyToClipboard(text, $btn);
      });
      $bq.append($btn);
    });

    function copyToClipboard(text, $btn) {
      function success() {
        var orig = $btn.html();
        $btn.html('✓ Copied!')
            .removeClass('btn-outline-secondary')
            .addClass('btn-success');
        if (window.showToast) window.showToast('Copied to clipboard!', 'success');
        setTimeout(function () {
          $btn.html(orig).removeClass('btn-success').addClass('btn-outline-secondary');
        }, 2000);
      }
      function fail() {
        if (window.showToast) window.showToast('Copy failed', 'error');
      }
      function fallback() {
        var $ta = $('<textarea>').val(text).css({ position: 'fixed', top: '-1000px' }).appendTo('body');
        $ta[0].select();
        try { document.execCommand('copy'); success(); } catch (e) { fail(); }
        $ta.remove();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(success).catch(fallback);
      } else {
        fallback();
      }
    }
  })();

  (function lazyLoadImages() {
    var $imgs = $('.main-content .card-img-top, .main-content .custom-card img');
    if (!$imgs.length) return;
    var PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E';

    $imgs.each(function () {
      var $img = $(this);
      var real = $img.attr('src');
      if (!real || real.indexOf('data:') === 0) return;
      $img.attr('data-src', real).attr('src', PLACEHOLDER).addClass('lazy-img');
    });

    function loadVisible() {
      var winBottom = $(window).scrollTop() + $(window).height() + 150;
      $('.lazy-img').each(function () {
        var $img = $(this);
        if ($img.offset().top < winBottom) {
          $img.attr('src', $img.attr('data-src'))
              .removeAttr('data-src')
              .removeClass('lazy-img')
              .css('opacity', 0)
              .animate({ opacity: 1 }, 250);
        }
      });
    }
    $(window).on('scroll resize', loadVisible);
    setTimeout(loadVisible, 200);
  })();

  (function toastHooks() {
    $(document).on('click', '.add-to-shelf', function () {
      var $btn = $(this);
      var title = $btn.data('title') || 'Book';
      setTimeout(function () {
        if ($btn.hasClass('on-shelf')) {
          window.showToast('"' + title + '" added to shelf', 'success');
        } else {
          window.showToast('"' + title + '" removed from shelf', 'info');
        }
      }, 20);
    });
    $(document).on('click', '#random-quote-btn', function () {
      window.showToast('New quote loaded', 'info');
    });
    $(document).on('click', '#theme-toggle', function () {
      setTimeout(function () {
        var dark = $('html').attr('data-theme') === 'dark';
        window.showToast(dark ? '🌙 Dark theme enabled' : '☀ Light theme enabled', 'info');
      }, 20);
    });
  })();

  $(document).on('click', 'a[href^="#"]:not([href="#"])', function (e) {
    var href = $(this).attr('href');
    var $target = $(href);
    if (!$target.length) return;
    e.preventDefault();
    $('html, body').animate({ scrollTop: $target.offset().top - 90 }, 400);
  });
});