(function () {
  var KEY_SHELF = 'bc_shelf';

  function getShelf() {
    try { return JSON.parse(localStorage.getItem(KEY_SHELF) || '[]'); }
    catch (e) { return []; }
  }
  function setShelf(a) { localStorage.setItem(KEY_SHELF, JSON.stringify(a)); }

  function syncButton(btn) {
    var id = btn.dataset.id;
    var onShelf = getShelf().some(function (b) { return b.id === id; });
    btn.classList.toggle('on-shelf', onShelf);
    btn.textContent = onShelf ? 'On your shelf' : 'Add to Shelf';
  }

  document.querySelectorAll('.add-to-shelf').forEach(function (btn) {
    syncButton(btn);
    btn.addEventListener('click', function () {
      var id = btn.dataset.id;
      var shelf = getShelf();
      var idx = shelf.findIndex(function (b) { return b.id === id; });
      var removed = idx > -1;
      if (removed) shelf.splice(idx, 1);
      else shelf.push({
        id: id,
        title: btn.dataset.title,
        author: btn.dataset.author,
        cover: btn.dataset.cover
      });
      setShelf(shelf);
      syncButton(btn);
      if (window.showToast) {
        window.showToast(removed ? 'Removed from shelf' : 'Added to shelf', 'success');
      }
    });
  });
})();