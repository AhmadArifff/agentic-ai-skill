# Feature Breakdown Guide — Decomposition & Estimation

Reference document for the PM Skill's feature breakdown and estimation capability.

---

## Feature Decomposition Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                        Initiative                        │
│  "Launch e-commerce platform"                            │
├─────────────────────────────────────────────────────────┤
│                          Epics                           │
│  User Management │ Product Catalog │ Shopping Cart │ ... │
├─────────────────────────────────────────────────────────┤
│                       User Stories                       │
│  "As a buyer, I want to add items to my cart..."         │
├─────────────────────────────────────────────────────────┤
│                         Tasks                            │
│  Create cart API │ Build cart UI │ Add unit tests │ ...   │
└─────────────────────────────────────────────────────────┘
```

### Size Guide

| Level | Size | Duration | Example |
|-------|------|----------|---------|
| **Initiative** | Huge | Quarters | "Launch marketplace platform" |
| **Epic** | Large | 2-6 sprints | "User authentication system" |
| **Feature** | Medium | 1-2 sprints | "Social login (Google, GitHub)" |
| **User Story** | Small | 1-5 days | "As a user, I want to login with Google" |
| **Task** | Tiny | Hours | "Create OAuth callback handler" |

### Decomposition Rules

```
✅ Good decomposition:
├── Each story delivers user value (vertical slice)
├── Stories are independent (can be built in any order)
├── Stories fit in one sprint (if not, break down further)
├── Each story is testable (clear acceptance criteria)
└── Tasks are technical steps within a story

❌ Bad decomposition:
├── Stories split by technical layer ("Build API", "Build UI")
├── Stories too large (> 1 sprint)
├── Stories depend on each other in sequence
├── Tasks without a parent story
└── Mixing technical and product concerns
```

---

## User Story Mapping

### How to Create a Story Map

```
Step 1: Define the user's journey (backbone)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Browse   →   Search   →   View Product   →   Add to Cart   →   Checkout   →   Track Order
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 2: Add stories under each activity (body)

Browse        Search         View Product      Add to Cart       Checkout
──────        ──────         ────────────      ───────────       ────────
See featured  Search by      View images       Add single item   Enter address
products      keyword        View price        Change quantity   Choose payment
              Filter by      View description  Remove item       Apply coupon
See categories category      View reviews      Save for later    Order summary
Browse by     Sort by price  Zoom image        View subtotal     Confirm order
collection    Autocomplete   Related products  Share cart        Guest checkout

Step 3: Draw release lines

──── MVP (Release 1) ─────────────────────────────────────────────
Browse:       See featured, See categories
Search:       Search by keyword, Filter by category
View:         View images, View price, View description
Cart:         Add single item, Change quantity, Remove item
Checkout:     Enter address, Choose payment, Confirm order

──── Release 2 ───────────────────────────────────────────────────
Browse:       Browse by collection
Search:       Sort by price, Autocomplete
View:         View reviews, Related products
Cart:         Save for later, View subtotal
Checkout:     Apply coupon, Guest checkout

──── Release 3 ───────────────────────────────────────────────────
View:         Zoom image
Cart:         Share cart
Checkout:     [future features]
```

---

## Prioritization Frameworks

### MoSCoW Method

| Priority | Meaning | Rule of Thumb |
|----------|---------|--------------|
| **Must Have** | Non-negotiable, product doesn't work without it | ~60% of effort |
| **Should Have** | Important, but product works without it | ~20% of effort |
| **Could Have** | Nice to have, enhances experience | ~20% of effort |
| **Won't Have** | Explicitly excluded from this release | Documented for future |

### RICE Scoring

```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach:      How many users affected per quarter? (number)
Impact:     How much will it move the metric? (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)
Confidence: How sure are we? (100%=high, 80%=medium, 50%=low)
Effort:     Person-months of work (number)
```

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---------|-------|--------|-----------|--------|------------|
| Social login | 5000 | 2 | 80% | 1 | **8,000** |
| Dark mode | 3000 | 0.5 | 100% | 2 | **750** |
| Export to PDF | 1000 | 1 | 80% | 3 | **267** |
| AI recommendations | 8000 | 3 | 50% | 6 | **2,000** |

### ICE Scoring (Simpler)

```
ICE Score = Impact × Confidence × Ease

