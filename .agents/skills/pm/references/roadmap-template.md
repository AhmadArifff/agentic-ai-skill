# Roadmap & Timeline Templates

Reference document for the PM Skill's roadmap and timeline planning capability.

---

## Roadmap Formats

### NOW / NEXT / LATER (Recommended for Agile)

Best when timelines are uncertain and priorities shift often:

```markdown
# Product Roadmap — [Product Name]

**Last Updated:** [Date]
**Vision:** [One-sentence product vision]

## 🟢 NOW (Current Sprint / This Month)
Active work — committed, in progress.

| Feature | Epic | Owner | Status |
|---------|------|-------|--------|
| User authentication (JWT) | Auth | Backend Team | In Progress |
| Product listing page | Catalog | Frontend Team | In Progress |
| Database schema v1 | Infrastructure | Backend Team | Complete |

## 🟡 NEXT (Next 1-3 Months)
Planned — prioritized, estimated, but not started.

| Feature | Epic | Priority | Estimate |
|---------|------|----------|----------|
| Shopping cart | Commerce | P0 | 3 sprints |
| Payment integration (Stripe) | Commerce | P0 | 2 sprints |
| Search & filtering | Discovery | P1 | 2 sprints |
| User profiles | Users | P1 | 1 sprint |

## 🔵 LATER (3-6 Months)
Planned — directional, not committed.

| Feature | Epic | Priority | Notes |
|---------|------|----------|-------|
| Order tracking | Commerce | P1 | Depends on shipping partner API |
| Reviews & ratings | Social | P2 | After launch metrics reviewed |
| Mobile app | Platform | P2 | If web proves product-market fit |
| AI recommendations | Discovery | P2 | Requires usage data collection |

## ❄️ ICEBOX (Ideas — Not Prioritized)
- Wishlist sharing
- Gift cards
- Loyalty program
- Multi-currency support
```

### Quarterly Roadmap

Best for stakeholder communication with time commitments:

```markdown
# Quarterly Roadmap — [Product Name] — [Year]

## Q1: Foundation
**Theme:** Build the core platform

| Month | Milestone | Features |
|-------|-----------|----------|
| Jan | Project Setup | Tech stack, CI/CD, design system |
| Feb | Core MVP | Auth, product catalog, basic UI |
| Mar | MVP Launch | Cart, checkout, payment, deploy to prod |

**Key Metric:** MVP launched with 100 beta users

## Q2: Growth
**Theme:** Improve engagement and conversion

| Month | Milestone | Features |
|-------|-----------|----------|
| Apr | Search & Discovery | Full-text search, filters, categories |
| May | User Experience | Reviews, wishlists, order history |
| Jun | Marketing Launch | SEO, email marketing, referrals |

**Key Metric:** 1,000 active users, 5% conversion rate

## Q3: Scale
**Theme:** Optimize and scale

| Month | Milestone | Features |
|-------|-----------|----------|
| Jul | Performance | CDN, caching, load testing |
| Aug | Seller Tools | Dashboard, inventory, analytics |
| Sep | Mobile | Responsive redesign or native app |

**Key Metric:** 5,000 active users, < 2s page load

## Q4: Expand
**Theme:** New revenue streams

| Month | Milestone | Features |
|-------|-----------|----------|
| Oct | Marketplace | Multi-vendor support |
| Nov | Monetization | Subscription plans, premium features |
| Dec | International | Multi-language, multi-currency |

**Key Metric:** $100K MRR
```

---

## Milestone Planning

### Milestone Template

```markdown
## Milestone: [Name]

**Target Date:** [YYYY-MM-DD]
**Status:** 🟢 On Track / 🟡 At Risk / 🔴 Delayed
**Owner:** [Name]

### Definition of Done
- [ ] [Deliverable 1] complete and deployed
- [ ] [Deliverable 2] complete and deployed
- [ ] [Deliverable 3] complete and deployed
- [ ] QA sign-off
- [ ] Stakeholder demo completed
- [ ] Documentation updated

### Dependencies
| Dependency | Owner | Status | Due Date |
|-----------|-------|--------|----------|
| [Dependency] | [Name] | [Status] | [Date] |

### Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| [Risk] | High/Med/Low | High/Med/Low | [Plan] |
```

---

## Timeline Estimation

### Bottom-Up Estimation Process

```
Step 1: List all features/stories
Step 2: Estimate each story (story points or days)
Step 3: Calculate team velocity (points per sprint)
Step 4: Divide total points by velocity = number of sprints
Step 5: Add buffer (20-30% for unknowns)
Step 6: Map to calendar dates (accounting for holidays, vacations)
```

### Estimation Example

