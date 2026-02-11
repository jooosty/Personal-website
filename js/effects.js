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
let personOverlay = null;
let personEscapeHandler = null;
const PERSON_API_BASE = 'https://fdnd.directus.app/items/person/';
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
        const id = typeof item.id === 'number' || typeof item.id === 'string' ? item.id : null;
        if (typeof avatar === 'string' && avatar.trim()) {
            entries.push({ url: avatar.trim(), name, id });
            return;
        }
        if (typeof avatar === 'object' && avatar.id) {
            entries.push({ url: `https://fdnd.directus.app/assets/${avatar.id}`, name, id });
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
            urlMap.set(entry.url, { name: entry.name || '', id: entry.id ?? null });
        });
    }

    const excludedImages = new Set(['media/images/lykan_hypersport_0.png']);

    document.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (!src || urlMap.has(src) || excludedImages.has(src)) return;
        const alt = img.getAttribute('alt');
        urlMap.set(src, { name: alt || '', id: null });
    });

    return Array.from(urlMap.entries()).map(([url, meta]) => ({
        url,
        name: meta.name,
        id: meta.id
    }));
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

function closePersonOverlay() {
    if (!personOverlay) return;
    if (personEscapeHandler) {
        document.removeEventListener('keydown', personEscapeHandler);
        personEscapeHandler = null;
    }
    personOverlay.remove();
    personOverlay = null;
    document.body.classList.remove('no-scroll');
    showPictureGallery();
}

function resolveAssetUrl(value) {
    if (!value) return '';
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'object' && value.id) {
        return `https://fdnd.directus.app/assets/${value.id}`;
    }
    return '';
}

