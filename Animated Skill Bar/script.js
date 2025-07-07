document.addEventListener('DOMContentLoaded', function () {
  // Skill data (can be loaded from a JSON file or API)
  const skills = [
    {
      name: 'MongoDB',
      percent: 85,
      color: '#47A248',
      tooltip: 'NoSQL database for modern apps',
    },
    {
      name: 'Express',
      percent: 80,
      color: '#000000',
      tooltip: 'Web framework for Node.js',
    },
    {
      name: 'React',
      percent: 90,
      color: '#61dafb',
      tooltip: 'Frontend library for building UIs',
    },
    {
      name: 'Node.js',
      percent: 88,
      color: '#3C873A',
      tooltip: 'JavaScript runtime for server-side apps',
    },
  ];

  const skillsList = document.getElementById('skillsList');
  const replayBtn = document.getElementById('replayBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const animationSpeedInput = document.getElementById('animationSpeed');

  let animationSpeed = parseInt(animationSpeedInput.value, 10);

  function renderSkills() {
    skillsList.innerHTML = '';
    skills.forEach((skill, idx) => {
      const barId = `progress-bar-${idx}`;
      const percentId = `progress-percent-${idx}`;
      const bar = document.createElement('div');
      bar.className = 'mb-8';
      bar.setAttribute('tabindex', '0');
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', `${skill.name} skill progress bar`);
      bar.setAttribute('title', skill.tooltip);
      bar.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold text-gray-700 dark:text-gray-200">${skill.name}</span>
          <span id="${percentId}" class="font-bold text-gray-800 dark:text-gray-100">0%</span>
        </div>
        <div class="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="${barId}">
          <div class="h-full rounded-lg transition-all duration-1000" style="width:0%; background:${skill.color};"></div>
        </div>
        <div class="sr-only">${skill.tooltip}</div>
      `;
      skillsList.appendChild(bar);
    });
  }

  function animateSkills() {
    skills.forEach((skill, idx) => {
      const bar = document.getElementById(`progress-bar-${idx}`);
      const fill = bar.querySelector('div');
      const percentText = document.getElementById(`progress-percent-${idx}`);
      fill.style.transition = `width ${animationSpeed}ms cubic-bezier(.4,2,.6,1)`;
      fill.style.width = '0%';
      percentText.textContent = '0%';
      bar.setAttribute('aria-valuenow', '0');
      // Animate
      setTimeout(() => {
        fill.style.width = skill.percent + '%';
        let start = null;
        function step(ts) {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / animationSpeed, 1);
          const value = Math.round(progress * skill.percent);
          percentText.textContent = value + '%';
          bar.setAttribute('aria-valuenow', value);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            percentText.textContent = skill.percent + '%';
            bar.setAttribute('aria-valuenow', skill.percent);
          }
        }
        requestAnimationFrame(step);
      }, 50);
    });
  }

  replayBtn.addEventListener('click', () => {
    animateSkills();
    replayBtn.focus();
  });

  animationSpeedInput.addEventListener('input', (e) => {
    animationSpeed = parseInt(e.target.value, 10);
    animateSkills();
  });

  // Keyboard navigation for replay, download, and animation speed
  [replayBtn, downloadBtn, animationSpeedInput].forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // Download as image
  if (window.html2canvas) {
    downloadBtn.addEventListener('click', () => {
      html2canvas(document.querySelector('.max-w-xl')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'mern-skill-bars.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  }

  // Initial render and animation
  renderSkills();
  setTimeout(animateSkills, 200);
}); 