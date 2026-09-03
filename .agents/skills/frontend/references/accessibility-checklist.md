# Accessibility Checklist — WCAG 2.1 AA

Reference document for the Frontend Skill's accessibility capability.

---

## Quick Accessibility Audit

### The 5-Minute Check

1. **Keyboard only**: Unplug your mouse. Can you use every feature?
2. **Tab order**: Does Tab move logically through the page?
3. **Focus visible**: Can you see where you are at all times?
4. **Zoom to 200%**: Does everything still work and read?
5. **No color only**: Remove color — is information still conveyed?

---

## WCAG 2.1 AA Checklist by Principle

### 1. Perceivable — Can users perceive the content?

#### 1.1 Text Alternatives

| # | Requirement | Check |
|---|------------|-------|
| 1.1.1 | All `<img>` have `alt` attribute | ✅ Meaningful alt for informative images, `alt=""` for decorative |
| 1.1.2 | Complex images (charts, diagrams) have long description | ✅ Use `aria-describedby` or link to text alternative |
| 1.1.3 | Icon buttons have accessible name | ✅ `aria-label` or visually hidden text |
| 1.1.4 | SVG icons have `role="img"` + `aria-label` or `<title>` | ✅ Or `aria-hidden="true"` if decorative |
| 1.1.5 | Video has captions, audio has transcript | ✅ Required for pre-recorded media |

#### 1.2 Color & Contrast

| # | Requirement | Target |
|---|------------|--------|
| 1.2.1 | Normal text contrast ratio | ≥ 4.5:1 |
| 1.2.2 | Large text (18px+ bold, 24px+ normal) contrast | ≥ 3:1 |
| 1.2.3 | UI component contrast (borders, icons, focus rings) | ≥ 3:1 |
| 1.2.4 | Information not conveyed by color alone | ✅ Use icons, text, patterns in addition |
| 1.2.5 | Link text distinguishable from surrounding text | ✅ Underline or 3:1 contrast + non-color indicator |

#### 1.3 Adaptable Content

| # | Requirement | Check |
|---|------------|-------|
| 1.3.1 | Use semantic HTML elements | ✅ `<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`, `<footer>` |
| 1.3.2 | Heading hierarchy is logical (h1 → h2 → h3) | ✅ No skipped levels, single h1 per page |
| 1.3.3 | Lists use `<ul>`, `<ol>`, `<dl>` | ✅ Not `<div>` with bullet characters |
| 1.3.4 | Tables use `<th>`, `<caption>`, `scope` | ✅ Data tables have proper headers |
| 1.3.5 | Content readable at 200% zoom | ✅ No horizontal scroll, no truncation |
| 1.3.6 | Content works in portrait and landscape | ✅ No orientation lock unless essential |

---

### 2. Operable — Can users operate the interface?

#### 2.1 Keyboard Accessible

| # | Requirement | Check |
|---|------------|-------|
| 2.1.1 | All interactive elements reachable via Tab | ✅ Buttons, links, inputs, selects, custom widgets |
| 2.1.2 | No keyboard traps (can always Tab out) | ✅ Exception: modals (trap is intentional, Escape exits) |
| 2.1.3 | Custom components support expected keys | ✅ See keyboard patterns below |
| 2.1.4 | Skip navigation link present | ✅ "Skip to main content" as first Tab stop |
| 2.1.5 | Focus order matches visual order | ✅ DOM order = visual order (avoid CSS reordering) |
| 2.1.6 | Focus indicator is visible | ✅ Minimum 2px outline, 3:1 contrast |

#### Keyboard Patterns by Component

| Component | Keys |
|-----------|------|
| **Button** | Enter, Space → activate |
| **Link** | Enter → navigate |
| **Checkbox** | Space → toggle |
| **Radio group** | Arrow keys → move selection, Space → select |
| **Select/Dropdown** | Enter/Space → open, Arrow keys → navigate, Enter → select, Escape → close |
| **Tabs** | Arrow keys → switch tab, Home/End → first/last |
| **Modal** | Escape → close, Tab → cycle within (focus trap) |
| **Menu** | Arrow keys → navigate, Enter → activate, Escape → close |
| **Accordion** | Enter/Space → toggle, Arrow keys → move between headers |
| **Slider** | Arrow keys → adjust value, Home/End → min/max |
| **Combobox** | Type → filter, Arrow keys → navigate, Enter → select |

#### 2.2 Timing

| # | Requirement | Check |
|---|------------|-------|
| 2.2.1 | Auto-updating content can be paused/stopped | ✅ Carousels, news tickers, auto-refresh |
| 2.2.2 | Session timeout gives 20+ seconds warning | ✅ Allow user to extend |
| 2.2.3 | No content flashes > 3 times per second | ✅ Seizure prevention |

