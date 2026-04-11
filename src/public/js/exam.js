/* ============================================================
   exam.js — Exam-taking logic: timer, questions, scoring
   ============================================================ */

/* ─── Question Bank ──────────────────────────── */
const QUESTION_BANK = [
  {
    q: 'What is the time complexity of Binary Search on a sorted array of n elements?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correct: 1,
    hint: 'Binary search halves the search space at each step.',
  },
  {
    q: 'Which data structure uses LIFO (Last In, First Out) order?',
    options: ['Queue', 'Linked List', 'Stack', 'Tree'],
    correct: 2,
    hint: 'Think of a stack of plates — you take from the top.',
  },
  {
    q: 'What does the acronym "DFS" stand for in graph traversal?',
    options: ['Dynamic File System', 'Depth-First Search', 'Data Flow Structure', 'Directed File Scan'],
    correct: 1,
    hint: 'It explores as far as possible along each branch before backtracking.',
  },
  {
    q: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
    correct: 2,
    hint: 'Divide and conquer yields O(n log n).',
  },
  {
    q: 'What is the space complexity of a recursive Fibonacci function (naive)?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correct: 1,
    hint: 'The call stack depth is proportional to n.',
  },
  {
    q: 'In a min-heap, where is the smallest element always stored?',
    options: ['Last node', 'Root node', 'Left child', 'Middle node'],
    correct: 1,
    hint: 'By the min-heap property, the root is always the minimum.',
  },
  {
    q: 'Which of the following is NOT a stable sorting algorithm?',
    options: ['Merge Sort', 'Bubble Sort', 'Quick Sort', 'Insertion Sort'],
    correct: 2,
    hint: 'Quick Sort's partitioning can change the relative order of equal elements.',
  },
  {
    q: 'What is the output of: console.log(typeof null) in JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correct: 2,
    hint: 'This is a well-known historical bug in JavaScript.',
  },
  {
    q: 'A complete binary tree with height h has at most __ nodes.',
    options: ['2^h − 1', '2^(h+1) − 1', 'h²', '2h'],
    correct: 1,
    hint: 'Sum of geometric series: 2⁰ + 2¹ + … + 2^h = 2^(h+1) − 1.',
  },
  {
    q: 'Which HTTP status code indicates "Not Found"?',
    options: ['200', '301', '403', '404'],
    correct: 3,
    hint: 'The resource you were looking for could not be found on the server.',
  },
];

/* ─── State ──────────────────────────────────── */
let currentQ  = 0;
let answers   = new Array(QUESTION_BANK.length).fill(null);
let timerSecs = 20 * 60;   // 20 minutes
let timerInterval = null;
const DURATION = 20 * 60;

/* ─── DOM refs ───────────────────────────────── */
const $  = id => document.getElementById(id);
const examInProgress = $('examInProgress');
const examResult     = $('examResult');

/* ─── Timer ──────────────────────────────────── */
function startTimer() {
  timerInterval = setInterval(() => {
    timerSecs--;
    $('timerDisplay').textContent = formatTime(timerSecs);

    // Warn when < 5 min
    if (timerSecs <= 300) {
      $('examTimer').style.color = 'var(--danger)';
      $('examTimer').style.background = 'rgba(239,68,68,0.15)';
      $('examTimer').style.borderColor = 'rgba(239,68,68,0.4)';
    }

    if (timerSecs <= 0) {
      clearInterval(timerInterval);
      Toast.warning('Time is up! Submitting…', 'Time Over');
      setTimeout(submitExam, 800);
    }
  }, 1000);
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/* ─── Render Question ────────────────────────── */
function renderQuestion(index) {
  const q = QUESTION_BANK[index];
  $('questionNum').textContent  = `Question ${index + 1}`;
  $('questionText').textContent = q.q;
  $('questionCounter').textContent = `${index + 1} / ${QUESTION_BANK.length}`;

  const pct = ((index + 1) / QUESTION_BANK.length * 100).toFixed(0);
  $('examProgress').style.width = pct + '%';

  const opts = $('optionsList');
  const keys = ['A', 'B', 'C', 'D'];
  opts.innerHTML = q.options.map((opt, i) => `
    <div class="option-item ${answers[index] === i ? 'selected' : ''}"
         data-idx="${i}" role="button" tabindex="0" aria-label="Option ${keys[i]}: ${opt}">
      <div class="option-key">${keys[i]}</div>
      <span>${opt}</span>
    </div>
  `).join('');

  opts.querySelectorAll('.option-item').forEach(el => {
    el.addEventListener('click', () => selectOption(index, +el.dataset.idx));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selectOption(index, +el.dataset.idx); });
  });

  /* Nav buttons */
  $('prevBtn').disabled = index === 0;
  $('nextBtn').textContent = index === QUESTION_BANK.length - 1 ? 'Finish →' : '';
  $('nextBtn').innerHTML = index === QUESTION_BANK.length - 1
    ? 'Finish <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
    : 'Next <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';

  renderDots(index);
}

