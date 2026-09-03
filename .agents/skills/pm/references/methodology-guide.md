# Methodology Guide — Agile, Scrum, Kanban & More

Reference document for the PM Skill's development methodology selection.

---

## Methodology Comparison

| Aspect | Scrum | Kanban | Waterfall | Lean/XP |
|--------|-------|--------|-----------|---------|
| **Planning cycle** | Fixed sprints (1-4 weeks) | Continuous | Upfront, entire project | Short iterations |
| **Requirements** | Evolving backlog | Continuous flow | Fixed at start | Evolving |
| **Roles** | PO, Scrum Master, Dev Team | No prescribed roles | PM, Analyst, Dev, QA | Coach, Dev pairs |
| **Ceremonies** | 4 ceremonies | Daily standup only | Phase gates | Daily standup, pairing |
| **Board** | Reset each sprint | Persistent, WIP limits | Gantt chart | Persistent board |
| **Metrics** | Velocity, burndown | Lead time, throughput | Milestone completion | Cycle time |
| **Change** | Between sprints | Anytime | Change request process | Anytime |
| **Release** | End of sprint | Anytime (continuous) | End of project | Continuous |
| **Best for** | New products, MVPs | Support, ops, DevOps | Fixed-scope, compliance | Quality-focused, pairing |

---

## Scrum Framework

### Roles

| Role | Responsibilities |
|------|-----------------|
| **Product Owner** | Prioritize backlog, define stories, accept/reject work, represent stakeholders |
| **Scrum Master** | Facilitate ceremonies, remove blockers, coach team, protect from distractions |
| **Development Team** | Self-organizing, cross-functional, estimate and deliver stories (5-9 people) |

### Artifacts

| Artifact | Purpose | Owner |
|----------|---------|-------|
| **Product Backlog** | Ordered list of everything to build | Product Owner |
| **Sprint Backlog** | Stories committed for this sprint | Dev Team |
| **Increment** | Working product at end of sprint | Dev Team |
| **Definition of Done** | Checklist for "complete" work | Whole team |

### Sprint Ceremonies

#### 1. Sprint Planning (2-4 hours for 2-week sprint)

```
Agenda:
1. Product Owner presents sprint goal (10 min)
2. Team reviews top backlog items (30 min)
3. Team asks clarifying questions (20 min)
4. Team estimates and commits to stories (60 min)
5. Team breaks stories into tasks (30 min)
6. Team confirms sprint goal and capacity (10 min)

Output:
├── Sprint goal (one sentence)
├── Sprint backlog (committed stories)
└── Task breakdown for each story
```

**Capacity Planning:**
```
Available hours = Team members × Working days × Hours/day × Focus factor

Example (2-week sprint, 5 devs):
  5 devs × 10 days × 8 hours × 0.7 (focus) = 280 available hours

Deductions:
  - Meetings/ceremonies: ~20 hours total
  - Support/bugs: ~15% = 42 hours
  - Buffer: ~10% = 28 hours

  Net capacity: 280 - 20 - 42 - 28 = 190 dev hours
```

#### 2. Daily Standup (15 min max)

```
Each team member answers:
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or risks?

Rules:
├── Standing up (keeps it short)
├── Same time, same place, every day
├── Not a status report to the manager
├── Park detailed discussions for after
└── Max 15 minutes — use a timer
```

#### 3. Sprint Review / Demo (1-2 hours)

```
Agenda:
1. Sprint goal recap (5 min)
2. Demo completed stories (40-60 min)
   - Each story: show working software
   - Stakeholder questions and feedback
3. Review sprint metrics (10 min)
4. Update product backlog based on feedback (15 min)
5. Preview next sprint (10 min)

Attendees: Team + Product Owner + Stakeholders
```

#### 4. Sprint Retrospective (1-1.5 hours)

```
Format options:

1. Start/Stop/Continue
   ├── Start doing: [New practices to try]
   ├── Stop doing:  [Practices hurting us]
   └── Continue:    [Practices working well]

2. Liked/Learned/Lacked/Longed For (4Ls)
   ├── Liked:    [What went well]
   ├── Learned:  [New insights]
   ├── Lacked:   [What was missing]
   └── Longed:   [What we wish we had]

3. Mad/Sad/Glad
   ├── Mad:  [Frustrations]
   ├── Sad:  [Disappointments]
   └── Glad: [Celebrations]

Output: 2-3 concrete action items with owners and deadlines
```

### Sprint Metrics

