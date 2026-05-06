let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

function renderBookmarks() {
    const list = document.getElementById('bookmarkList');
    list.innerHTML = '';

    bookmarks.forEach(bookmark => {
        const item = document.createElement('div');
        item.classList.add('bookmark');
        item.innerHTML = `
            <img src="${bookmark.favicon}" width="16" height="16">
            <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
            <div class="tags">${bookmark.tags.map(t => `<span class="tags">${t}</span>`).join('')}</div>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'x';
        deleteBtn.classList.add('deleteBtn');
        deleteBtn.addEventListener('click', () => {
            bookmarks = bookmarks.filter(b => b.id !== bookmark.id);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            renderBookmarks();
        });
        item.appendChild(deleteBtn);

        list.appendChild(item);
    });
}

document.getElementById('addBtn').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    const tagString = document.getElementById('tagInput').value.trim();
    const tags = tagString ? tagString.split(',').map(t => t.trim()) : [];

    if (!url) return;

    const {title, favicon} = await fetchPageInfo(url);

    bookmarks.push({
        id: Date.now(), url, title, favicon, tags,
    }); 

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    document.getElementById('urlInput').value = '';
    renderBookmarks();
})

document.getElementById('search').addEventListener('input', () => {
    const query = document.getElementById('search').value.toLowerCase();
    document.querySelectorAll('.bookmark').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
});

document.getElementById('sortDate').addEventListener('click', () => {
    bookmarks.sort((a, b) => b.id - a.id);
    renderBookmarks();
});

document.getElementById('sortDomain').addEventListener('click', () => {
    bookmarks.sort((a, b) => {
        const domainA = new URL(a.url).hostname;
        const domainB = new URL(b.url).hostname;
        return domainA.localeCompare(domainB);
    });
    renderBookmarks();
});

document.getElementById('urlInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addBtn').click();
});

document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== document.getElementById('urlInput')) {
        e.preventDefault();
        document.getElementById('search').focus();
    }
});

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