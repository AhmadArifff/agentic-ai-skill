# Component Patterns — Architecture & Design Guide

Reference document for the Frontend Skill's component architecture capability.

---

## Atomic Design Methodology

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│  Complete, specific instances of templates with real data    │
├─────────────────────────────────────────────────────────────┤
│                       Templates                              │
│  Page-level layout defining content structure                │
├─────────────────────────────────────────────────────────────┤
│                       Organisms                              │
│  Complex UI sections (Header, ProductCard, SearchBar)        │
├─────────────────────────────────────────────────────────────┤
│                       Molecules                              │
│  Groups of atoms working together (FormField, NavItem)       │
├─────────────────────────────────────────────────────────────┤
│                         Atoms                                │
│  Basic building blocks (Button, Input, Badge, Icon)          │
└─────────────────────────────────────────────────────────────┘
```

### Examples by Level

| Level | Components | Characteristics |
|-------|-----------|----------------|
| **Atom** | Button, Input, Label, Icon, Badge, Avatar, Spinner | Self-contained, no dependencies, highly reusable |
| **Molecule** | FormField (Label + Input + Error), SearchInput (Input + Icon + Button) | Combines 2-3 atoms, single purpose |
| **Organism** | Header (Logo + Nav + Search + UserMenu), ProductCard (Image + Title + Price + Button) | Complex, self-contained section |
| **Template** | DashboardLayout (Sidebar + Header + Content + Footer) | Defines content structure, no real data |
| **Page** | DashboardPage (Template + real data + state) | Specific instance with actual content |

---

## Component File Organization

### Feature-Based (Recommended)

```
src/
├── components/                  # Shared, reusable components
│   ├── ui/                      # Atoms + Molecules
│   │   ├── Button/
│   │   │   ├── Button.tsx       # Component
│   │   │   ├── Button.styles.css # Styles
│   │   │   ├── Button.test.tsx  # Tests
│   │   │   └── index.ts        # Barrel export
│   │   ├── Input/
│   │   ├── Badge/
│   │   └── Modal/
│   ├── layout/                  # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── shared/                  # Cross-feature organisms
│       ├── DataTable/
│       └── FileUploader/
│
├── features/                    # Feature-specific components
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   └── RegisterForm/
│   │   ├── hooks/
│   │   └── utils/
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard/
│   │   │   ├── ProductGrid/
│   │   │   └── ProductFilter/
│   │   ├── hooks/
│   │   └── api/
│   └── dashboard/
│
├── hooks/                       # Shared custom hooks
├── utils/                       # Shared utilities
├── styles/                      # Global styles & tokens
└── pages/                       # Page-level components / routes
```

### Co-Location Rules

```
✅ Keep together:
├── Component + its styles
├── Component + its tests
├── Component + its types
├── Component + its stories (Storybook)
└── Feature + its hooks/utils/api

❌ Avoid:
├── All styles in one /styles folder
├── All tests in one /tests folder
├── All types in one /types folder
└── Components divorced from their context
```

---

## Component Design Principles

### Single Responsibility

```
❌ Bad — does too many things:
<UserCard 
  user={user}
  showOrders={true}
  showSettings={true}
  onDeleteUser={handleDelete}
  onUpdateRole={handleRole}
  showAnalytics={true}
/>

