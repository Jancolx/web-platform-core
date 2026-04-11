/* ============================================================
   data/exams.js — Exam question bank
   ============================================================ */

'use strict';

const { v4: uuidv4 } = require('uuid');

const EXAMS = [
  {
    id: 'exam-ds-01',
    title: 'Data Structures Fundamentals',
    subject: 'Computer Science',
    difficulty: 'Medium',
    durationMins: 30,
    questions: [
      {
        id: uuidv4(), text: 'What is the time complexity of Binary Search?',
        options: ['O(n)','O(log n)','O(n log n)','O(1)'], correct: 1,
        explanation: 'Binary search halves the search space each iteration → O(log n).',
      },
      {
        id: uuidv4(), text: 'Which data structure uses LIFO order?',
        options: ['Queue','Linked List','Stack','Tree'], correct: 2,
        explanation: 'Stack follows Last In, First Out.',
      },
      {
        id: uuidv4(), text: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)','O(n)','O(n²)','O(log n)'], correct: 2,
        explanation: 'Worst case occurs when pivot is always the smallest or largest element.',
      },
      {
        id: uuidv4(), text: 'In a min-heap, the root always contains the…',
        options: ['Maximum element','Median element','Minimum element','Last inserted element'], correct: 2,
        explanation: 'Min-heap property: parent ≤ children.',
      },
      {
        id: uuidv4(), text: 'Which traversal of a BST gives elements in sorted order?',
        options: ['Preorder','Inorder','Postorder','Level-order'], correct: 1,
        explanation: 'Inorder (left → root → right) visits BST nodes in ascending order.',
      },
    ],
  },
  {
    id: 'exam-algo-02',
    title: 'Algorithms & Complexity',
    subject: 'Computer Science',
    difficulty: 'Hard',
    durationMins: 20,
    questions: [
      {
        id: uuidv4(), text: 'What does DFS stand for?',
        options: ['Dynamic File System','Depth-First Search','Data Flow Structure','Directed File Scan'], correct: 1,
        explanation: 'DFS explores as far as possible before backtracking.',
      },
      {
        id: uuidv4(), text: 'Which algorithm finds shortest path in an unweighted graph?',
        options: ['Dijkstra','Bellman-Ford','BFS','DFS'], correct: 2,
        explanation: 'BFS explores level by level, naturally giving shortest paths in unweighted graphs.',
      },
      {
        id: uuidv4(), text: 'What is the space complexity of the naive recursive Fibonacci?',
        options: ['O(1)','O(n)','O(log n)','O(n²)'], correct: 1,
        explanation: 'The call stack depth is proportional to n.',
      },
      {
        id: uuidv4(), text: 'Which algorithm is used to find MST of a graph?',
        options: ['Dijkstra','Kruskal','Floyd-Warshall','Topological Sort'], correct: 1,
        explanation: 'Kruskal\'s algorithm greedily adds the smallest weight edges without forming cycles.',
      },
      {
        id: uuidv4(), text: 'The Master Theorem is used to analyse…',
        options: ['Graph algorithms','Dynamic programming','Divide and conquer recurrences','Greedy algorithms'], correct: 2,
        explanation: 'Master Theorem solves recurrences of the form T(n) = aT(n/b) + f(n).',
      },
    ],
  },
  {
    id: 'exam-os-03',
    title: 'Operating Systems Basics',
    subject: 'Systems',
    difficulty: 'Easy',
    durationMins: 25,
    questions: [
      {
        id: uuidv4(), text: 'What is a deadlock?',
        options: [
          'A running process',
          'A situation where processes wait indefinitely for resources held by each other',
          'CPU scheduling policy',
          'Memory leak',
        ], correct: 1,
        explanation: 'Deadlock: circular dependency of resource waiting.',
      },
      {
        id: uuidv4(), text: 'Which scheduling algorithm gives the shortest average waiting time?',
        options: ['FCFS','Round Robin','SJF','Priority'], correct: 2,
        explanation: 'Shortest Job First minimises average waiting time.',
      },
      {
        id: uuidv4(), text: 'Virtual memory allows processes to use more memory than…',
        options: ['Disk size','CPU cache','Physical RAM','Page file'], correct: 2,
        explanation: 'Virtual memory uses disk as an extension of RAM.',
      },
      {
        id: uuidv4(), text: 'What is a context switch?',
        options: [
          'Changing CPU clock speed',
          'Saving and restoring the state of a process when the CPU switches tasks',
          'Swapping processes to disk',
          'Starting a new process',
        ], correct: 1,
        explanation: 'Context switch saves PCB of the current process and loads PCB of the next.',
      },
      {
        id: uuidv4(), text: 'Which of the following is NOT a condition for deadlock?',
        options: ['Mutual Exclusion','Hold and Wait','Starvation','Circular Wait'], correct: 2,
        explanation: 'Starvation is NOT a Coffman condition for deadlock.',
      },
    ],
  },
];

const ExamStore = {
  all:      ()     => EXAMS.map(({ questions: _, ...meta }) => ({ ...meta, questionCount: EXAMS.find(e => e.id === meta.id).questions.length })),
  findById: (id)   => EXAMS.find(e => e.id === id),

  /** Strip correct answers before sending to client during exam */
  sanitizeForClient: (exam) => ({
    ...exam,
    questions: exam.questions.map(({ correct: _, explanation: __, ...q }) => q),
  }),
};

module.exports = { ExamStore };
