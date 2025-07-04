const target = document.getElementById('target');
const menu = document.getElementById('custom-menu');
const themeToggle = document.querySelector('.toggle-theme');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings');
const menuColorInput = document.getElementById('menu-color');
const fontSizeInput = document.getElementById('font-size');
let focusTrapCleanup = null;
let menuTimeout = null;

// --- Utility Functions ---
function announce(msg) {
    const live = document.getElementById('aria-live');
    if (live) {
        live.textContent = '';
        setTimeout(() => { live.textContent = msg; }, 10);
    }
}

// --- Focus Trap ---
function trapFocus(container) {
    const focusable = container.querySelectorAll('li, button, input, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handle(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        }
    }
    container.addEventListener('keydown', handle);
    return () => container.removeEventListener('keydown', handle);
}

// --- Menu Actions ---
const actions = {
    copy: () => {
        navigator.clipboard.writeText('Sample copied text!');
        announce('Copied!');
    },
    paste: () => {
        announce('Paste action (not available in browser sandbox)');
    },
    download: () => {
        announce('Choose a format to download.');
    },
    'download-png': () => {
        announce('Download as PNG!');
    },
    'download-pdf': () => {
        announce('Download as PDF!');
    },
    settings: () => {
        document.getElementById('settings-panel').hidden = false;
        document.getElementById('settings-panel').querySelector('button').focus();
        announce('Settings panel opened.');
    }
};

// --- Menu Logic ---
function openMenu(x, y) {
    menu.style.display = 'block';
    // Position menu, prevent overflow
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    // Focus first menu item for accessibility
    const firstItem = menu.querySelector('li');
    if (firstItem) firstItem.focus();
    announce('Context menu opened.');
    // Trap focus
    if (focusTrapCleanup) focusTrapCleanup();
    focusTrapCleanup = trapFocus(menu);
}
function closeMenu() {
    menu.style.display = 'none';
    announce('Context menu closed.');
    if (focusTrapCleanup) focusTrapCleanup();
    focusTrapCleanup = null;
}

// Show custom menu on right-click
target.addEventListener('contextmenu', function(e) {
    if (target.hasAttribute('disabled')) return;
    e.preventDefault();
    openMenu(e.pageX, e.pageY);
});
// Touch support: long-press
let touchTimer = null;
target.addEventListener('touchstart', function(e) {
    if (target.hasAttribute('disabled')) return;
    if (e.touches.length !== 1) return;
    touchTimer = setTimeout(() => {
        openMenu(e.touches[0].pageX, e.touches[0].pageY);
    }, 500);
});
target.addEventListener('touchend', function() {
    clearTimeout(touchTimer);
});
target.addEventListener('touchmove', function() {
    clearTimeout(touchTimer);
});

// Hide menu on click elsewhere (with slight delay for UX)
window.addEventListener('mousedown', function(e) {
    if (!menu.contains(e.target)) {
        menuTimeout = setTimeout(closeMenu, 120);
    }
});
menu.addEventListener('mousedown', function() {
    clearTimeout(menuTimeout);
});

// Hide menu on escape key
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMenu();
        target.focus();
        settingsPanel.hidden = true;
    }
});

// Keyboard navigation for menu (with submenu support)
menu.addEventListener('keydown', function(e) {
    const items = Array.from(menu.querySelectorAll('li[role="menuitem"]'));
    const current = document.activeElement;
    let idx = items.indexOf(current);
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < items.length - 1) items[idx + 1].focus();
        else items[0].focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) items[idx - 1].focus();
        else items[items.length - 1].focus();
    } else if (e.key === 'ArrowRight') {
        // Open submenu if exists
        const submenu = current.querySelector('.submenu');
        if (submenu) {
            submenu.style.display = 'block';
            const subitem = submenu.querySelector('li');
            if (subitem) subitem.focus();
        }
    } else if (e.key === 'ArrowLeft') {
        // Close submenu if in submenu
        const parent = current.closest('.submenu');
        if (parent) {
            parent.style.display = 'none';
            const parentLi = parent.parentElement;
            if (parentLi) parentLi.focus();
        }
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        current.click();
    }
});

// Menu item click actions
menu.querySelectorAll('li[role="menuitem"]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        if (actions[action]) actions[action]();
        // Only close if not a parent of submenu
        if (!item.querySelector('.submenu')) closeMenu();
    });
});
// Submenu item click
menu.querySelectorAll('.submenu li[role="menuitem"]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        if (actions[action]) actions[action]();
        closeMenu();
    });
});

// Optional: Hide menu if window is resized or scrolled
window.addEventListener('resize', closeMenu);
window.addEventListener('scroll', closeMenu);

// Dark mode logic (sync with system changes)
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');
const sunSVG = `<svg class="theme-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="10" stroke="#7f7fd5" stroke-width="2" fill="#fff"/><path d="M14 4v2M14 22v2M4 14h2M22 14h2M7.8 7.8l1.4 1.4M18.8 18.8l1.4 1.4M7.8 20.2l1.4-1.4M18.8 9.2l1.4-1.4" stroke="#7f7fd5" stroke-width="2" stroke-linecap="round"/></svg>`;
const moonSVG = `<svg class="theme-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 18.5A10 10 0 0 1 9.5 7c0-1.1.2-2.1.5-3A10 10 0 1 0 21 18.5z" stroke="#7f7fd5" stroke-width="2" fill="#fff"/></svg>`;
function setTheme(dark) {
    if (dark) {
        document.body.classList.add('dark');
        themeToggle.innerHTML = sunSVG;
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark');
        themeToggle.innerHTML = moonSVG;
        localStorage.setItem('theme', 'light');
    }
}
if (savedTheme === 'dark' || (!savedTheme && prefersDark.matches)) {
    setTheme(true);
} else {
    setTheme(false);
}
themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setTheme(!isDark);
});
prefersDark.addEventListener('change', (e) => {
    setTheme(e.matches);
});

// Settings panel logic
closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.hidden = true;
    announce('Settings panel closed.');
});
menuColorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--menu-accent', e.target.value);
});
fontSizeInput.addEventListener('input', (e) => {
    menu.style.fontSize = e.target.value + 'px';
});

// Scroll-to-top button logic
const backToTopBtn = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.5) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Cleanup (if needed for SPA/component use) ---
window.addEventListener('unload', () => {
    if (focusTrapCleanup) focusTrapCleanup();
    clearTimeout(menuTimeout);
    clearTimeout(touchTimer);
}); 