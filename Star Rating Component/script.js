const stars = Array.from(document.querySelectorAll('.star-rating .star'));
const ratingValue = document.querySelector('.rating-number');
const starRating = document.querySelector('.star-rating');
const clearBtn = document.querySelector('.clear-rating');
let selected = 0;
let hover = 0;

function updateStars() {
  stars.forEach((star, i) => {
    const value = parseFloat(star.getAttribute('data-value'));
    const isHalf = star.hasAttribute('data-half');
    // Fill if value <= hover or selected
    let fill = false;
    if (hover) fill = value <= hover;
    else fill = value <= selected;
    star.classList.toggle('filled', fill);
    star.classList.toggle('selected', value === selected);
    star.setAttribute('aria-checked', selected === value ? 'true' : 'false');
    star.tabIndex = selected === value ? 0 : -1;
  });
  ratingValue.textContent = selected || 0;
}

stars.forEach((star, i) => {
  const value = parseFloat(star.getAttribute('data-value'));
  star.addEventListener('mouseenter', () => {
    hover = value;
    updateStars();
  });
  star.addEventListener('mouseleave', () => {
    hover = 0;
    updateStars();
  });
  star.addEventListener('click', () => {
    selected = value;
    updateStars();
  });
  star.addEventListener('focus', () => {
    hover = value;
    updateStars();
  });
  star.addEventListener('blur', () => {
    hover = 0;
    updateStars();
  });
});

starRating.addEventListener('keydown', e => {
  const values = stars.map(star => parseFloat(star.getAttribute('data-value')));
  let idx = values.indexOf(selected);
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    idx = Math.min(idx + 1, stars.length - 1);
    selected = values[idx];
    stars[idx].focus();
    updateStars();
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    idx = Math.max(idx - 1, 0);
    selected = values[idx];
    stars[idx].focus();
    updateStars();
    e.preventDefault();
  } else if (e.key === ' ' || e.key === 'Enter') {
    updateStars();
    e.preventDefault();
  }
});

clearBtn.addEventListener('click', () => {
  selected = 0;
  updateStars();
});

updateStars(); 