All scored 1-10:
Impact:     How much will this move the needle?
Confidence: How sure are we about the impact?
Ease:       How easy is it to implement?
```

### Kano Model

| Category | Description | Example |
|----------|-------------|---------|
| **Must-be** | Expected, absence causes dissatisfaction | Login, password reset |
| **Performance** | More is better, linear satisfaction | Speed, storage space |
| **Attractive** | Unexpected, delights users | Smart suggestions, animations |
| **Indifferent** | Users don't care either way | Internal refactoring |
| **Reverse** | Some users actively dislike it | Auto-play videos, notifications |

---

## Estimation Techniques

### T-Shirt Sizing

| Size | Relative Effort | Days (approx) | Use For |
|------|----------------|---------------|---------|
| **XS** | Trivial | < 0.5 day | Config change, text update |
| **S** | Simple | 0.5-1 day | Small UI change, simple endpoint |
| **M** | Moderate | 2-3 days | New feature with known patterns |
| **L** | Complex | 4-5 days | New feature with unknowns |
| **XL** | Very complex | 1-2 weeks | New system, major integration |
| **XXL** | Too large — break down further | > 2 weeks | Epic-level, needs decomposition |

### Story Points (Fibonacci)

| Points | Complexity | Example |
|--------|-----------|---------|
| **1** | Trivial, no unknowns | Change button color, fix typo |
| **2** | Simple, well understood | Add form field, simple validation |
| **3** | Small, some thought needed | New API endpoint with validation |
| **5** | Medium, moderate complexity | New page with form + API integration |
| **8** | Large, multiple components | User authentication flow |
| **13** | Very large, significant unknowns | Payment integration |
| **21** | Too large — break down | Full feature module |

### Three-Point Estimation

```
Expected = (Optimistic + 4 × Most Likely + Pessimistic) / 6

Example:
  Optimistic:  3 days  (everything goes perfectly)
  Most Likely: 5 days  (normal conditions)
  Pessimistic: 12 days (major blockers, unknowns)

  Expected = (3 + 4×5 + 12) / 6 = 5.8 days

Standard Deviation = (Pessimistic - Optimistic) / 6 = 1.5 days
95% confidence: 5.8 ± 3.0 days = 2.8 to 8.8 days
```

---

## Dependency Mapping

### Dependency Types

| Type | Example | Handling |
|------|---------|---------|
| **Technical** | "Cart needs Product API first" | Sequence stories, or mock the API |
| **Design** | "UI needs design assets" | Start design sprint earlier |
| **External** | "Payment needs Stripe account" | Start vendor process early |
| **Cross-team** | "Mobile needs backend API" | Align sprint goals, define contract first |
| **Data** | "Reports need data migration" | Run migration before feature sprint |

### Dependency Matrix

```
         Story A   Story B   Story C   Story D
Story A    -        ←          -         -
Story B    →        -          ←         -
Story C    -        →          -         ←
Story D    -        -          →         -

→ = "depends on" (must be done first)
← = "is depended upon" (must be done after)

Reading: Story B depends on Story A (A must be done first)
         Story C depends on Story B (B must be done first)
         Story D depends on Story C (C must be done first)

Critical path: A → B → C → D
```

---

## MVP Definition Framework

### MVP Criteria

```
A feature is MVP if ALL of these are true:
├── Users cannot achieve the core goal without it
├── There is no acceptable workaround
├── Removing it would make the product unusable (not just inconvenient)
└── It addresses the primary user persona's #1 pain point

A feature is NOT MVP if:
├── It optimizes an existing flow (nice-to-have)
├── It serves a secondary persona
├── There is a manual workaround (even if painful)
├── It's a "delight" feature (attractive but not essential)
└── You can launch without it and add it in v1.1
```

### MVP Canvas

```
┌──────────────────────────────────────────────────┐
│ Target User: [Primary persona]                    │
│ Problem: [Core problem to solve]                  │
│ Solution: [Minimum solution that solves it]       │
├──────────────────────────────────────────────────┤
│ Must Have (MVP)        │ Not MVP (v1.1+)          │
│ ─────────────          │ ──────────────           │
│ • [Feature 1]          │ • [Feature 4]            │
│ • [Feature 2]          │ • [Feature 5]            │
│ • [Feature 3]          │ • [Feature 6]            │
├──────────────────────────────────────────────────┤
│ Success Metric: [How we know MVP worked]          │
│ Timeline: [Target launch date]                    │
│ Risk: [Biggest risk to MVP delivery]              │
└──────────────────────────────────────────────────┘
```
