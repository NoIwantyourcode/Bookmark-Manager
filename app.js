let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
let activeTag = null;

function renderBookmarks() {
    console.log('bookmarks:', bookmarks.map(b => b.favourite));

    const filtered = activeTag
        ? bookmarks.filter(b => b.tags.includes(activeTag))
        : bookmarks;

    const sorted = [...filtered].sort((a, b) => (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0));

    const list = document.getElementById('bookmarkList');
    list.innerHTML = '';

    sorted.forEach(bookmark => {
        const item = document.createElement('div');
        item.classList.add('bookmark');
        if (!activeTag) {
            item.style.opacity = '0';
            setTimeout(() => item.style.opacity = '1', 10);
        }

        item.innerHTML = `
            <img src="${bookmark.favicon}" width="16" height="16">
            <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
            <div class="tag">${(bookmark.tags || []).map(t => `<span class="tags">${t}</span>`).join('')}</div>
        `;

        item.querySelectorAll('.tags').forEach(tagE1 => {
            if (tagE1.textContent === activeTag) tagE1.classList.add('active');
            tagE1.addEventListener('click', (e) => {
                e.stopPropagation();
                activeTag = activeTag === tagE1.textContent ? null : tagE1.textContent;

                document.querySelectorAll('.bookmark').forEach(b => {
                    const tags = Array.from(b.querySelectorAll('.tags')).map(t => t.textContent);
                    const shouldHide = activeTag && !tags.includes(activeTag);
                    b.style.opacity = shouldHide ? '0' : '1';
                    b.style.pointerEvents = shouldHide ? 'none' : 'auto';
                    setTimeout(() => {
                        b.style.display = shouldHide ? 'none' : 'flex';
                    }, 100);
                });
            });
        });

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

        const editBtn = document.createElement('button');
        editBtn.textContent = 'edit';
        editBtn.classList.add('editBtn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newUrl = prompt('Edit URL:', bookmark.url);
            if (!newUrl) return;
            const newTags = prompt('Edit tags (comma separated):', bookmark.tags.join(', '));
            bookmark.url = newUrl;
            bookmark.tags = newTags ? newTags.split(',').map(t => t.trim()) : [];
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            renderBookmarks();
        });
        item.appendChild(editBtn);

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'copy';
        copyBtn.classList.add('copyBtn');
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(bookmark.url);
            copyBtn.textContent = 'copied!'
            setTimeout(() => copyBtn.textContent = "copy", 1500);
        });
        item.appendChild(copyBtn);

        const importantBtn = document.createElement('button');
        importantBtn.textContent = bookmark.favourite ? '⭐' : '☆';
        importantBtn.classList.add('importantBtn');
        importantBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bookmark.favourite = !bookmark.favourite;
            console.log('favourite:', bookmark.favourite, bookmark)
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            renderBookmarks();
        });
        item.appendChild(importantBtn);
    });

    document.getElementById('bookmarkCount').textContent = `${filtered.length} bookmarks`;

    if (filtered.length === 0) {
        list.innerHTML = '<p id="emptyState">No bookmarks yet - add one!</p>';
    }
}

document.getElementById('addBtn').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();

    const tagString = document.getElementById('tagInput').value.trim();
    document.getElementById('tagInput').value = '';

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

document.getElementById('exportBtn').addEventListener('click', () => {
    const data = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.json';
    a.click();
    URL.revokeObjectURL(url);
})

renderBookmarks();