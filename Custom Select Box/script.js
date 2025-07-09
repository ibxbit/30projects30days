const customSelect = document.querySelector('.custom-select');
const optionsList = customSelect.querySelector('.select-options');
const options = Array.from(customSelect.querySelectorAll('.select-option'));
const selectedOption = customSelect.querySelector('.selected-option');
const selectedTagsContainer = customSelect.querySelector('.selected-tags');
const searchInput = customSelect.querySelector('.select-search-input');
let isOpen = false;
let currentIndex = -1;
let selectedValues = [];

// Add checkmark span to each option
options.forEach(opt => {
  const check = document.createElement('span');
  check.className = 'checkmark';
  check.innerHTML = '&#10003;';
  opt.appendChild(check);
});

function openSelect() {
  isOpen = true;
  customSelect.setAttribute('aria-expanded', 'true');
  optionsList.style.display = 'block';
  setTimeout(() => searchInput.focus(), 0);
  filterOptions();
  setActive(getFirstVisibleOptionIdx());
}
function closeSelect() {
  isOpen = false;
  customSelect.setAttribute('aria-expanded', 'false');
  optionsList.style.display = '';
  setActive(-1);
  searchInput.value = '';
  filterOptions();
}
function setActive(idx) {
  options.forEach((opt, i) => {
    opt.classList.toggle('active', i === idx && !opt.hidden);
  });
  currentIndex = idx;
}
function selectOption(idx) {
  const opt = options[idx];
  const value = opt.getAttribute('data-value');
  if (!selectedValues.includes(value)) {
    selectedValues.push(value);
    opt.setAttribute('aria-selected', 'true');
    renderTags();
  }
  closeSelect();
}
function deselectOption(value) {
  selectedValues = selectedValues.filter(v => v !== value);
  const opt = options.find(o => o.getAttribute('data-value') === value);
  if (opt) opt.removeAttribute('aria-selected');
  renderTags();
}
function renderTags() {
  selectedTagsContainer.innerHTML = '';
  if (selectedValues.length === 0) {
    selectedOption.style.display = '';
  } else {
    selectedOption.style.display = 'none';
  }
  selectedValues.forEach(value => {
    const opt = options.find(o => o.getAttribute('data-value') === value);
    if (!opt) return;
    const tag = document.createElement('span');
    tag.className = 'selected-tag';
    tag.innerHTML = `<span class="option-icon">${opt.getAttribute('data-icon')}</span>${opt.textContent.replace('✓','').trim()}`;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-tag';
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `Remove ${opt.textContent.replace('✓','').trim()}`);
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => deselectOption(value);
    tag.appendChild(removeBtn);
    selectedTagsContainer.appendChild(tag);
  });
}
function filterOptions() {
  const q = searchInput.value.trim().toLowerCase();
  options.forEach(opt => {
    if (opt.classList.contains('select-option')) {
      const text = opt.textContent.toLowerCase();
      opt.hidden = q && !text.includes(q);
    }
  });
}
function getFirstVisibleOptionIdx() {
  return options.findIndex(opt => !opt.hidden);
}
customSelect.addEventListener('click', e => {
  if (e.target.classList.contains('select-option')) {
    const idx = options.indexOf(e.target);
    selectOption(idx);
  } else if (e.target.classList.contains('remove-tag')) {
    // handled in renderTags
  } else if (e.target.classList.contains('select-search-input')) {
    // Do nothing, allow typing
  } else {
    isOpen ? closeSelect() : openSelect();
  }
});
customSelect.addEventListener('keydown', e => {
  if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
    openSelect();
    e.preventDefault();
    return;
  }
  if (isOpen) {
    if (e.key === 'ArrowDown') {
      let next = currentIndex;
      do { next = (next + 1) % options.length; } while (options[next].hidden);
      setActive(next);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      let prev = currentIndex;
      do { prev = (prev - 1 + options.length) % options.length; } while (options[prev].hidden);
      setActive(prev);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (currentIndex >= 0 && !options[currentIndex].hidden) selectOption(currentIndex);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      closeSelect();
      e.preventDefault();
    }
  }
});
// Attach search event robustly
searchInput.addEventListener('input', filterOptions);
document.addEventListener('mousedown', e => {
  // Only close if clicking outside the entire custom select
  if (!customSelect.contains(e.target)) {
    closeSelect();
  }
});
// Prevent blur/close when interacting with search input
searchInput.addEventListener('mousedown', e => {
  e.stopPropagation();
});
// Initialize empty
renderTags(); 