---

### 3. Understandable — Can users understand the content?

#### 3.1 Readable

| # | Requirement | Check |
|---|------------|-------|
| 3.1.1 | Page language declared: `<html lang="en">` | ✅ Required for screen readers |
| 3.1.2 | Language changes marked: `<span lang="fr">` | ✅ For inline foreign text |

#### 3.2 Predictable

| # | Requirement | Check |
|---|------------|-------|
| 3.2.1 | Focus does not trigger unexpected changes | ✅ No auto-submit on focus |
| 3.2.2 | Input does not trigger unexpected changes | ✅ No auto-navigation on select change |
| 3.2.3 | Navigation is consistent across pages | ✅ Same nav position and order |

#### 3.3 Input Assistance

| # | Requirement | Check |
|---|------------|-------|
| 3.3.1 | Error messages identify the field and describe the error | ✅ "Email is required" not just "Error" |
| 3.3.2 | Labels are visible and associated with inputs | ✅ `<label for="email">` or `aria-label` |
| 3.3.3 | Required fields marked visually AND programmatically | ✅ `aria-required="true"` + visual indicator |
| 3.3.4 | Error messages linked to fields | ✅ `aria-describedby="email-error"` |
| 3.3.5 | Form instructions provided before the form | ✅ "Fields marked * are required" |

---

### 4. Robust — Does it work with assistive technology?

| # | Requirement | Check |
|---|------------|-------|
| 4.1.1 | Valid HTML (no duplicate IDs, proper nesting) | ✅ Run HTML validator |
| 4.1.2 | Custom components have proper ARIA roles and states | ✅ See ARIA patterns below |
| 4.1.3 | Status messages announced without focus change | ✅ `aria-live="polite"` or `role="status"` |

---

## ARIA Patterns Reference

### Landmarks

```html
<header role="banner">         <!-- Site header (implicit with <header>) -->
<nav role="navigation">         <!-- Navigation (implicit with <nav>) -->
<main role="main">              <!-- Main content (implicit with <main>) -->
<aside role="complementary">    <!-- Side content (implicit with <aside>) -->
<footer role="contentinfo">     <!-- Site footer (implicit with <footer>) -->
<form role="search">            <!-- Search form -->
<section role="region" aria-label="Featured"> <!-- Named region -->
```

### Common Widget Patterns

#### Button

```html
<!-- Native button (preferred) -->
<button type="button" onclick="handleClick()">Click me</button>

<!-- Custom button (when <button> can't be used) -->
<div role="button" tabindex="0" 
     onclick="handleClick()" 
     onkeydown="if(event.key==='Enter'||event.key===' '){handleClick();}">
  Click me
</div>

<!-- Icon button -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Toggle button -->
<button type="button" aria-pressed="false" onclick="toggle(this)">
  Dark mode
</button>
```

#### Dialog / Modal

```html
<div role="dialog" 
     aria-modal="true" 
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-desc">Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

#### Live Regions

```html
<!-- Polite: announced when user is idle (status updates, form success) -->
<div role="status" aria-live="polite">3 items added to cart</div>

<!-- Assertive: announced immediately (errors, urgent alerts) -->
<div role="alert" aria-live="assertive">Error: Connection lost</div>

<!-- Log: chronological updates (chat, activity feed) -->
<div role="log" aria-live="polite">New message from John</div>
```

#### Tabs

```html
<div role="tablist" aria-label="Account settings">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">
    Profile
  </button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">
    Security
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Profile content...
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  Security content...
</div>
```

---

## Focus Management

### Focus Styles

```css
/* Visible focus for all interactive elements */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove default outline (only when :focus-visible is supported) */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast focus for dark backgrounds */
.dark :focus-visible {
  outline-color: var(--color-primary-300);
}
```

### Skip Navigation

```html
<!-- First element in <body> -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<style>
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 0.5rem 1rem;
  background: var(--color-primary-500);
  color: white;
  z-index: 9999;
}
.skip-link:focus {
  top: 0;
}
</style>
```

---

## Testing Tools

| Tool | Type | Purpose |
|------|------|---------|
| **axe DevTools** | Browser extension | Automated WCAG violation detection |
| **Lighthouse** | Chrome DevTools | Accessibility audit score |
| **WAVE** | Browser extension | Visual accessibility evaluation |
| **NVDA** | Screen reader (Windows) | Free screen reader testing |
| **VoiceOver** | Screen reader (macOS/iOS) | Built-in, Cmd+F5 to activate |
| **TalkBack** | Screen reader (Android) | Built-in Android screen reader |
| **Color Contrast Checker** | Web tool | Verify contrast ratios |
| **Headings Map** | Browser extension | Verify heading hierarchy |
