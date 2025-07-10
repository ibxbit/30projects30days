const passwordInput = document.getElementById('password-input');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');
const togglePassword = document.querySelector('.toggle-password');
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqNumber = document.getElementById('req-number');
const reqSymbol = document.getElementById('req-symbol');

function getPasswordStrength(password) {
  let score = 0;
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (hasLength) score++;
  if (hasUpper) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;
  if (password.length >= 12) score++;
  return { score, hasLength, hasUpper, hasNumber, hasSymbol };
}

function updateStrength() {
  const val = passwordInput.value;
  const { score, hasLength, hasUpper, hasNumber, hasSymbol } = getPasswordStrength(val);

  // Update requirements checklist
  reqLength.classList.toggle('met', hasLength);
  reqUppercase.classList.toggle('met', hasUpper);
  reqNumber.classList.toggle('met', hasNumber);
  reqSymbol.classList.toggle('met', hasSymbol);

  if (!val) {
    strengthBar.style.width = '0%';
    strengthBar.className = 'strength-bar';
    strengthText.textContent = '-';
    strengthText.className = 'strength-text';
    return;
  }
  let label, strengthClass, width;
  if (score <= 1) {
    label = 'Very Weak'; strengthClass = 'strength-veryweak'; width = '20%';
  } else if (score === 2) {
    label = 'Weak'; strengthClass = 'strength-weak'; width = '40%';
  } else if (score === 3) {
    label = 'Medium'; strengthClass = 'strength-medium'; width = '60%';
  } else if (score === 4) {
    label = 'Strong'; strengthClass = 'strength-strong'; width = '80%';
  } else {
    label = 'Very Strong'; strengthClass = 'strength-verystrong'; width = '100%';
  }
  strengthBar.style.width = width;
  strengthBar.className = 'strength-bar ' + strengthClass;
  strengthText.textContent = label;
  strengthText.className = 'strength-text ' + strengthClass;
}

passwordInput.addEventListener('input', updateStrength);

togglePassword.addEventListener('click', () => {
  const isPwd = passwordInput.type === 'password';
  passwordInput.type = isPwd ? 'text' : 'password';
  togglePassword.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
  togglePassword.textContent = isPwd ? '🙈' : '👁️';
});

updateStrength(); 