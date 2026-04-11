/* ============================================================
   routes/exams.js — Exam listing, detail & submission endpoints
   ============================================================ */

'use strict';

const express = require('express');
const { ExamStore }  = require('../data/exams');
const { ResultStore } = require('../data/store');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/* ──────────────────────────────────────────────
   GET /api/exams
   Returns list of all exams (no questions, no answers)
   ────────────────────────────────────────────── */
router.get('/', requireAuth, (_req, res) => {
  res.json({ exams: ExamStore.all() });
});

/* ──────────────────────────────────────────────
   GET /api/exams/:id
   Returns exam metadata + questions (correct answers stripped)
   ────────────────────────────────────────────── */
router.get('/:id', requireAuth, (req, res) => {
  const exam = ExamStore.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: 'Exam not found.' });

  res.json({ exam: ExamStore.sanitizeForClient(exam) });
});

/* ──────────────────────────────────────────────
   POST /api/exams/:id/submit
   Body: { answers: [ { questionId, selectedOption } ] }
   Returns: { score, correct, wrong, skipped, pct, results[] }
   ────────────────────────────────────────────── */
router.post('/:id/submit', requireAuth, (req, res) => {
  const exam = ExamStore.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: 'Exam not found.' });

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: 'answers must be an array.' });
  }

  /* ── Grade ── */
  let correct = 0, wrong = 0, skipped = 0;
  const gradedResults = exam.questions.map(q => {
    const submission = answers.find(a => a.questionId === q.id);
    const selected   = submission?.selectedOption ?? null;
    let verdict;

    if (selected === null || selected === undefined) {
      skipped++;
      verdict = 'skipped';
    } else if (selected === q.correct) {
      correct++;
      verdict = 'correct';
    } else {
      wrong++;
      verdict = 'wrong';
    }

    return {
      questionId:   q.id,
      questionText: q.text,
      selected,
      correct:      q.correct,
      verdict,
      explanation:  q.explanation,
    };
  });

  const total = exam.questions.length;
  const pct   = Math.round((correct / total) * 100);
  const passed = pct >= 50;

  /* ── Persist result ── */
  const savedResult = ResultStore.addResult(
    req.user.id,
    exam.id,
    pct,
    { correct, wrong, skipped, total }
  );

  return res.json({
    resultId: savedResult.id,
    score:    pct,
    correct,
    wrong,
    skipped,
    total,
    passed,
    takenAt:  savedResult.takenAt,
    results:  gradedResults,
  });
});

/* ──────────────────────────────────────────────
   GET /api/exams/results/me
   Returns the current user's result history
   ────────────────────────────────────────────── */
router.get('/results/me', requireAuth, (req, res) => {
  const history = ResultStore.byUser(req.user.id);
  res.json({ results: history });
});

/* ──────────────────────────────────────────────
   GET /api/exams/results/all  (admin only)
   ────────────────────────────────────────────── */
router.get('/results/all', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ message: 'Admin result aggregation — connect a DB for production.' });
});

module.exports = router;
