import View from './View.js';
import previewView from './previewView.js';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = `No bookmarks yet. Find nice recipe and bookmarked it ;)`;
  _message = '';

  addHendlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    // this._data je proslijeđni bookmarks u ovom slučaju
    return this._data
      .map(bookmark => previewView.render(bookmark, false)) //false osigurava da ova metoda vrati string a ne da nešto renderira u DOM
      .join('');
  }
}

export default new BookmarksView();
