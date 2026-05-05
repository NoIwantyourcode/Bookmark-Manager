let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

function renderBookmarks() {
    const list = document.getElementById('bookmarkList');
    list.innerHTML = '';

    bookmarks.forEach(bookmark => {
        const item = document.createElement('div');
        item.classList.add('bookmark');
        item.textContent = bookmark.url;
        list.appendChild(item);
    });
}

document.getElementById('addBtn').addEventListener('click', () => {
    const url = document.getElementById('urlInput').ariaValueMax.trim();
    if (!url) return;
    bookmarks.push({
        id: Date.now(), url,
        title: url,
        tags: [],
    });

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    document.getElementById('urlInput').value = '';
    renderBookmarks();
})

renderBookmarks();