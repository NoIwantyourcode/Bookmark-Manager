let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

function renderBookmarks() {
    const list = document.getElementById('bookmarkList');

    bookmarks.forEach(bookmark => {
        const item = document.createElement('div');
        item.classList.add('bookmark');
        list.innerHTML = `
            <img src="${bookmark.favicon}" width="16" height="16">
            <a href="${bookmark.url}" target="_blank">${bookmarks.title}</a>
        `;
        item.textContent = bookmark.url;
        list.appendChild(item);
    });
}

document.getElementById('addBtn').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) return;

    const {title, favicon} = await fetchPageInfo(url);

    bookmarks.push({
        id: Date.now(), url, title, favicon,
        tags: []
    }); 

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    document.getElementById('urlInput').value = '';
    renderBookmarks();
})

async function fetchPageInfo(url) {
    try {
        const hostname = new URL(url).hostname;
        const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
        console.log(favicon);
        return {title: hostname, favicon}
    } catch (e) {
        console.log('error: ', e)
        return { title: url, favicon: ''};
    }
}

renderBookmarks();