const testParagraph = document.getElementById('testParagraph');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const keyboardContainer = document.getElementById('keyboard');
const hiddenInput = document.getElementById('hiddenInput');

const punctuationBtn = document.getElementById('punctuationBtn');
const numbersBtn = document.getElementById('numbersBtn');
const caseBtn = document.getElementById('caseBtn');
const timeBtns = document.querySelectorAll('.time-btn');

const baseParagraphs = [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    "Sphinx of black quartz, judge my vow. Waltz, nymph, for quick jigs vex Bud. Bright vixens jump; dozy fowl quack.",
    "Jackdaws love my big sphinx of quartz. The five boxing wizards jump quickly. Quick zephyrs blow, vexing daft Jim.",
    "Crazy Fredrick bought many very exquisite opal jewels. We promptly judged antique ivory buckles for the next prize.",
    "Amazingly few discotheques provide jukeboxes. Heavy boxes perform quick waltzes and jigs."
];

const extraParagraphs = [
    "123 easy as 456, but 789 is tricky!",
    "C0ding is fun: try { let x = 42; }!",
    "Why so serious? Let's type: @#&*!",
    "Mixing UPPER and lower CASE is fun!",
    "Numbers: 9876543210. Punctuation: !?,.;:()[]{}"
];

let timer = null;
let startTime = null;
let elapsed = 0;
let finished = false;
let started = false;
let currentParagraph = '';
let userInput = '';
let sessionTime = 30;
let timeLeft = 30;
let allowPunctuation = false;
let allowNumbers = false;
let allowCase = false;
let totalCorrectChars = 0;
let paragraphIndex = 0;
let longParagraphs = [];
let longParagraphIndex = 0;

const keyboardRows = [
    ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
    ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['CapsLock','A','S','D','F','G','H','J','K','L',';','\'','Enter'],
    ['Shift','Z','X','C','V','B','N','M',',','.','/','Shift'],
    ['Ctrl','Win','Alt','Space','Alt','Win','Menu','Ctrl']
];

function getAllowedCharset() {
    let charset = 'abcdefghijklmnopqrstuvwxyz ';
    if (allowCase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (allowNumbers) charset += '0123456789';
    if (allowPunctuation) charset += "!@#$%^&*()[]{}.,;:'\"?<>-_=+";
    return charset;
}

function generateRandomParagraph(length = 80) {
    const charset = getAllowedCharset();
    let str = '';
    for (let i = 0; i < length; i++) {
        let ch = charset[Math.floor(Math.random() * charset.length)];
        // Avoid double spaces
        if (ch === ' ' && (i === 0 || str[str.length - 1] === ' ')) {
            i--;
            continue;
        }
        str += ch;
    }
    return str.trim();
}

function getParagraphs() {
    let pool = [...baseParagraphs];
    if (allowPunctuation || allowNumbers || allowCase) {
        pool = pool.concat(extraParagraphs);
    }
    return pool.filter(p => {
        if (!allowPunctuation && /[!@#\$%\^&\*\(\)\[\]\{\}\.,;:'"?<>\-_=+]/.test(p)) return false;
        if (!allowNumbers && /[0-9]/.test(p)) return false;
        if (!allowCase && /[A-Z]/.test(p)) return false;
        return true;
    });
}

function renderParagraph(text, userInput = '') {
    testParagraph.innerHTML = '';
    let charIndex = 0;
    text.split(/(\s+)/).forEach((chunk, chunkIdx) => {
        if (chunk.trim() === '') {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.textContent = '·';
            testParagraph.appendChild(dot);
            charIndex += chunk.length;
        } else {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            for (let i = 0; i < chunk.length; i++) {
                const letterSpan = document.createElement('span');
                letterSpan.className = 'letter';
                const absIndex = charIndex + i;
                letterSpan.textContent = chunk[i];
                if (userInput.length > absIndex) {
                    if (userInput[absIndex] === chunk[i]) {
                        letterSpan.classList.add('correct');
                    } else {
                        letterSpan.classList.add('incorrect');
                    }
                }
                if (userInput.length === absIndex && !finished) {
                    letterSpan.classList.add('current');
                }
                wordSpan.appendChild(letterSpan);
            }
            testParagraph.appendChild(wordSpan);
            charIndex += chunk.length;
        }
    });
}

function buildLongParagraphs() {
    // Concatenate 3-4 paragraphs at a time to make long texts
    const pool = baseParagraphs.concat(extraParagraphs);
    longParagraphs = [];
    for (let i = 0; i < pool.length; i += 3) {
        let chunk = pool.slice(i, i + 3).join(' ');
        longParagraphs.push(chunk);
    }
    if (longParagraphs.length === 0) {
        longParagraphs = ['No paragraphs available.'];
    }
}

function setNextLongParagraph() {
    if (longParagraphs.length === 0) buildLongParagraphs();
    currentParagraph = longParagraphs[longParagraphIndex % longParagraphs.length];
    longParagraphIndex++;
    userInput = '';
    renderParagraph(currentParagraph, userInput);
}

function resetTest() {
    clearInterval(timer);
    paragraphIndex = 0;
    longParagraphIndex = 0;
    buildLongParagraphs();
    setNextLongParagraph();
    wpmDisplay.textContent = '--';
    accuracyDisplay.textContent = '0';
    scoreDisplay.textContent = '--';
    timerDisplay.textContent = sessionTime.toFixed(1);
    finished = false;
    started = false;
    startTime = null;
    elapsed = 0;
    timeLeft = sessionTime;
    totalCorrectChars = 0;
    highlightKeyboard(null);
}

function startTest() {
    userInput = '';
    wpmDisplay.textContent = '--';
    accuracyDisplay.textContent = '0';
    scoreDisplay.textContent = '--';
    timerDisplay.textContent = sessionTime.toFixed(1);
    finished = false;
    started = false;
    startTime = null;
    elapsed = 0;
    timeLeft = sessionTime;
    totalCorrectChars = 0;
    highlightKeyboard(null);
    renderParagraph(currentParagraph, userInput);
    testParagraph.focus();
    hiddenInput.focus();
}

function updateStats() {
    const input = userInput;
    const target = currentParagraph;
    // Count correct characters for this paragraph (including spaces)
    let correctChars = 0;
    for (let i = 0; i < input.length; i++) {
        if (input[i] === target[i]) correctChars++;
    }
    // Timer
    if (started) {
        timerDisplay.textContent = timeLeft.toFixed(1);
    }
    // Only show WPM after timer ends
    if ((finished || timeLeft <= 0) && started) {
        const timeElapsed = sessionTime - timeLeft;
        const wpm = timeElapsed > 0 ? Math.round(totalCorrectChars / 5 / (timeElapsed / 60)) : 0;
        wpmDisplay.textContent = wpm;
        // Accuracy: correct chars / total typed (for last paragraph)
        const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0;
        accuracyDisplay.textContent = accuracy;
        const score = Math.round(wpm * (accuracy / 100));
        scoreDisplay.textContent = score;
    } else {
        wpmDisplay.textContent = '--';
        // Accuracy: correct chars / total typed (for current paragraph)
        const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0;
        accuracyDisplay.textContent = accuracy;
        scoreDisplay.textContent = '--';
    }
    // If user finishes long paragraph before time ends, add correct chars and load the next long paragraph
    if (input === target && started && !finished && timeLeft > 0) {
        totalCorrectChars += correctChars;
        setNextLongParagraph();
        userInput = '';
        renderParagraph(currentParagraph, userInput);
    }
    // Finish if time runs out
    if (timeLeft <= 0 && started && !finished) {
        // Add correct chars for the last paragraph
        totalCorrectChars += correctChars;
        finished = true;
        clearInterval(timer);
        updateStats();
        setTimeout(() => {
            resetTest();
            startTest();
        }, 1000);
    }
}

function handleInput(char) {
    if (finished) return;
    if (!started) {
        started = true;
        startTime = Date.now();
        timer = setInterval(tick, 100);
    }
    if (userInput.length < currentParagraph.length) {
        userInput += char;
        renderParagraph(currentParagraph, userInput);
        updateStats();
    }
}

function handleBackspace() {
    if (finished) return;
    if (userInput.length > 0) {
        userInput = userInput.slice(0, -1);
        renderParagraph(currentParagraph, userInput);
        updateStats();
    }
}

testParagraph.addEventListener('focus', () => hiddenInput.focus());

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Backspace') {
        handleBackspace();
        highlightKeyboard('Backspace');
        e.preventDefault();
    } else if (e.key.length === 1) {
        handleInput(allowCase ? e.key : e.key.toLowerCase());
        highlightKeyboard(e.key);
        e.preventDefault();
    } else if (e.key === 'Tab') {
        e.preventDefault();
    }
});

