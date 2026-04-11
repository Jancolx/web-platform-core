/* ============================================================
   dashboard.js — Student dashboard page logic
   ============================================================ */

/* ─── Mock Data ─────────────────────────────── */
const EXAMS = [
  { id: 'ex1', title: 'Data Structures Fundamentals', subject: 'Computer Science', questions: 20, duration: 30, difficulty: 'Medium', emoji: '🌲' },
  { id: 'ex2', title: 'Algorithms & Complexity',      subject: 'Computer Science', questions: 10, duration: 20, difficulty: 'Hard',   emoji: '⚡' },
  { id: 'ex3', title: 'Operating Systems Basics',      subject: 'Systems',          questions: 15, duration: 25, difficulty: 'Easy',   emoji: '🖥️' },
  { id: 'ex4', title: 'Calculus Chapter 6',            subject: 'Mathematics',      questions: 12, duration: 20, difficulty: 'Hard',   emoji: '📐' },
  { id: 'ex5', title: 'Network Protocols',             subject: 'Networking',       questions: 20, duration: 35, difficulty: 'Medium', emoji: '🌐' },
  { id: 'ex6', title: 'English Grammar Pro',           subject: 'English',          questions: 25, duration: 40, difficulty: 'Easy',   emoji: '📝' },
];

const RESULTS = [
  { exam: 'Linear Algebra',    subject: 'Mathematics',      score: 88, date: '2025-04-10', status: 'Passed' },
  { exam: 'DBMS Core Concepts',subject: 'Computer Science', score: 62, date: '2025-04-08', status: 'Passed' },
  { exam: 'Thermodynamics',    subject: 'Physics',          score: 45, date: '2025-04-06', status: 'Failed' },
  { exam: 'Graph Algorithms',  subject: 'Computer Science', score: 78, date: '2025-04-04', status: 'Passed' },
  { exam: 'Organic Chemistry', subject: 'Chemistry',        score: 55, date: '2025-04-02', status: 'Passed' },
];

/* ─── Difficulty Badge color ─────────────────── */
const difficultyBadge = {
  Easy:   'badge-success',
  Medium: 'badge-warning',
  Hard:   'badge-danger',
};

/* ─── Render Exam Cards ──────────────────────── */
function renderExams(exams) {
  const grid = document.getElementById('examsGrid');
  if (!grid) return;
  grid.innerHTML = exams.map(ex => `
    <div class="exam-card">
      <div class="exam-card-header">
        <div class="exam-icon" style="background:rgba(99,102,241,0.1)">${ex.emoji}</div>
        <span class="badge ${difficultyBadge[ex.difficulty]}">${ex.difficulty}</span>
      </div>
      <div>
        <div class="exam-card-title">${ex.title}</div>
        <div class="exam-card-sub">${ex.subject}</div>
      </div>
      <div class="exam-meta">
        <div class="exam-meta-item">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ${ex.questions} Qs
        </div>
        <div class="exam-meta-item">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ${ex.duration} min
        </div>
      </div>
      <div class="exam-card-footer">
        <a href="exam.html?exam=${ex.id}" class="btn btn-primary btn-sm btn-full">Start Exam →</a>
      </div>
    </div>
  `).join('');
}

/* ─── Render Results Table ───────────────────── */
function renderResults(results) {
  const tbody = document.getElementById('resultsTableBody');
  if (!tbody) return;
  tbody.innerHTML = results.map(r => {
    const statusClass = r.status === 'Passed' ? 'badge-success' : 'badge-danger';
    const scoreColor  = r.score >= 70 ? 'var(--success)' : r.score >= 50 ? 'var(--warning)' : 'var(--danger)';
    return `
      <tr>
        <td><strong>${r.exam}</strong></td>
        <td class="text-muted">${r.subject}</td>
        <td><strong style="color:${scoreColor}">${r.score}%</strong></td>
        <td class="text-muted">${new Date(r.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
        <td><span class="badge ${statusClass}">${r.status}</span></td>
      </tr>`;
  }).join('');
}

/* ─── Restore user name ──────────────────────── */
function restoreUser() {
  const user = Auth.getUser();
  const nameEl = document.getElementById('sidebarUserName');
  const welcomeEl = document.getElementById('welcomeMsg');
  if (user) {
    const first = (user.name || user.email || 'Student').split(' ')[0];
    if (nameEl)    nameEl.textContent    = user.name || user.email;
    if (welcomeEl) welcomeEl.textContent = `Welcome back, ${first}! 👋`;
  }
}

/* ─── Logout ─────────────────────────────────── */
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  Auth.logout();
});

/* ─── Search filter ──────────────────────────── */
const searchInput = document.querySelector('.dash-search input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    const filtered = EXAMS.filter(ex =>
      ex.title.toLowerCase().includes(q) || ex.subject.toLowerCase().includes(q)
    );
    renderExams(filtered);
  });
}

/* ─── Init ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  restoreUser();
  renderExams(EXAMS);
  renderResults(RESULTS);
});
