import { AcademicCourse, AcademicYear } from "@/types/academic";

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: "ay-2025-2026",
    name: "Academic Year 2025–2026",
    isCurrent: true,
    semesters: [
      {
        id: "sem-spring-2026",
        academicYearId: "ay-2025-2026",
        name: "Spring Semester 2026",
        status: "current",
        startDate: "2026-01-10",
        endDate: "2026-05-20",
      },
      {
        id: "sem-fall-2025",
        academicYearId: "ay-2025-2026",
        name: "Fall Semester 2025",
        status: "completed",
        startDate: "2025-08-15",
        endDate: "2025-12-18",
      },
    ],
  },
  {
    id: "ay-2024-2025",
    name: "Academic Year 2024–2025",
    isCurrent: false,
    semesters: [
      {
        id: "sem-spring-2025",
        academicYearId: "ay-2024-2025",
        name: "Spring Semester 2025",
        status: "archived",
      },
    ],
  },
];

export const INITIAL_COURSES: AcademicCourse[] = [
  {
    id: "cs-301",
    code: "CS 301",
    name: "Design & Analysis of Algorithms",
    description: "Fundamental paradigms in algorithm design: divide and conquer, dynamic programming, greedy algorithms, graph search, and NP-completeness.",
    credits: 4.0,
    instructorName: "Prof. Hiroshi Tanaka",
    semesterId: "sem-spring-2026",
    semesterName: "Spring Semester 2026",
    color: "#6b8048",
    progressPercent: 68,
    syllabus: {
      id: "syl-cs301",
      version: 1,
      isActive: true,
      extractionStatus: "completed",
      modules: [
        {
          id: "mod-1",
          orderIndex: 1,
          title: "Module 1: Foundations & Asymptotic Complexity",
          description: "Big-O, Omega, Theta notation, recurrence relations, and Master Theorem.",
          hoursOrWeightage: "8 Hours",
          topics: [
            {
              id: "top-1-1",
              title: "Growth of Functions & Asymptotic Notations",
              status: "completed",
              subtopics: [
                { id: "sub-1", title: "Worst-case, Average-case, and Best-case bounds" },
                { id: "sub-2", title: "Standard complexity classes (P, EXP, Logarithmic)" },
              ],
            },
            {
              id: "top-1-2",
              title: "Recurrence Relations & Master Theorem",
              status: "completed",
              subtopics: [
                { id: "sub-3", title: "Substitution method and recursion tree method" },
                { id: "sub-4", title: "Akra-Bazzi method overview" },
              ],
            },
          ],
        },
        {
          id: "mod-2",
          orderIndex: 2,
          title: "Module 2: Dynamic Programming",
          description: "Optimal substructure, overlapping subproblems, memoization vs bottom-up tabulation.",
          hoursOrWeightage: "12 Hours",
          topics: [
            {
              id: "top-2-1",
              title: "Elements of Dynamic Programming",
              status: "completed",
              subtopics: [
                { id: "sub-5", title: "Rod cutting problem" },
                { id: "sub-6", title: "Matrix chain multiplication" },
              ],
            },
            {
              id: "top-2-2",
              title: "0/1 Knapsack & Fractional Variants",
              status: "in_progress",
              subtopics: [
                { id: "sub-7", title: "Pseudo-polynomial time complexity proof" },
                { id: "sub-8", title: "Space-optimized single array state DP" },
              ],
            },
            {
              id: "top-2-3",
              title: "Longest Common Subsequence (LCS) & Edit Distance",
              status: "needs_revision",
              subtopics: [
                { id: "sub-9", title: "Reconstructing the optimal sequence via backpointers" },
              ],
            },
          ],
        },
        {
          id: "mod-3",
          orderIndex: 3,
          title: "Module 3: Greedy Algorithms & Graph Theory",
          description: "Matroid theory, spanning trees, and single-source shortest paths.",
          hoursOrWeightage: "10 Hours",
          topics: [
            {
              id: "top-3-1",
              title: "Activity Selection & Huffman Coding",
              status: "completed",
            },
            {
              id: "top-3-2",
              title: "Minimum Spanning Trees: Kruskal & Prim",
              status: "in_progress",
              subtopics: [
                { id: "sub-10", title: "Disjoint set union with path compression" },
              ],
            },
            {
              id: "top-3-3",
              title: "Dijkstra and Bellman-Ford Shortest Path",
              status: "not_started",
            },
          ],
        },
        {
          id: "mod-4",
          orderIndex: 4,
          title: "Module 4: NP-Completeness & Approximation",
          description: "Turing reductions, 3-SAT, Vertex Cover, and polynomial-time verifiers.",
          hoursOrWeightage: "10 Hours",
          topics: [
            { id: "top-4-1", title: "P vs NP, NP-Hard, and NP-Complete Definitions", status: "not_started" },
            { id: "top-4-2", title: "Cook-Levin Theorem & Canonical Reductions", status: "not_started" },
          ],
        },
      ],
    },
    materials: [
      {
        id: "mat-1",
        title: "CLRS - Chapter 15 Dynamic Programming.pdf",
        fileName: "clrs-ch15-dp.pdf",
        fileType: "pdf",
        fileSizeBytes: 2450000,
        pageCount: 38,
        status: "indexed",
        moduleId: "mod-2",
        uploadedAt: "2 days ago",
      },
      {
        id: "mat-2",
        title: "Lecture 8 - Master Theorem & Divide and Conquer Slides.pptx",
        fileName: "lec8-master-theorem.pptx",
        fileType: "pptx",
        fileSizeBytes: 4120000,
        pageCount: 45,
        status: "indexed",
        moduleId: "mod-1",
        uploadedAt: "1 week ago",
      },
      {
        id: "mat-3",
        title: "Algorithms Mid-Term Syllabus & Problem Set Guidelines.pdf",
        fileName: "midterm-guidelines.pdf",
        fileType: "pdf",
        fileSizeBytes: 620000,
        pageCount: 5,
        status: "indexed",
        uploadedAt: "2 weeks ago",
      },
    ],
  },
  {
    id: "cs-340",
    code: "CS 340",
    name: "Distributed Database Systems",
    description: "Replication, fault tolerance, Raft consensus, two-phase commit, Dynamo style distributed hash tables, and ACID vs BASE.",
    credits: 3.5,
    instructorName: "Dr. Elena Vance",
    semesterId: "sem-spring-2026",
    semesterName: "Spring Semester 2026",
    color: "#b08968",
    progressPercent: 42,
    syllabus: {
      id: "syl-cs340",
      version: 1,
      isActive: true,
      extractionStatus: "completed",
      modules: [
        {
          id: "mod-340-1",
          orderIndex: 1,
          title: "Module 1: Consistency & Replication Models",
          description: "Linearizability, sequential consistency, causal consistency, and eventual consistency.",
          hoursOrWeightage: "10 Hours",
          topics: [
            { id: "top-340-1-1", title: "Strict vs Strong Consistency", status: "completed" },
            { id: "top-340-1-2", title: "CAP Theorem & PACELC Trade-offs", status: "completed" },
          ],
        },
        {
          id: "mod-340-2",
          orderIndex: 2,
          title: "Module 2: Consensus Protocols: Paxos & Raft",
          description: "Leader election, log replication, safety invariants, and joint consensus configuration changes.",
          hoursOrWeightage: "14 Hours",
          topics: [
            { id: "top-340-2-1", title: "Raft Leader Election & Term Transitions", status: "in_progress" },
            { id: "top-340-2-2", title: "Log Matching Property & Commit Invariant", status: "not_started" },
            { id: "top-340-2-3", title: "Paxos Synod & Multi-Paxos Algorithm", status: "not_started" },
          ],
        },
      ],
    },
    materials: [
      {
        id: "mat-340-1",
        title: "In Search of an Understandable Consensus Algorithm (Raft Paper).pdf",
        fileName: "raft-paper.pdf",
        fileType: "pdf",
        fileSizeBytes: 1840000,
        pageCount: 18,
        status: "indexed",
        moduleId: "mod-340-2",
        uploadedAt: "3 days ago",
      },
    ],
  },
  {
    id: "math-210",
    code: "MATH 210",
    name: "Applied Linear Algebra",
    description: "Vector spaces, linear mappings, Gram-Schmidt orthogonalization, eigenvalues, singular value decomposition (SVD), and principal component analysis (PCA).",
    credits: 4.0,
    instructorName: "Prof. Kenneth Sato",
    semesterId: "sem-spring-2026",
    semesterName: "Spring Semester 2026",
    color: "#607274",
    progressPercent: 85,
    syllabus: {
      id: "syl-math210",
      version: 1,
      isActive: true,
      extractionStatus: "completed",
      modules: [
        {
          id: "mod-m1",
          orderIndex: 1,
          title: "Module 1: Vector Spaces and Linear Transformations",
          topics: [
            { id: "top-m1", title: "Bases, Dimension, and Rank-Nullity Theorem", status: "completed" },
            { id: "top-m2", title: "Orthogonality & QR Factorisation", status: "completed" },
          ],
        },
        {
          id: "mod-m2",
          orderIndex: 2,
          title: "Module 2: Spectral Theory & SVD",
          topics: [
            { id: "top-m3", title: "Eigenvalues and Eigenspaces", status: "completed" },
            { id: "top-m4", title: "Singular Value Decomposition (SVD)", status: "in_progress" },
          ],
        },
      ],
    },
    materials: [],
  },
];