hiddenInput.addEventListener('input', function(e) {
    // For mobile: sync hidden input to userInput
    const val = allowCase ? hiddenInput.value : hiddenInput.value.toLowerCase();
    if (val.length < userInput.length) {
        userInput = userInput.slice(0, val.length);
    } else if (val.length > userInput.length) {
        userInput += val.slice(userInput.length);
    }
    renderParagraph(currentParagraph, userInput);
    updateStats();
});

function renderKeyboard() {
    keyboardContainer.innerHTML = '';
    keyboardRows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key';
            keyDiv.dataset.key = key;
            keyDiv.textContent = key === ' ' ? 'Space' : key;
            rowDiv.appendChild(keyDiv);
        });
        keyboardContainer.appendChild(rowDiv);
    });
}

function highlightKeyboard(key) {
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
    if (!key) return;
    let match = key;
    if (key === ' ') match = 'Space';
    if (key === 'Control') match = 'Ctrl';
    if (key === 'Meta') match = 'Win';
    document.querySelectorAll('.key').forEach(k => {
        if (k.dataset.key.toLowerCase() === match.toLowerCase()) {
            k.classList.add('active');
        }
    });
}

function tick() {
    if (!started || finished) return;
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
        timeLeft = 0;
        finished = true;
        clearInterval(timer);
        updateStats();
        setTimeout(() => {
            resetTest();
            startTest();
        }, 1000);
        return;
    }
    updateStats();
}

// Settings bar logic
punctuationBtn.addEventListener('click', () => {
    allowPunctuation = !allowPunctuation;
    punctuationBtn.classList.toggle('active', allowPunctuation);
    resetTest();
    startTest();
});
numbersBtn.addEventListener('click', () => {
    allowNumbers = !allowNumbers;
    numbersBtn.classList.toggle('active', allowNumbers);
    resetTest();
    startTest();
});
caseBtn.addEventListener('click', () => {
    allowCase = !allowCase;
    caseBtn.classList.toggle('active', allowCase);
    resetTest();
    startTest();
});
timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        timeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sessionTime = parseInt(btn.dataset.time, 10);
        resetTest();
        startTest();
    });
});

testParagraph.addEventListener('click', () => {
    testParagraph.focus();
    hiddenInput.focus();
});

renderKeyboard();
resetTest();
startTest(); 