/* ─── Option Selection ───────────────────────── */
function selectOption(qIndex, optIndex) {
  answers[qIndex] = optIndex;
  renderQuestion(qIndex);
  renderDots(qIndex);
}

/* ─── Question Dots ──────────────────────────── */
function renderDots(active) {
  const wrap = $('questionDots');
  wrap.innerHTML = QUESTION_BANK.map((_, i) => {
    let cls = '';
    if (i === active)       cls = 'current';
    else if (answers[i] !== null) cls = 'answered';
    return `<div class="q-dot ${cls}" data-q="${i}" title="Question ${i+1}" tabindex="0">${i+1}</div>`;
  }).join('');

  wrap.querySelectorAll('.q-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      currentQ = +dot.dataset.q;
      renderQuestion(currentQ);
    });
  });
}

/* ─── Navigation ─────────────────────────────── */
$('prevBtn')?.addEventListener('click', () => {
  if (currentQ > 0) { currentQ--; renderQuestion(currentQ); }
});

$('nextBtn')?.addEventListener('click', () => {
  if (currentQ < QUESTION_BANK.length - 1) {
    currentQ++;
    renderQuestion(currentQ);
  } else {
    openSubmitModal();
  }
});

/* ─── Submit Modal ───────────────────────────── */
const modal = $('submitModal');

function openSubmitModal() {
  const unanswered = answers.filter(a => a === null).length;
  $('modalUnansweredMsg').textContent = unanswered > 0
    ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`
    : 'Are you ready to submit your exam?';
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

$('submitExamBtn')?.addEventListener('click', openSubmitModal);

$('modalCancelBtn')?.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.style.display = 'none';
});

$('modalConfirmBtn')?.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.style.display = 'none';
  submitExam();
});

/* ─── Score Calculation & Result ─────────────── */
function submitExam() {
  clearInterval(timerInterval);

  let correct = 0;
  answers.forEach((ans, i) => {
    if (ans === QUESTION_BANK[i].correct) correct++;
  });

  const wrong   = answers.filter((a, i) => a !== null && a !== QUESTION_BANK[i].correct).length;
  const skipped = answers.filter(a => a === null).length;
  const pct     = Math.round((correct / QUESTION_BANK.length) * 100);
  const timeTaken = Math.round((DURATION - timerSecs) / 60);

  /* Save to localStorage */
  const user    = Auth.getUser();
  const history = JSON.parse(localStorage.getItem('ee_results') || '[]');
  history.unshift({ userId: user?.id, exam: 'Algorithms & Complexity', subject: 'CS', score: pct, date: new Date().toISOString(), status: pct >= 50 ? 'Passed' : 'Failed' });
  localStorage.setItem('ee_results', JSON.stringify(history.slice(0, 50)));

  /* Animate result ring */
  examInProgress.classList.add('hidden');
  examResult.classList.remove('hidden');

  $('resultScorePct').textContent  = pct + '%';
  $('resultCorrect').textContent   = correct;
  $('resultWrong').textContent     = wrong;
  $('resultSkipped').textContent   = skipped;

  // Animate ring (stroke-dashoffset from 490 to (1 - pct/100)*490)
  const fill = $('resultRingFill');
  if (fill) {
    const circumf = 2 * Math.PI * 78;   // r=78
    fill.setAttribute('stroke-dasharray',  circumf);
    fill.setAttribute('stroke-dashoffset', circumf);
    setTimeout(() => {
      fill.style.transition  = 'stroke-dashoffset 1.2s ease';
      fill.setAttribute('stroke-dashoffset', circumf * (1 - pct / 100));
    }, 100);
  }

  const msg = pct >= 80 ? '🎉 Excellent work!' : pct >= 60 ? '👍 Good job!' : '📚 Keep practising!';
  Toast.info(msg, `Score: ${pct}%`);
}

/* ─── Retake ─────────────────────────────────── */
$('retakeBtn')?.addEventListener('click', () => {
  currentQ  = 0;
  answers   = new Array(QUESTION_BANK.length).fill(null);
  timerSecs = DURATION;
  $('timerDisplay').textContent = formatTime(timerSecs);
  $('examTimer').removeAttribute('style');

  examResult.classList.add('hidden');
  examInProgress.classList.remove('hidden');
  renderQuestion(0);
  startTimer();
});

/* ─── Anti-cheat: Tab Visibility ─────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && examInProgress && !examInProgress.classList.contains('hidden')) {
    Toast.warning('Tab switch detected! Stay focused.', 'Warning');
  }
});

/* Right-click & copy-paste disable during exam */
document.addEventListener('contextmenu', e => {
  if (!examInProgress?.classList?.contains('hidden')) e.preventDefault();
});
document.addEventListener('copy',  e => { if (!examInProgress?.classList?.contains('hidden')) e.preventDefault(); });
document.addEventListener('paste', e => { if (!examInProgress?.classList?.contains('hidden')) e.preventDefault(); });

/* ─── Init ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderQuestion(0);
  startTimer();
});