| Metric | How to Calculate | Target |
|--------|-----------------|--------|
| **Velocity** | Sum of story points completed per sprint | Stable (±20%) |
| **Sprint Burndown** | Remaining work vs. time | Linear decline to 0 |
| **Commitment Reliability** | Completed points / Committed points | ≥ 80% |
| **Escaped Defects** | Bugs found after sprint | Trending down |
| **Scope Change** | Stories added/removed mid-sprint | < 10% |

---

## Kanban Framework

### Core Principles

1. **Visualize the workflow** — Make all work visible on the board
2. **Limit WIP** — Set maximum items per column
3. **Manage flow** — Optimize for smooth, fast flow
4. **Make policies explicit** — Document rules for each column
5. **Improve collaboratively** — Continuous improvement

### Board Setup

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Backlog  │ Ready    │ In Dev   │ In Review│ Testing  │ Done     │
│ (∞)      │ (5)      │ (3)      │ (2)      │ (2)      │ (∞)      │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Story F  │ Story E  │ Story C  │ Story B  │ Story A  │ Story X  │
│ Story G  │ Story D  │ Story C2 │          │          │ Story Y  │
│ Story H  │          │          │          │          │ Story Z  │
│ ...      │          │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
                        WIP Limits shown in (parentheses)
```

### WIP Limits

```
How to set WIP limits:
├── Start with: team size × 1.5 (total across all active columns)
├── Per column: number of people who work in that stage
├── Adjust: lower WIP = faster flow (but team may idle)
│           higher WIP = less idle time (but slower flow)
└── Goal: find the sweet spot where flow is smooth

Example (5-person team):
  Total WIP: 5 × 1.5 = 7-8 items max across Dev + Review + Testing
  Dev: 3 (3 devs working in parallel)
  Review: 2 (reviews are quick)
  Testing: 2 (1 QA person + buffer)
```

### Kanban Metrics

| Metric | What It Measures | Target |
|--------|-----------------|--------|
| **Lead Time** | Time from request to delivery | Shorter is better |
| **Cycle Time** | Time from start to delivery | Shorter is better |
| **Throughput** | Items completed per week | Stable or increasing |
| **WIP Age** | How long items sit in progress | Low (items not stuck) |
| **Blocked Time** | Time items are blocked | Minimize |

---

## Definition of Done (DoD)

### Standard DoD Template

```markdown
A story is "Done" when ALL of these are true:

**Code**
- [ ] Code written and peer-reviewed
- [ ] Code follows project style guide
- [ ] No linting errors or warnings
- [ ] Feature branch merged to main/develop

**Testing**
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Manual QA passed (edge cases verified)
- [ ] No known bugs (or documented with tickets)

**Documentation**
- [ ] API documentation updated (if applicable)
- [ ] README updated (if applicable)
- [ ] Inline comments for complex logic

**Product**
- [ ] Acceptance criteria verified by PO
- [ ] Tested on target browsers/devices
- [ ] Accessibility checked (keyboard, screen reader)
- [ ] Performance acceptable (no regression)

**Deployment**
- [ ] Deployed to staging environment
- [ ] Smoke tests passing on staging
- [ ] Ready for production deployment
```

---

## Backlog Grooming / Refinement

### When

- **Frequency:** Once per sprint (mid-sprint works well)
- **Duration:** 1-2 hours for a 2-week sprint
- **Who:** PO + Dev Team (optional: Scrum Master, Designer)

### Agenda

```
1. Review upcoming stories (next 1-2 sprints)     30 min
2. Clarify requirements and acceptance criteria    20 min
3. Estimate stories (planning poker)               30 min
4. Identify dependencies and blockers              15 min
5. Split stories that are too large                15 min
6. Reprioritize based on new information           10 min
```

### Definition of Ready (DoR)

A story is "Ready" for sprint planning when:

- [ ] User story follows standard format (As a / I want / So that)
- [ ] Acceptance criteria defined (Given/When/Then)
- [ ] Story is estimated (story points or T-shirt size)
- [ ] Dependencies identified and resolved (or plan to resolve)
- [ ] Design assets available (if UI work needed)
- [ ] Story fits in one sprint (if not, break it down)
- [ ] Product Owner can answer questions about it

---

## Team Structure

### Cross-Functional Team (Recommended)

```
Ideal Scrum Team (7 ± 2 people):

├── 1 Product Owner
├── 1 Scrum Master (can be part-time)
├── 2-3 Backend Engineers
├── 1-2 Frontend Engineers
├── 1 QA Engineer
└── 1 Designer (can be shared)

Total: 7-9 people
```

### Scaling

| Team Size | Approach |
|-----------|----------|
| 1-9 | Single Scrum team |
| 10-25 | 2-3 Scrum teams with shared PO |
| 25-50 | LeSS (Large Scale Scrum) or SAFe |
| 50+ | SAFe (Scaled Agile Framework) |
