export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  progressPercent: number;
  totalModules: number;
  completedModules: number;
  color: string;
}

export interface StudyTask {
  id: string;
  courseCode: string;
  title: string;
  dueDate: string;
  isExam: boolean;
  isCompleted: boolean;
}

export interface RecentResource {
  id: string;
  courseCode: string;
  title: string;
  type: string;
  updatedAt: string;
}

export const ACTIVE_COURSES: Course[] = [
  {
    id: "cs-301",
    code: "CS 301",
    name: "Design & Analysis of Algorithms",
    instructor: "Prof. Hiroshi Tanaka",
    progressPercent: 68,
    totalModules: 5,
    completedModules: 3,
    color: "#6b8048", // Matcha
  },
  {
    id: "cs-340",
    code: "CS 340",
    name: "Distributed Database Systems",
    instructor: "Dr. Elena Vance",
    progressPercent: 42,
    totalModules: 6,
    completedModules: 2,
    color: "#b08968", // Earth clay
  },
  {
    id: "math-210",
    code: "MATH 210",
    name: "Applied Linear Algebra",
    instructor: "Prof. Kenneth Sato",
    progressPercent: 85,
    totalModules: 4,
    completedModules: 3,
    color: "#607274", // Slate river
  },
];

export const UPCOMING_TASKS: StudyTask[] = [
  {
    id: "task-1",
    courseCode: "CS 301",
    title: "Dynamic Programming: Knapsack & Longest Common Subsequence",
    dueDate: "Tomorrow, 18:00",
    isExam: false,
    isCompleted: false,
  },
  {
    id: "task-2",
    courseCode: "CS 340",
    title: "Mid-Term Examination: Raft & Paxos Consensus",
    dueDate: "Nov 12, 10:00 AM",
    isExam: true,
    isCompleted: false,
  },
  {
    id: "task-3",
    courseCode: "MATH 210",
    title: "Review SVD Decomposition Notes & Practice Flashcards",
    dueDate: "Nov 15, 23:59",
    isExam: false,
    isCompleted: true,
  },
];

export const RECENT_RESOURCES: RecentResource[] = [
  {
    id: "res-1",
    courseCode: "CS 301",
    title: "Greedy Algorithms vs Dynamic Programming - Comparison Matrix",
    type: "Cheat Sheet",
    updatedAt: "2 hours ago",
  },
  {
    id: "res-2",
    courseCode: "CS 340",
    title: "Two-Phase Commit Protocol in Distributed Transactions",
    type: "Detailed Notes",
    updatedAt: "Yesterday",
  },
  {
    id: "res-3",
    courseCode: "MATH 210",
    title: "Eigenvalues & Spectral Theorem Mock Quiz (15 Questions)",
    type: "Question Bank",
    updatedAt: "3 days ago",
  },
];