function formatLabel(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value) {
    if (value == null || value === '') return '—';
    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : '—';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

function isEmptyValue(value) {
    if (value == null || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

function buildLink(label, href) {
    const link = document.createElement('a');
    link.className = 'profile-link';
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    return link;
}

function addFieldRow(container, label, value, options = {}) {
    if (isEmptyValue(value)) return;
    const row = document.createElement('div');
    row.className = 'profile-field';

    const labelEl = document.createElement('span');
    labelEl.className = 'profile-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'profile-value';

    if (options.isLink && options.href && !isEmptyValue(value)) {
        valueEl.appendChild(buildLink(value, options.href));
    } else if (options.isColor && typeof value === 'string' && value.trim()) {
        const swatch = document.createElement('span');
        swatch.className = 'profile-swatch';
        swatch.style.setProperty('--swatch', value.trim());
        const text = document.createElement('span');
        text.textContent = value.trim();
        valueEl.appendChild(swatch);
        valueEl.appendChild(text);
    } else {
        valueEl.textContent = formatValue(value);
    }

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
}

async function showPersonProfile(personId) {
    if (!personId) return;
    if (personOverlay) {
        closePersonOverlay();
        return;
    }
    if (pictureOverlay) {
        closePictureGallery();
    }

    const overlay = document.createElement('div');
    overlay.className = 'person-overlay';

    const panel = document.createElement('div');
    panel.className = 'person-panel';

    const header = document.createElement('div');
    header.className = 'person-header';

    const title = document.createElement('h2');
    title.textContent = 'Person Profile';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'person-close';
    closeBtn.setAttribute('aria-label', 'Close profile');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', closePersonOverlay);

    header.appendChild(title);
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.className = 'profile-container';

    const hero = document.createElement('section');
    hero.className = 'profile-hero';

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'profile-avatar-wrap';

    const avatar = document.createElement('img');
    avatar.className = 'profile-avatar';
    avatar.alt = '';
    avatar.hidden = true;
    avatarWrap.appendChild(avatar);

    const heroText = document.createElement('div');
    heroText.className = 'profile-hero-text';

    const nameEl = document.createElement('h2');
    nameEl.textContent = 'Loading...';

    const nicknameEl = document.createElement('p');
    nicknameEl.className = 'profile-subtitle';

    const bioEl = document.createElement('p');
    bioEl.className = 'profile-bio';

    const linksEl = document.createElement('div');
    linksEl.className = 'profile-links';

    heroText.appendChild(nameEl);
    heroText.appendChild(nicknameEl);
    heroText.appendChild(bioEl);
    heroText.appendChild(linksEl);

    hero.appendChild(avatarWrap);
    hero.appendChild(heroText);

    const details = document.createElement('section');
    details.className = 'profile-details';

    const detailsTitle = document.createElement('h3');
    detailsTitle.className = 'profile-section-title';
    detailsTitle.textContent = 'Full Data';

    const fields = document.createElement('div');
    fields.className = 'profile-fields';

    details.appendChild(detailsTitle);
    details.appendChild(fields);

    const errorEl = document.createElement('p');
    errorEl.className = 'profile-error';
    errorEl.hidden = true;

    content.appendChild(hero);
    content.appendChild(details);
    content.appendChild(errorEl);

    panel.appendChild(header);
    panel.appendChild(content);
    overlay.appendChild(panel);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closePersonOverlay();
        }
    });

    personEscapeHandler = (event) => {
        if (event.key === 'Escape') {
            closePersonOverlay();
        }
    };
    document.addEventListener('keydown', personEscapeHandler);

    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    personOverlay = overlay;

    try {
        const response = await fetch(`${PERSON_API_BASE}${encodeURIComponent(personId)}`);
        if (!response.ok) throw new Error('Failed to load person data');
        const payload = await response.json();
        const person = payload && payload.data ? payload.data : null;
        if (!person) throw new Error('Person not found');

        const displayName = person.name || person.nickname || 'Unknown person';
        nameEl.textContent = displayName;
        nicknameEl.textContent = person.nickname ? `Nickname: ${person.nickname}` : '';
        nicknameEl.hidden = !person.nickname;
        bioEl.textContent = person.bio || '';
        bioEl.hidden = !person.bio;

        const avatarUrl = resolveAssetUrl(person.avatar) || resolveAssetUrl(person.mugshot);
        if (avatarUrl) {
            avatar.src = avatarUrl;
            avatar.alt = displayName;
            avatar.hidden = false;
        } else {
            avatar.classList.add('is-empty');
            avatar.hidden = true;
        }

        linksEl.innerHTML = '';
        let linkCount = 0;
        if (person.website) {
            linksEl.appendChild(buildLink('Website', person.website));
            linkCount += 1;
        }
        if (person.profilecard) {
            linksEl.appendChild(buildLink('Profile Card', person.profilecard));
            linkCount += 1;
        }
        if (person.fav_spotify_track) {
            linksEl.appendChild(buildLink('Favorite Track', person.fav_spotify_track));
            linkCount += 1;
        }
        if (person.github_handle) {
            const handle = String(person.github_handle).replace('@', '').trim();
            if (handle) {
                linksEl.appendChild(buildLink('GitHub', `https://github.com/${handle}`));
                linkCount += 1;
            }
        }
        linksEl.hidden = linkCount === 0;

        const orderedFields = [
            'id',
            'name',
            'nickname',
            'github_handle',
            'website',
            'bio',
            'birthdate',
            'residency',
            'shoe_size',
            'fav_emoji',
            'vibe_emoji',
            'fav_color',
            'fav_tag',
            'fav_attribute',
            'fav_property',
            'fav_feature',
            'fav_border_radius',
            'fav_animal',
            'fav_season',
            'fav_hobby',
            'fav_song',
            'fav_music_genre',
            'fav_game',
            'fav_fruit',
            'fav_soup',
            'fav_movie',
            'fav_spotify_track',
            'profilecard',
            'is_bold',
            'team',
            'squads',
            'role',
            'avatar',
            'mugshot'
        ];

        fields.innerHTML = '';
        const displayed = new Set();
        orderedFields.forEach((key) => {
            if (!(key in person)) return;
            displayed.add(key);

            if (key === 'website') {
                addFieldRow(fields, 'Website', person.website, { isLink: true, href: person.website });
                return;
            }
            if (key === 'profilecard') {
                addFieldRow(fields, 'Profile Card', person.profilecard, { isLink: true, href: person.profilecard });
                return;
            }
            if (key === 'fav_spotify_track') {
                addFieldRow(fields, 'Favorite Track', person.fav_spotify_track, { isLink: true, href: person.fav_spotify_track });
                return;
            }
            if (key === 'github_handle') {
                const handle = String(person.github_handle || '').replace('@', '').trim();
                if (handle) {
                    addFieldRow(fields, 'GitHub', handle, { isLink: true, href: `https://github.com/${handle}` });
                } else {
                    addFieldRow(fields, formatLabel(key), person[key]);
                }
                return;
            }
            if (key === 'fav_color') {
                addFieldRow(fields, 'Favorite Color', person.fav_color, { isColor: true });
                return;
            }
            if (key === 'avatar' || key === 'mugshot') {
                const url = resolveAssetUrl(person[key]);
                addFieldRow(fields, formatLabel(key), url, url ? { isLink: true, href: url } : {});
                return;
            }

            addFieldRow(fields, formatLabel(key), person[key]);
        });

        if (person.custom) {
            let customData = null;
            if (typeof person.custom === 'string') {
                try {
                    customData = JSON.parse(person.custom);
                } catch (error) {
                    customData = null;
                }
            } else if (typeof person.custom === 'object') {
                customData = person.custom;
            }

            if (customData && typeof customData === 'object') {
                Object.entries(customData).forEach(([key, value]) => {
                    addFieldRow(fields, `Custom: ${formatLabel(key)}`, value);
                });
            } else {
                addFieldRow(fields, 'Custom', person.custom);
            }
            displayed.add('custom');
        }

        Object.keys(person).forEach((key) => {
            if (displayed.has(key)) return;
            addFieldRow(fields, formatLabel(key), person[key]);
        });

    } catch (error) {
        errorEl.textContent = 'Could not load person data.';
        errorEl.hidden = false;
        nameEl.textContent = 'Unable to load profile.';
        bioEl.textContent = '';
    }
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

            if (picture.id != null) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'picture-gallery__link';
                button.setAttribute('aria-label', `View ${picture.name || 'profile'}`);
                button.appendChild(img);
                button.addEventListener('click', () => {
                    showPersonProfile(picture.id);
                });
                item.appendChild(button);
            } else {
                item.appendChild(img);
            }

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
