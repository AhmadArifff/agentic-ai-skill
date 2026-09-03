# PRD Template — Product Requirements Document

Ready-to-use PRD template for the PM Skill. Fill in each section to create a complete product requirements document.

---

## Full PRD Template

```markdown
# PRD: [Product/Feature Name]

**Product:** [Product name]
**Author:** [PM name]
**Date:** [YYYY-MM-DD]
**Version:** v1.0
**Status:** Draft / In Review / Approved
**Reviewers:** [List of reviewers]

---

## 1. Executive Summary

[2-3 sentences summarizing the entire PRD. A busy stakeholder should understand
the problem, solution, and impact from this section alone.]

---

## 2. Problem Statement

### 2.1 Background
[Context: What is the current situation? What led us to identify this problem?]

### 2.2 Problem
[Clearly state the problem. Be specific and evidence-based.]

> **Problem:** [One-sentence problem statement]
> 
> **Who is affected:** [User segment]
> 
> **Impact:** [Quantify if possible — revenue lost, time wasted, users churning]

### 2.3 Evidence
[Data, research, or feedback supporting the problem]

| Source | Finding |
|--------|---------|
| User interviews (N=?) | [Key finding] |
| Analytics data | [Key metric] |
| Support tickets | [Volume/pattern] |
| Competitor analysis | [Gap identified] |

---

## 3. Target Users

### 3.1 Primary Persona

**Name:** [Persona name]
**Role:** [Job title / user type]
**Demographics:** [Age range, tech savviness, etc.]

| Attribute | Detail |
|-----------|--------|
| Goals | [What they're trying to achieve] |
| Pain Points | [Current frustrations] |
| Current Workflow | [How they do it today] |
| Tech Proficiency | [Beginner / Intermediate / Advanced] |

### 3.2 Secondary Persona(s)
[Repeat format for secondary users if applicable]

### 3.3 Anti-Personas (NOT building for)
[Who this is explicitly NOT for, and why]

---

## 4. Proposed Solution

### 4.1 Solution Overview
[High-level description of what we're building and how it solves the problem]

### 4.2 Key Features
[List the major features/capabilities]

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | [Feature name] | P0 (Must) | [Brief description] |
| 2 | [Feature name] | P0 (Must) | [Brief description] |
| 3 | [Feature name] | P1 (Should) | [Brief description] |
| 4 | [Feature name] | P2 (Could) | [Brief description] |

### 4.3 Architecture & Tech Stack Selection

| Component | Technology Choice | Rationale |
|---|---|---|
| **Frontend Framework** | `Next.js (React)` / `Vue 3 (Vite SPA)` / `Nuxt 3 (SSR)` | [Alasan pemilihan: SEO vs Performance vs SPA Dashboard] |
| **State Management** | `Zustand` (React) / `Pinia` (Vue) | [Setup store with persistence] |
| **UI Component Library** | `Shadcn UI` (React) / `Shadcn Vue` / `Nuxt UI` | [Design token consistency & accessibility] |
| **Animation & Motion** | `Framer Motion` (React) / `Vue Transition + AnimeJS` | [Micro-interactions & transitions] |
| **Backend Server** | `Express JS (TypeScript)` | [RESTful API & Centralized Error Handling] |
| **Database & ORM** | `Supabase PostgreSQL` + `Prisma ORM` | [Schema integrity & dynamic master tables] |
| **Authentication** | `Better Auth` + `JWT Token Rotation` | [Mandatory Admin & App RBAC] |

### 4.4 User Flow
[Describe the main user journey step by step]

```
Step 1: User [action]
  └→ Step 2: System [response]
       └→ Step 3: User [action]
            └→ Step 4: System [response]
                 └→ Step 5: [Outcome achieved]
