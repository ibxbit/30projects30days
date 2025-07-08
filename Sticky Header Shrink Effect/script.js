const header = document.querySelector('.site-header');
let lastScrollY = window.scrollY;

function handleHeaderShrink() {
  if (window.scrollY > 40) {
    header.classList.add('shrink');
  } else {
    header.classList.remove('shrink');
  }
}
window.addEventListener('scroll', handleHeaderShrink);
window.addEventListener('load', handleHeaderShrink);

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  menuToggle.setAttribute('aria-label', nav.classList.contains('open') ? 'Close navigation menu' : 'Open navigation menu');
});
// Close menu on nav link click (mobile)
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  });
});

// Professional SVG icons for theme toggle
function getSunSVG() {
  return `<svg class="theme-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="10" stroke="#7f7fd5" stroke-width="2" fill="#fff"/><path d="M14 4v2M14 22v2M4 14h2M22 14h2M7.8 7.8l1.4 1.4M18.8 18.8l1.4 1.4M7.8 20.2l1.4-1.4M18.8 9.2l1.4-1.4" stroke="#7f7fd5" stroke-width="2" stroke-linecap="round"/></svg>`;
}
function getMoonSVG() {
  return `<svg class="theme-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 18.5A10 10 0 0 1 9.5 7c0-1.1.2-2.1.5-3A10 10 0 1 0 21 18.5z" stroke="#7f7fd5" stroke-width="2" fill="#fff"/></svg>`;
}
const themeToggle = document.querySelector('.toggle-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
function setTheme(dark) {
  if (dark) {
    document.body.classList.add('dark');
    themeToggle.innerHTML = getSunSVG();
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    themeToggle.innerHTML = getMoonSVG();
    localStorage.setItem('theme', 'light');
  }
}
if (savedTheme === 'dark' || (!savedTheme && prefersDark) || (!savedTheme)) {
  setTheme(true);
} else {
  setTheme(false);
}
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  setTheme(!isDark);
}); 