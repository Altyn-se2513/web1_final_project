$(document).ready(function () {
  'use strict';

  // Scroll progress bar
  if (!$('#scroll-progress').length) {
    $('body').prepend('<div id="scroll-progress" aria-hidden="true"></div>');
  }
  var $bar = $('#scroll-progress');
  function updateProgress() {
    var docH = $(document).height() - $(window).height();
    var pct = docH > 0 ? ($(window).scrollTop() / docH) * 100 : 0;
    $bar.css('width', pct + '%');
  }
  $(window).on('scroll resize', updateProgress);
  updateProgress();

  // Toast notifications
  window.showToast = function (message, type) {
    type = type || 'success';
    var $toast = $('<div>', {
      'class': 'toast-notification toast-' + type,
      text: message
    }).appendTo('body');
    setTimeout(function () { $toast.addClass('toast-visible'); }, 10);
    setTimeout(function () {
      $toast.removeClass('toast-visible').addClass('toast-hide');
      setTimeout(function () { $toast.remove(); }, 400);
    }, 2800);
  };

  // Read More (About page) — fixed state check
  var $readMoreBtn = $('#read-more-btn');
  var $readMoreContent = $('#read-more-content');
  if ($readMoreBtn.length && $readMoreContent.length) {
    $readMoreBtn.on('click', function () {
      var $btn = $(this);
      $readMoreContent.slideToggle(300, function () {
        $btn.text($(this).is(':visible') ? 'Read Less' : 'Read More');
      });
    });
  }

  // Highlight search on Book Details page — safe text-node walker
  function highlightTextNodes(el, regex) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      if (!regex.test(text)) return;
      var span = document.createElement('span');
      span.innerHTML = text.replace(regex, '<mark class="search-hl">$1</mark>');
      var frag = document.createDocumentFragment();
      while (span.firstChild) frag.appendChild(span.firstChild);
      node.parentNode.replaceChild(frag, node);
    });
  }

  function removeHighlights($root) {
    $root.find('mark.search-hl').each(function () {
      var parent = this.parentNode;
      while (this.firstChild) parent.insertBefore(this.firstChild, this);
      parent.removeChild(this);
      parent.normalize();
    });
  }

  var $highlightSearch = $('#highlight-search');
  if ($highlightSearch.length) {
    $highlightSearch.on('keyup', function () {
      var term = $(this).val().trim();
      var $list = $('.book-list');
      removeHighlights($list);
      if (term.length < 3) return;

      var safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var regex = new RegExp('(' + safeTerm + ')', 'gi');

      $list.find('.book-info h3, .book-short, .book-details p').each(function () {
        highlightTextNodes(this, regex);
      });
    });
  }
});