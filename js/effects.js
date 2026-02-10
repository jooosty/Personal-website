const rollSequence = ['r', 'o', 'l', 'l'];
let rollIndex = 0;
let rollTimeoutId = null;
const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let konamiIndex = 0;
let konamiTimeoutId = null;
const scanSequence = ['s', 'c', 'a', 'n'];
let scanIndex = 0;
let scanTimeoutId = null;
const leaderboardSequence = ['l', 'b'];
let leaderboardIndex = 0;
let leaderboardTimeoutId = null;
let leaderboardOverlay = null;
let leaderboardEscapeHandler = null;
const pictureSequence = ['p', 'i', 'c', 't', 'u', 'r', 'e'];
let pictureIndex = 0;
let pictureTimeoutId = null;
let pictureOverlay = null;
let pictureEscapeHandler = null;
let zHoldTimer = null;
let zTriggered = false;
let scrollLockTimeoutId = null;
const leaderboardSection = document.getElementById('leaderboard');
const leaderboardHome = leaderboardSection ? leaderboardSection.parentElement : null;
const leaderboardToggle = document.getElementById('leaderboard-toggle');

if (leaderboardToggle) {
    leaderboardToggle.addEventListener('click', () => {
        showLeaderboardOverlay();
    });
}

function setScrollLock(durationMs) {
    document.body.classList.add('no-scroll');
    if (scrollLockTimeoutId) {
        clearTimeout(scrollLockTimeoutId);
    }
    scrollLockTimeoutId = setTimeout(() => {
        document.body.classList.remove('no-scroll');
    }, durationMs);
}

window.setScrollLock = setScrollLock;

function triggerBarrelRoll() {
    setScrollLock(1300);
    document.body.classList.remove('barrel-roll');
    void document.body.offsetWidth;
    document.body.classList.add('barrel-roll');
    setTimeout(() => {
        document.body.classList.remove('barrel-roll');
    }, 1300);
}

function handleRollSequence(key) {
    if (key === rollSequence[rollIndex]) {
        rollIndex += 1;
        if (rollIndex === rollSequence.length) {
            triggerBarrelRoll();
            rollIndex = 0;
        }
    } else {
        rollIndex = key === rollSequence[0] ? 1 : 0;
    }

    if (rollTimeoutId) {
        clearTimeout(rollTimeoutId);
    }

    rollTimeoutId = setTimeout(() => {
        rollIndex = 0;
    }, 1200);
}

function triggerMeteorShower() {
    setScrollLock(5000);
    const layer = document.createElement('div');
    layer.className = 'meteor-layer';

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 1000; i += 1) {
        const meteor = document.createElement('span');
        meteor.className = 'meteor';
        const startX = Math.random() * 110 - 10;
        const delay = (Math.random() * 1.5).toFixed(2);
        const duration = (1.2 + Math.random() * 1.8).toFixed(2);
        const size = (2 + Math.random() * 4).toFixed(1);
        meteor.style.setProperty('--x', `${startX}vw`);
        meteor.style.setProperty('--delay', `${delay}s`);
        meteor.style.setProperty('--duration', `${duration}s`);
        meteor.style.setProperty('--size', `${size}px`);
        fragment.appendChild(meteor);
    }

    layer.appendChild(fragment);
    document.body.appendChild(layer);

    setTimeout(() => {
        layer.remove();
    }, 5000);
}

function triggerScanlineSweep() {
    setScrollLock(18000);
    const layer = document.createElement('div');
    layer.className = 'scanline-layer';
    const line = document.createElement('div');
    line.className = 'scanline';
    layer.appendChild(line);
    document.body.appendChild(layer);

    setTimeout(() => {
        layer.remove();
    }, 18200);
}

function triggerSlowmoPulse() {
    if (document.body.classList.contains('slowmo-pulse')) return;
    document.body.classList.remove('slowmo-pulse');
    void document.body.offsetWidth;
    document.body.classList.add('slowmo-pulse');
    setTimeout(() => {
        document.body.classList.remove('slowmo-pulse');
    }, 1900);
}

