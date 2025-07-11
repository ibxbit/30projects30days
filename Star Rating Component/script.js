// Get references to DOM elements
const stars = Array.from(document.querySelectorAll('.star-rating .star'));
const ratingValue = document.querySelector('.rating-number');
const starRating = document.querySelector('.star-rating');
const clearBtn = document.querySelector('.clear-rating');
let selected = 0; // Currently selected rating
let hover = 0;    // Currently hovered rating

// Update the visual state of the stars based on selected/hovered value
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
    // Accessibility: update aria-checked and tabIndex
    star.setAttribute('aria-checked', selected === value ? 'true' : 'false');
    star.tabIndex = selected === value ? 0 : -1;
  });
  // Update the displayed rating number
  ratingValue.textContent = selected || 0;
}

// Add mouse and keyboard event listeners to each star
stars.forEach((star, i) => {
  const value = parseFloat(star.getAttribute('data-value'));
  // Highlight stars on hover
  star.addEventListener('mouseenter', () => {
    hover = value;
    updateStars();
  });
  // Remove highlight when not hovering
  star.addEventListener('mouseleave', () => {
    hover = 0;
    updateStars();
  });
  // Select rating on click
  star.addEventListener('click', () => {
    selected = value;
    updateStars();
  });
  // Keyboard accessibility: highlight on focus
  star.addEventListener('focus', () => {
    hover = value;
    updateStars();
  });
  // Remove highlight on blur
  star.addEventListener('blur', () => {
    hover = 0;
    updateStars();
  });
});

// Keyboard navigation for the star rating group
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

// Clear the rating when the clear button is clicked
clearBtn.addEventListener('click', () => {
  selected = 0;
  updateStars();
});

// Initialize the stars on page load
updateStars(); 