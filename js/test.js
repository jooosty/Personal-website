const testSequence = ['t', 'e', 's', 't'];
let testIndex = 0;
let testTimeoutId = null;
let testOverlay = null;

function collectSmokeTests() {
    const hasElement = (id) => Boolean(document.getElementById(id));
    const hasListItems = (selector, count) => document.querySelectorAll(selector).length >= count;

    const tests = [
        { label: 'Tetris canvas', pass: hasElement('tetris') },
        { label: 'Minesweeper board', pass: hasElement('minesweeper-board') },
        { label: '2048 board', pass: hasElement('game-2048') },
        { label: 'Leaderboard section', pass: hasElement('leaderboard') },
        { label: 'Total score element', pass: hasElement('total-score') },
        { label: 'Theme toggle button', pass: hasElement('theme-toggle') },
        { label: 'Game switcher button', pass: hasElement('different-game') },
        { label: 'Tetris score', pass: hasElement('score') },
        { label: 'Minesweeper score', pass: hasElement('minesweeper-score') },
        { label: '2048 score', pass: hasElement('score-2048') },
        { label: 'Tetris reset/controls', pass: Boolean(document.querySelector('.mobile-controls')) },
        { label: 'Minesweeper reset', pass: hasElement('minesweeper-reset') },
        { label: '2048 reset', pass: hasElement('reset-2048') },
        { label: 'Unlock badges', pass: hasListItems('.unlock-badge', 1) },
        { label: 'Leaderboard lists', pass: hasListItems('.leaderboard-list', 3) },
        { label: 'Audio elements', pass: hasListItems('audio', 3) },
        { label: 'Shared score API', pass: typeof window.setSharedScore === 'function' && typeof window.getSharedScore === 'function' },
        { label: 'Leaderboard API', pass: typeof window.recordLeaderboardScore === 'function' },
        { label: 'People data loader', pass: typeof window.ensurePeopleData === 'function' },
        { label: 'Scroll lock API', pass: typeof window.setScrollLock === 'function' },
        { label: 'Tetris score API', pass: typeof window.setTetrisScore === 'function' && typeof window.getTetrisScore === 'function' },
        { label: 'Minesweeper score API', pass: typeof window.setMinesweeperScore === 'function' && typeof window.getMinesweeperScore === 'function' },
        { label: '2048 score API', pass: typeof window.set2048Score === 'function' && typeof window.get2048Score === 'function' }
    ];

    return tests;
}

function closeTestOverlay() {
    if (!testOverlay) return;
    testOverlay.remove();
    testOverlay = null;
}

function showTestOverlay(results) {
    if (testOverlay) {
        closeTestOverlay();
    }

    const overlay = document.createElement('div');
    overlay.className = 'test-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0, 0, 0, 0.7)';
    overlay.style.color = '#fff';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const panel = document.createElement('div');
    panel.style.background = '#111';
    panel.style.border = '1px solid #333';
    panel.style.padding = '20px';
    panel.style.borderRadius = '10px';
    panel.style.maxWidth = '420px';
    panel.style.width = '90%';
    panel.style.fontFamily = 'Arial, sans-serif';

    const title = document.createElement('h2');
    title.textContent = 'Smoke Tests';
    title.style.margin = '0 0 12px 0';

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.margin = '0 0 12px 0';

    results.forEach((test) => {
        const item = document.createElement('li');
        item.textContent = `${test.pass ? 'PASS' : 'FAIL'} - ${test.label}`;
        item.style.margin = '6px 0';
        item.style.color = test.pass ? '#7CFC90' : '#FF8A80';
        list.appendChild(item);
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.style.background = '#222';
    closeBtn.style.border = '1px solid #444';
    closeBtn.style.color = '#fff';
    closeBtn.style.padding = '8px 14px';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', closeTestOverlay);

    panel.appendChild(title);
    panel.appendChild(list);
    panel.appendChild(closeBtn);
    overlay.appendChild(panel);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeTestOverlay();
        }
    });

    document.body.appendChild(overlay);
    testOverlay = overlay;
}

function runSmokeTests() {
    const results = collectSmokeTests();
    showTestOverlay(results);
    return results;
}

window.runSmokeTests = runSmokeTests;

document.addEventListener('keydown', (event) => {
    if (!event.key || event.key.length !== 1) return;
    const key = event.key.toLowerCase();

    if (key === testSequence[testIndex]) {
        testIndex += 1;
        if (testIndex === testSequence.length) {
            runSmokeTests();
            testIndex = 0;
        }
    } else {
        testIndex = key === testSequence[0] ? 1 : 0;
    }

    if (testTimeoutId) {
        clearTimeout(testTimeoutId);
    }

    testTimeoutId = setTimeout(() => {
        testIndex = 0;
    }, 1200);
});