function handleKonamiSequence(key) {
    if (key === konamiSequence[konamiIndex]) {
        konamiIndex += 1;
        if (konamiIndex === konamiSequence.length) {
            triggerMeteorShower();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = key === konamiSequence[0] ? 1 : 0;
    }

    if (konamiTimeoutId) {
        clearTimeout(konamiTimeoutId);
    }

    konamiTimeoutId = setTimeout(() => {
        konamiIndex = 0;
    }, 1500);
}

function handleScanSequence(key) {
    if (key === scanSequence[scanIndex]) {
        scanIndex += 1;
        if (scanIndex === scanSequence.length) {
            triggerScanlineSweep();
            scanIndex = 0;
        }
    } else {
        scanIndex = key === scanSequence[0] ? 1 : 0;
    }

    if (scanTimeoutId) {
        clearTimeout(scanTimeoutId);
    }

    scanTimeoutId = setTimeout(() => {
        scanIndex = 0;
    }, 1200);
}

function closeLeaderboardOverlay() {
    if (!leaderboardOverlay) return;
    if (leaderboardEscapeHandler) {
        document.removeEventListener('keydown', leaderboardEscapeHandler);
        leaderboardEscapeHandler = null;
    }
    if (leaderboardSection && leaderboardHome) {
        leaderboardSection.hidden = true;
        leaderboardSection.classList.add('is-hidden');
        leaderboardHome.appendChild(leaderboardSection);
    }
    leaderboardOverlay.remove();
    leaderboardOverlay = null;
    document.body.classList.remove('no-scroll');
}

function showLeaderboardOverlay() {
    if (!leaderboardSection || !leaderboardHome) return;
    if (leaderboardOverlay) {
        closeLeaderboardOverlay();
        return;
    }

    leaderboardSection.hidden = false;
    leaderboardSection.classList.remove('is-hidden');

    const overlay = document.createElement('div');
    overlay.className = 'leaderboard-overlay';

    const panel = document.createElement('div');
    panel.className = 'leaderboard-panel';

    const header = document.createElement('div');
    header.className = 'leaderboard-header';

    const title = document.createElement('h2');
    title.textContent = 'Leaderboard';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'leaderboard-close';
    closeBtn.setAttribute('aria-label', 'Close leaderboard');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', closeLeaderboardOverlay);

    header.appendChild(title);
    header.appendChild(closeBtn);

    panel.appendChild(header);
    panel.appendChild(leaderboardSection);
    overlay.appendChild(panel);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeLeaderboardOverlay();
        }
    });

    leaderboardEscapeHandler = (event) => {
        if (event.key === 'Escape') {
            closeLeaderboardOverlay();
        }
    };
    document.addEventListener('keydown', leaderboardEscapeHandler);

    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    leaderboardOverlay = overlay;

    if (typeof window.renderLeaderboard === 'function') {
        window.renderLeaderboard();
    }
}

function handleLeaderboardSequence(key) {
    if (key === leaderboardSequence[leaderboardIndex]) {
        leaderboardIndex += 1;
        if (leaderboardIndex === leaderboardSequence.length) {
            showLeaderboardOverlay();
            leaderboardIndex = 0;
        }
    } else {
        leaderboardIndex = key === leaderboardSequence[0] ? 1 : 0;
    }

    if (leaderboardTimeoutId) {
        clearTimeout(leaderboardTimeoutId);
    }

    leaderboardTimeoutId = setTimeout(() => {
        leaderboardIndex = 0;
    }, 1200);
}

function extractAvatarEntriesFromData(data) {
    const items = data && Array.isArray(data.data) ? data.data : [];
    const entries = [];

    items.forEach((item) => {
        if (!item || !item.avatar) return;
        const avatar = item.avatar;
        const name = typeof item.name === 'string' ? item.name.trim() : '';
        if (typeof avatar === 'string' && avatar.trim()) {
            entries.push({ url: avatar.trim(), name });
            return;
        }
        if (typeof avatar === 'object' && avatar.id) {
            entries.push({ url: `https://fdnd.directus.app/assets/${avatar.id}`, name });
        }
    });

    return entries;
}