✅ Good — focused components:
<UserCard user={user} />
<UserOrders userId={user.id} />
<UserSettings userId={user.id} />
<UserAnalytics userId={user.id} />
```

### Props Interface Design

```
✅ Good Props:
├── Minimal required props (only what's truly necessary)
├── Sensible defaults for optional props
├── Standard HTML attributes extended (className, style, id)
├── Event handlers follow onX naming (onClick, onChange)
├── Boolean props default to false
└── Discriminated unions for variants

❌ Bad Props:
├── 20+ props (split into multiple components)
├── Boolean props that enable unrelated features
├── Prop drilling through 3+ levels (use context/composition)
├── Ambiguous naming (data, info, options)
└── Accepting entire objects when only 1-2 fields needed
```

### Component State Checklist

Every interactive component should handle these states:

| State | What to Show | Example |
|-------|-------------|---------|
| **Default** | Normal, ready state | Button with label |
| **Hover** | Visual feedback on mouse over | Slight color change, shadow lift |
| **Focus** | Visible focus indicator | Outline ring (for keyboard navigation) |
| **Active/Pressed** | Pressed feedback | Slight scale down, darker color |
| **Disabled** | Interaction prevented | Reduced opacity, not-allowed cursor |
| **Loading** | Operation in progress | Spinner replacing label, skeleton |
| **Error** | Something went wrong | Red border, error message |
| **Empty** | No data to show | Illustration + message + CTA |
| **Success** | Operation completed | Green indicator, checkmark |

---

## Composition Patterns

### Compound Components

Components that share state and work together as a group:

```jsx
// Usage — flexible, declarative
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">Overview content</Tabs.Content>
  <Tabs.Content value="settings">Settings content</Tabs.Content>
</Tabs>

// vs. Configuration-based (less flexible)
<Tabs tabs={[
  { label: 'Overview', content: <Overview /> },
  { label: 'Settings', content: <Settings /> },
]} />
```

### Render Props / Slots

Allow consumers to customize rendering:

```jsx
// Render prop pattern
<DataTable
  data={users}
  columns={columns}
  renderRow={(user) => (
    <tr key={user.id}>
      <td>{user.name}</td>
      <td><StatusBadge status={user.status} /></td>
    </tr>
  )}
  renderEmpty={() => <EmptyState message="No users found" />}
/>
```

### Higher-Order Component (HOC)

Wrap components to add behavior:

```jsx
// Add authentication requirement to any page
const ProtectedPage = withAuth(DashboardPage);

// Add loading state to any component
const UserListWithLoading = withLoading(UserList);
```

### Custom Hooks

Extract reusable logic from components:

```jsx
// Custom hook for form handling
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldErrors = validate({ ...values });
    setErrors(fieldErrors);
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    const formErrors = validate(values);
    if (Object.keys(formErrors).length === 0) {
      onSubmit(values);
    } else {
      setErrors(formErrors);
    }
  };

  return { values, errors, touched, handleChange, handleBlur, handleSubmit };
}
```

---

## Styling Strategy Comparison

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **CSS Modules** | Scoped by default, zero runtime, standard CSS | No dynamic styles without vars | Most projects |
| **CSS Custom Properties** | Dynamic, no build tool, great for themes | No conditional logic | Design systems, themes |
| **Styled Components** | Dynamic, co-located, full JS power | Runtime cost, learning curve | React apps, dynamic styling |
| **Tailwind CSS** | Fast development, consistent, small bundle | Verbose HTML, learning curve | Rapid prototyping, utility-first |
| **BEM** | Predictable, no tooling needed | Verbose class names, manual scoping | Legacy/vanilla projects |
| **Vanilla CSS** | No dependencies, full control, standards | Manual scoping, no composition | Simple projects, learning |

### BEM Naming Convention

```css
/* Block */
.card { }

/* Element (part of block) */
.card__title { }
.card__image { }
.card__body { }
.card__footer { }

/* Modifier (variant of block or element) */
.card--featured { }
.card--compact { }
.card__title--large { }
```

---

## Common UI Patterns

### Modal / Dialog

```
Requirements:
├── Focus trap (Tab cycles within modal)
├── Close on Escape key
├── Close on backdrop click (optional)
├── Scroll lock on body when open
├── Focus restoration on close (return to trigger element)
├── ARIA: role="dialog", aria-modal="true", aria-labelledby
└── Animation: fadeIn backdrop + slideUp/scaleIn content
```

### Toast / Notification

```
Requirements:
├── Auto-dismiss after timeout (3-5 seconds)
├── Manual dismiss with close button
├── Stack multiple toasts (newest on top or bottom)
├── Variants: success, error, warning, info
├── ARIA: role="alert" or role="status", aria-live="polite"
├── Pause auto-dismiss on hover
└── Animation: slideIn from edge + fadeOut
```

### Dropdown / Select

```
Requirements:
├── Open on click (not hover — accessibility)
├── Close on outside click, Escape, or selection
├── Keyboard: Arrow keys to navigate, Enter to select, type-ahead search
├── ARIA: role="listbox", role="option", aria-expanded, aria-activedescendant
├── Position: flip to top if near viewport bottom
├── Max height with scroll for long lists
└── Search/filter for 10+ options
```

### Form Patterns

```
Requirements:
├── Labels associated with inputs (htmlFor/id)
├── Required fields marked visually AND with aria-required
├── Validation on blur (not on every keystroke)
├── Error messages below the field with aria-describedby
├── Disable submit button during submission
├── Show loading state on submit
├── Preserve form data on validation failure
├── Focus first error field after failed submission
└── Success feedback after submission
```
