import { GeneratedResourceItem } from "@/types/ai";

export const INITIAL_GENERATED_RESOURCES: GeneratedResourceItem[] = [
  {
    id: "res-dp-notes",
    courseId: "cs-301",
    courseCode: "CS 301",
    moduleId: "mod-2",
    moduleName: "Module 2: Dynamic Programming",
    topicId: "top-2-2",
    topicName: "0/1 Knapsack & Fractional Variants",
    title: "0/1 Knapsack State Space & Recurrence Breakdown",
    resourceType: "detailed_notes",
    contentMarkdown: `## 1. Problem Formulation & Optimal Substructure

In the **0/1 Knapsack problem**, we are given a set of $n$ items, each with a weight $w_i > 0$ and a value $v_i > 0$, alongside a knapsack of capacity $W$.

An optimal subset of items must satisfy:
$$\\max \\sum_{i=1}^n v_i x_i \\quad \\text{subject to} \\quad \\sum_{i=1}^n w_i x_i \\le W, \\quad x_i \\in \\{0, 1\\}$$

### Principle of Optimality
Consider an optimal subset $S$. If item $n \\in S$, then $S \\setminus \\{n\\}$ must be an optimal solution for the subproblem with $n-1$ items and residual capacity $W - w_n$. Conversely, if $n \\notin S$, then $S$ is optimal for the subproblem with $n-1$ items and capacity $W$.

---

## 2. Dynamic Programming Recurrence

Let $DP[i][w]$ denote the maximum value achievable using a subset of the first $i$ items with capacity $w$:

$$DP[i][w] = \\begin{cases} 
0 & \\text{if } i = 0 \\text{ or } w = 0 \\\\
DP[i-1][w] & \\text{if } w_i > w \\\\
\\max\\big(DP[i-1][w], \\; DP[i-1][w - w_i] + v_i\\big) & \\text{if } w_i \\le w 
\\end{cases}$$

### Space Optimization
Notice that computing row $i$ only requires row $i-1$. By iterating backwards from $W$ down to $w_i$, we can compress the state table into a single 1D array of size $W+1$:

\`\`\`python
def knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for w_i, v_i in zip(weights, values):
        for w in range(W, w_i - 1, -1):
            dp[w] = max(dp[w], dp[w - w_i] + v_i)
    return dp[W]
\`\`\`

---

## 3. Complexity & Pseudo-Polynomial Classification

- **Time Complexity**: $O(n \\cdot W)$ iterations.
- **Space Complexity**: $O(W)$ with 1D optimization.
- **Why Pseudo-Polynomial?**: The numeric value $W$ is encoded in $\\log_2(W)$ bits in binary. Thus, the time is exponential relative to the input length of $W$.
`,
    citations: [
      {
        title: "CLRS - Chapter 15 Dynamic Programming.pdf",
        page: 18,
        excerpt: "Section 15.3: Elements of Dynamic Programming and Knapsack recurrence relations.",
      },
    ],
    createdAt: "2 hours ago",
    isFavorite: true,
  },
  {
    id: "res-raft-cheat",
    courseId: "cs-340",
    courseCode: "CS 340",
    moduleId: "mod-340-2",
    moduleName: "Module 2: Consensus Protocols: Paxos & Raft",
    topicId: "top-340-2-1",
    topicName: "Raft Leader Election & Term Transitions",
    title: "Raft State Transitions & Invariants Matrix",
    resourceType: "cheat_sheet",
    contentMarkdown: `## Raft Server Roles & Term Lifecycle

| Role | Responsibilities | Transitions |
| :--- | :--- | :--- |
| **Follower** | Responds to incoming RPCs from candidate & leader. | Becomes Candidate if election timer triggers without heartbeat. |
| **Candidate** | Increments current term, votes for self, sends RequestVote RPCs. | Becomes Leader if majority votes collected; reverts to Follower if term update received. |
| **Leader** | Manages log replication, periodically broadcasts AppendEntries heartbeats. | Steps down to Follower if RPC response carries a higher term $T > T_{current}$. |

### Core Safety Invariants
1. **Election Safety**: At most one leader can be elected in a given term.
2. **Leader Append-Only**: A leader never overwrites or truncates its own log entries; it only appends new entries.
3. **Log Matching Property**: If two logs contain an entry with the same index and term, they are identical in all entries up through the given index.
4. **Leader Completeness**: If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.
`,
    citations: [
      {
        title: "In Search of an Understandable Consensus Algorithm (Raft Paper).pdf",
        page: 5,
        excerpt: "Figure 3: Raft Guarantees and Invariants Summary.",
      },
    ],
    createdAt: "Yesterday",
    isFavorite: false,
  },
];