function getAvailablePictureData() {
    const urlMap = new Map();
    const avatarData = window.peopleData || window.avatarData;
    if (avatarData) {
        extractAvatarEntriesFromData(avatarData).forEach((entry) => {
            if (!entry.url) return;
            urlMap.set(entry.url, entry.name || '');
        });
    }

    const excludedImages = new Set(['media/images/lykan_hypersport_0.png']);

    document.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (!src || urlMap.has(src) || excludedImages.has(src)) return;
        const alt = img.getAttribute('alt');
        urlMap.set(src, alt || '');
    });

    return Array.from(urlMap.entries()).map(([url, name]) => ({ url, name }));
}

function closePictureGallery() {
    if (!pictureOverlay) return;
    if (pictureEscapeHandler) {
        document.removeEventListener('keydown', pictureEscapeHandler);
        pictureEscapeHandler = null;
    }
    pictureOverlay.remove();
    pictureOverlay = null;
    document.body.classList.remove('no-scroll');
}

async function showPictureGallery() {
    if (pictureOverlay) {
        closePictureGallery();
        return;
    }

    if (!window.peopleData && typeof window.ensurePeopleData === 'function') {
        await window.ensurePeopleData();
    }

    const pictures = getAvailablePictureData();

    const overlay = document.createElement('div');
    overlay.className = 'picture-gallery';

    const panel = document.createElement('div');
    panel.className = 'picture-gallery__panel';

    const header = document.createElement('div');
    header.className = 'picture-gallery__header';

    const title = document.createElement('h2');
    title.textContent = 'Available Pictures';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'picture-gallery__close';
    closeBtn.setAttribute('aria-label', 'Close picture gallery');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', closePictureGallery);

    header.appendChild(title);
    header.appendChild(closeBtn);

    const grid = document.createElement('div');
    grid.className = 'picture-gallery__grid';

    if (pictures.length) {
        pictures.forEach((picture) => {
            const item = document.createElement('div');
            item.className = 'picture-gallery__item';

            const img = document.createElement('img');
            img.src = picture.url;
            img.alt = 'Picture preview';
            img.loading = 'lazy';

            const label = document.createElement('span');
            label.className = 'picture-gallery__name';
            label.textContent = picture.name || '';

            item.appendChild(img);
            if (picture.name) {
                item.appendChild(label);
            }
            grid.appendChild(item);
        });
    } else {
        const empty = document.createElement('p');
        empty.className = 'picture-gallery__empty';
        empty.textContent = 'No pictures available yet.';
        grid.appendChild(empty);
    }

    panel.appendChild(header);
    panel.appendChild(grid);
    overlay.appendChild(panel);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closePictureGallery();
        }
    });

    pictureEscapeHandler = (event) => {
        if (event.key === 'Escape') {
            closePictureGallery();
        }
    };
    document.addEventListener('keydown', pictureEscapeHandler);

    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    pictureOverlay = overlay;
}

async function handlePictureSequence(key) {
    if (key === pictureSequence[pictureIndex]) {
        pictureIndex += 1;
        if (pictureIndex === pictureSequence.length) {
            await showPictureGallery();
            pictureIndex = 0;
        }
    } else {
        pictureIndex = key === pictureSequence[0] ? 1 : 0;
    }

    if (pictureTimeoutId) {
        clearTimeout(pictureTimeoutId);
    }

    pictureTimeoutId = setTimeout(() => {
        pictureIndex = 0;
    }, 1200);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyZ' && !zHoldTimer && !zTriggered) {
        zHoldTimer = setTimeout(() => {
            triggerSlowmoPulse();
            zTriggered = true;
        }, 2000);
    }

    if (e.key && e.key.length === 1) {
        handleRollSequence(e.key.toLowerCase());
        handleScanSequence(e.key.toLowerCase());
        handleLeaderboardSequence(e.key.toLowerCase());
        handlePictureSequence(e.key.toLowerCase());
    }

    if (e.key) {
        handleKonamiSequence(e.key.toLowerCase());
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyZ') {
        if (zHoldTimer) {
            clearTimeout(zHoldTimer);
            zHoldTimer = null;
        }
        zTriggered = false;
    }
});
