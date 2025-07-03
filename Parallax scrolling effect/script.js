// Modern smooth parallax effect
const parallaxSections = document.querySelectorAll('.parallax');
const fadeEls = document.querySelectorAll('.fade-in');

// Custom scroll speeds for each parallax section
const speeds = [0.4, 0.7, 1.0];

function setParallax() {
  parallaxSections.forEach((section, idx) => {
    const speed = speeds[idx] || 0.5;
    const offset = window.pageYOffset;
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    if (offset + window.innerHeight > sectionTop && offset < sectionTop + sectionHeight) {
      const yPos = (offset - sectionTop) * speed;
      section.style.backgroundPosition = `center ${yPos}px`;
    }
  });
}

function animateParallax() {
  setParallax();
  requestAnimationFrame(animateParallax);
}

window.addEventListener('load', animateParallax);
window.addEventListener('resize', setParallax);

// Fade-in animation using Intersection Observer
const observer = new window.IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.2
});

fadeEls.forEach(el => observer.observe(el));

// Scroll progress bar
const progressBar = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';
});

// Parallax scale effect
function setScaleEffect() {
  parallaxSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    if (Math.abs(sectionCenter - viewportCenter) < rect.height / 2) {
      section.classList.add('scaled');
    } else {
      section.classList.remove('scaled');
    }
  });
}

window.addEventListener('scroll', setScaleEffect);
window.addEventListener('resize', setScaleEffect);
window.addEventListener('load', setScaleEffect);

// Smooth scroll to section on CTA button click
const ctaButtons = document.querySelectorAll('.cta-btn[data-next]');
ctaButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    const next = btn.getAttribute('data-next');
    if (next === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (next) {
      const target = document.querySelector(next);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Back to top button logic
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

// Dark mode toggle with default dark mode and localStorage persistence
const themeToggle = document.querySelector('.toggle-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

// Professional SVG icons for theme toggle
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

// Set default theme on load
if (savedTheme === 'dark' || (!savedTheme && prefersDark) || (!savedTheme)) {
  setTheme(true);
} else {
  setTheme(false);
}

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  setTheme(!isDark);
});