```

### 4.5 Wireframes / Mockups
[Low-fidelity descriptions or links to design files]

**Screen 1: [Name]**
- [Layout description]
- [Key elements and interactions]

**Screen 2: [Name]**
- [Layout description]
- [Key elements and interactions]

---

## 5. Scope

### 5.1 In Scope (This Release)
- ✅ [Feature/capability 1]
- ✅ [Feature/capability 2]
- ✅ [Feature/capability 3]

### 5.2 Out of Scope (Future Releases)
- ❌ [Feature explicitly excluded and why]
- ❌ [Feature explicitly excluded and why]

### 5.3 Future Considerations
- 🔮 [Feature for v2/v3]
- 🔮 [Feature for v2/v3]

---

## 6. User Stories & Acceptance Criteria

### Epic 1: [Epic Name]

#### Story 1.1: [Story Title]
**As a** [user role],
**I want to** [action],
**So that** [benefit].

**Priority:** P0 | **Estimate:** [S/M/L or story points]

**Acceptance Criteria:**
- [ ] **Given** [precondition], **When** [action], **Then** [expected result]
- [ ] **Given** [precondition], **When** [action], **Then** [expected result]
- [ ] **Given** [precondition], **When** [action], **Then** [expected result]

**Edge Cases:**
- [ ] What happens when [edge case]?
- [ ] What happens when [edge case]?

---

## 7. Non-Functional Requirements

### 7.1 Performance
| Metric | Target | Maximum |
|--------|--------|---------|
| Page load time | < 2s | < 4s |
| API response time (p95) | < 200ms | < 500ms |
| Concurrent users | 1,000 | 5,000 |
| Database query time | < 50ms | < 200ms |

### 7.2 Security & Authentication Policy
> 🔒 **MANDATORY POLICY:** Semua proyek Admin Panel, CRM, Dashboard, atau aplikasi selain landing page publik WAJIB memasukkan fitur Autentikasi Login (Auth) & Authorization (RBAC) sebagai fitur P0 (Must Have) untuk mencegah peretasan dan akses ilegal.

- [ ] Authentication: [JWT / Session / OAuth] (WAJIB untuk Admin Panel & Apps)
- [ ] Authorization: [RBAC / ABAC] — Akses role-based yang ketat
- [ ] Protected Routes: Semua endpoint/halaman internal dilindungi auth guard
- [ ] Data encryption: [At rest / In transit]
- [ ] Compliance: [GDPR / HIPAA / PCI-DSS / None]
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention
- [ ] XSS prevention

### 7.3 Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast ratios met

### 7.4 Scalability
- [ ] Expected growth: [X users/month]
- [ ] Data volume: [X records/month]
- [ ] Scaling strategy: [Horizontal / Vertical / Auto-scaling]

### 7.5 Compatibility
- [ ] Browsers: [Chrome, Firefox, Safari, Edge — last 2 versions]
- [ ] Devices: [Desktop, Tablet, Mobile]
- [ ] OS: [iOS 15+, Android 10+, Windows 10+, macOS 12+]

---

## 8. Success Metrics

### 8.1 Key Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| [Primary metric] | [Baseline] | [Goal] | [How to measure] |
| [Secondary metric] | [Baseline] | [Goal] | [How to measure] |
| [Engagement metric] | [Baseline] | [Goal] | [How to measure] |

### 8.2 OKRs

**Objective:** [What we're trying to achieve]

| Key Result | Target | Deadline |
|-----------|--------|----------|
| KR1: [Measurable outcome] | [Number] | [Date] |
| KR2: [Measurable outcome] | [Number] | [Date] |
| KR3: [Measurable outcome] | [Number] | [Date] |

### 8.3 Success Criteria for Launch
- [ ] [Criterion 1 — must be true before we consider this successful]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## 9. Dependencies & Risks

### 9.1 Dependencies

| Dependency | Owner | Status | Impact if Delayed |
|-----------|-------|--------|------------------|
| [External API] | [Team/vendor] | [Ready/In Progress] | [High/Medium/Low] |
| [Design assets] | [Designer] | [Ready/In Progress] | [High/Medium/Low] |
| [Infrastructure] | [DevOps] | [Ready/In Progress] | [High/Medium/Low] |

### 9.2 Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigation plan] |
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigation plan] |

### 9.3 Assumptions
- [Assumption 1 — what we're assuming to be true]
- [Assumption 2]
- [Assumption 3]

### 9.4 Constraints
- **Budget:** [Budget limit if applicable]
- **Timeline:** [Hard deadline if any]
- **Technical:** [Technical limitations]
- **Team:** [Team size / availability]

---

## 10. Timeline & Milestones

| Phase | Milestone | Target Date | Owner |
|-------|-----------|------------|-------|
| Discovery | Problem validated, PRD approved | [Date] | PM |
| Design | Wireframes + UI design complete | [Date] | Designer |
| Sprint 1 | [Core feature X] complete | [Date] | Dev Team |
| Sprint 2 | [Core feature Y] complete | [Date] | Dev Team |
| Sprint 3 | [Feature Z + polish] | [Date] | Dev Team |
| QA | Testing complete, bugs fixed | [Date] | QA |
| Launch | Production release | [Date] | PM + DevOps |
| Post-launch | Metrics review, iteration plan | [Date] | PM |

---

## 11. Appendix

### A. Glossary
| Term | Definition |
|------|-----------|
| [Term] | [Definition] |

### B. References
- [Link to research doc]
- [Link to competitor analysis]
- [Link to design files]

### C. Changelog
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | [Date] | [Name] | Initial draft |
```
