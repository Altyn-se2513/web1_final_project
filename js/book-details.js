(function () {
  var KEY_SHELF = 'bc_shelf';
  var getShelf = function () { return JSON.parse(localStorage.getItem(KEY_SHELF) || '[]'); };
  var setShelf = function (a) { localStorage.setItem(KEY_SHELF, JSON.stringify(a)); };

  document.querySelectorAll('.add-to-shelf').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.id;
      var shelf = getShelf();
      var idx = shelf.findIndex(function (b) { return b.id === id; });
      if (idx > -1) shelf.splice(idx, 1);
      else shelf.push({ id: id, title: btn.dataset.title, author: btn.dataset.author, cover: btn.dataset.cover });
      
      setShelf(shelf);
      btn.classList.toggle('on-shelf');
      btn.innerHTML = shelf.some(function(b) { return b.id === id; }) ? 'On your shelf' : 'Add to Shelf';
      if (window.showToast) window.showToast('Shelf updated!', 'success');
    });
  });
})();