```
Total estimated effort: 180 story points

Team velocity: 30 points/sprint (2-week sprints)
Sprints needed: 180 / 30 = 6 sprints = 12 weeks

Add buffer (25%): 12 × 1.25 = 15 weeks

Calendar mapping:
  Start:    Jan 6, 2025
  Buffer:   +15 weeks
  Holidays: -1 week (Chinese New Year)
  Team off: -1 week (Q1 offsite)
  
  Estimated completion: Apr 21, 2025
  Safe target:          May 5, 2025 (extra buffer)
```

### Confidence Ranges

| Confidence | Buffer | When to Use |
|-----------|--------|-------------|
| **High (90%)** | +10% | Well-understood work, experienced team |
| **Medium (70%)** | +25% | Some unknowns, new technology |
| **Low (50%)** | +50% | Many unknowns, new team, new domain |
| **Very Low** | +100% | Research project, brand new technology |

---

## Risk Assessment

### Risk Matrix

```
                    I M P A C T
                Low    Medium    High
         ┌────────┬──────────┬────────┐
    High │ Medium │   High   │Critical│
P        ├────────┼──────────┼────────┤
R   Med  │  Low   │  Medium  │  High  │
O        ├────────┼──────────┼────────┤
B   Low  │  Low   │   Low    │ Medium │
         └────────┴──────────┴────────┘
```

### Common Project Risks

| Category | Risk | Probability | Impact | Mitigation |
|----------|------|------------|--------|-----------|
| **Scope** | Scope creep — features keep growing | High | High | Strict change process, freeze dates |
| **Technical** | New technology doesn't work as expected | Medium | High | Proof of concept first, fallback plan |
| **Team** | Key person leaves mid-project | Low | High | Knowledge sharing, documentation, bus factor > 1 |
| **External** | Third-party API changes or goes down | Medium | Medium | Abstraction layer, fallback provider |
| **Timeline** | Estimation was too optimistic | High | Medium | Add buffer, track velocity early |
| **Quality** | Too many bugs in production | Medium | High | Automated testing, code review, QA process |
| **Budget** | Costs exceed budget | Medium | High | Track burn rate weekly, MVP mindset |

### Risk Response Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Avoid** | Change plan to eliminate the risk | High probability + high impact |
| **Mitigate** | Reduce probability or impact | Medium risks with known solutions |
| **Transfer** | Shift risk to third party (insurance, vendor) | Financial or operational risks |
| **Accept** | Acknowledge and monitor | Low probability or low impact |

---

## Release Planning

### Release Checklist

```markdown
## Release [Version] Checklist

### Pre-Release (1 week before)
- [ ] All P0 features complete and merged
- [ ] All critical/high bugs fixed
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Staging environment tested end-to-end
- [ ] Database migrations tested on staging copy
- [ ] Rollback procedure documented and tested
- [ ] Release notes drafted

### Release Day
- [ ] Final staging smoke test
- [ ] Database backup verified
- [ ] Deploy to production
- [ ] Post-deploy smoke test
- [ ] Monitor error rates (15 min observation)
- [ ] Monitor performance metrics
- [ ] Release notes published
- [ ] Stakeholders notified

### Post-Release (1 week after)
- [ ] Monitor error rates and performance
- [ ] Collect user feedback
- [ ] Review success metrics
- [ ] Retrospective on release process
- [ ] Plan hotfix if needed
- [ ] Update roadmap based on learnings
```

### Versioning Strategy

```
Semantic Versioning: MAJOR.MINOR.PATCH

MAJOR: Breaking changes (v1.0 → v2.0)
MINOR: New features, backward compatible (v1.0 → v1.1)
PATCH: Bug fixes, backward compatible (v1.0.0 → v1.0.1)

Pre-release: v1.0.0-alpha.1, v1.0.0-beta.1, v1.0.0-rc.1

Examples:
  v0.1.0  — First development release (MVP alpha)
  v0.9.0  — Feature complete, pre-launch
  v1.0.0  — Public launch
  v1.1.0  — First feature update
  v1.1.1  — Bug fix
  v2.0.0  — Major redesign / breaking API changes
```

---

## Status Report Template

### Weekly Status Update

```markdown
# Weekly Status — [Product Name] — Week of [Date]

## 🎯 Sprint Goal
[Current sprint goal in one sentence]

## 📊 Progress
| Metric | Value | Trend |
|--------|-------|-------|
| Sprint completion | 60% | 🟢 On track |
| Stories completed | 8/14 | 🟢 |
| Bugs open | 3 (1 critical) | 🟡 Watch |
| Velocity (avg) | 28 pts/sprint | → Stable |

## ✅ Completed This Week
- [Story/feature completed]
- [Story/feature completed]
- [Bug fixed]

## 🔄 In Progress
- [Story in progress] — [% complete, expected done date]
- [Story in progress] — [% complete, expected done date]

## 🚫 Blocked / At Risk
- [Blocker description] — **Owner:** [Name], **ETA:** [Date]

## 📅 Next Week
- [Planned work]
- [Planned work]

## 💡 Decisions Needed
- [Decision needed from stakeholder] — **By:** [Date]
```
