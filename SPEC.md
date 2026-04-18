# Allen's Contractor's - Construction Job Estimating App

## Project Overview
- **Project Name**: Allen's Contractor's
- **Type**: Responsive Web Application (SPA)
- **Core Functionality**: Professional construction job estimating for house flips, remodels, and new builds
- **Target Users**: Contractors doing house flips, remodels, and full new builds
- **Tech Stack**: Vanilla HTML/CSS/JS, localStorage-only persistence

## UI/UX Specification

### Layout Structure

**Desktop Layout (≥1024px)**
- Fixed sidebar navigation (260px width)
- Main content area with top header bar
- Content area with cards and tables
- Max content width: 1400px, centered

**Tablet Layout (768px - 1023px)**
- Collapsible sidebar (hamburger menu)
- Full-width content area
- Adjusted spacing

**Mobile Layout (<768px)**
- Bottom navigation bar (5 items max)
- Stacked card layout
- Large touch targets (min 48px)
- Sticky totals footer on estimate screens
- Modal/drawer for forms

### Visual Design

**Color Palette**
- Primary: `#1E3A5F` (Deep Navy) - Headers, primary buttons
- Secondary: `#2D5A87` (Steel Blue) - Secondary elements
- Accent: `#E67E22` (Contractor Orange) - CTAs, highlights, totals
- Success: `#27AE60` (Green) - Approved, saved states
- Warning: `#F39C12` (Amber) - Pending, draft states
- Danger: `#E74C3C` (Red) - Delete, overdue
- Background: `#F5F7FA` (Light Gray) - App background
- Surface: `#FFFFFF` (White) - Cards, modals
- Text Primary: `#2C3E50` (Dark Slate)
- Text Secondary: `#7F8C8D` (Gray)
- Border: `#E0E6ED` (Light Border)

**Typography**
- Font Family: `'DM Sans', 'Segoe UI', system-ui, sans-serif`
- Headings: DM Sans Bold
  - H1: 28px
  - H2: 22px
  - H3: 18px
  - H4: 16px
- Body: 14px, line-height 1.5
- Small: 12px
- Numbers/Money: `'DM Mono', monospace` for alignment

**Spacing System**
- Base unit: 4px
- XS: 4px, SM: 8px, MD: 16px, LG: 24px, XL: 32px, XXL: 48px

**Visual Effects**
- Card shadows: `0 2px 8px rgba(0,0,0,0.08)`
- Hover shadows: `0 4px 16px rgba(0,0,0,0.12)`
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)
- Transitions: 200ms ease-out

### Components

**Navigation**
- Desktop: Left sidebar with icons + labels
- Mobile: Bottom nav with icons + labels
- Active state: Primary color background tint

**Cards**
- White background, 8px radius, subtle shadow
- Header section with title and actions
- Content section with appropriate padding

**Buttons**
- Primary: Navy background, white text, orange hover
- Secondary: White background, navy border, navy text
- Danger: Red background, white text
- Sizes: Large (56px height mobile), Medium (44px), Small (36px)

**Forms**
- Input height: 48px mobile, 40px desktop
- Labels above inputs, 12px font
- Focus state: Orange border
- Error state: Red border + message

**Tables (Desktop)**
- Striped rows, sticky header
- Row hover highlight
- Action column with icons

**Modals/Drawers**
- Backdrop: rgba(0,0,0,0.5)
- Centered (desktop), bottom sheet (mobile)
- Max width: 600px, full width mobile

**Toast Notifications**
- Bottom center (mobile), top right (desktop)
- Auto-dismiss after 3 seconds
- Success/Warning/Error variants

## Functionality Specification

### 1. Dashboard
- Stats cards: Total Jobs, Total Estimates, Drafts, Approved, Total Value
- Recent estimates list (last 5)
- Quick action buttons: New Job, New Estimate, Open Templates
- Empty state for first-time users

### 2. Job Management
- Job list with search and filter
- Job cards (mobile) / table (desktop)
- Job form fields:
  - name (required)
  - customer name (required)
  - phone
  - email
  - address
  - project type (dropdown)
  - status (dropdown)
  - square footage
  - notes
  - created/updated dates (auto)
- CRUD operations with confirmation for delete
- Job detail view

### 3. Estimate Builder
- Estimate list filtered by job
- Estimate form:
  - name, status, notes, scope summary
  - internal notes
  - created/updated timestamps
- Line items with all cost fields:
  - name, description, category
  - quantity, unit
  - material cost
  - labor hours, labor rate, labor cost (auto)
  - subcontractor cost
  - equipment cost
  - waste factor %, markup %, tax %, contingency %
  - total line cost (auto-calculated)
- Category grouping with collapse/expand
- Reorder items via drag or arrows
- Quick add from cost library
- Duplicate line item
- Sticky totals footer on mobile

### 4. Cost Library
- Searchable/filterable list
- Library item form
- Add to estimate action
- Categories matching estimate categories

### 5. Templates
- Template list
- Save estimate as template
- Create from scratch
- Template form with line items
- Use template to create estimate
- Starter templates pre-loaded

### 6. Proposal View
- Customer-facing clean layout
- Company header
- Customer/Property info
- Scope summary
- Line items or grouped categories
- Exclusions section
- Total price (large)
- Terms/notes
- Payment schedule (optional)
- Signature block (future PDF)

### 7. Change Orders
- Linked to job/estimate
- Status: pending/approved/rejected
- Line items + reason
- Cost impact shown
- History view

### 8. Settings
- Company name
- Default labor rate
- Default markup %
- Default tax %
- Default contingency %
- Default terms text
- Default exclusions text

## Data Models

```typescript
interface Job {
  id: string;
  name: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  projectType: ProjectType;
  status: JobStatus;
  squareFootage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Estimate {
  id: string;
  jobId: string;
  name: string;
  status: EstimateStatus;
  scopeSummary: string;
  internalNotes: string;
  lineItems: EstimateLineItem[];
  createdAt: string;
  updatedAt: string;
}

interface EstimateLineItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  quantity: number;
  unit: string;
  materialCost: number;
  laborHours: number;
  laborRate: number;
  subcontractorCost: number;
  equipmentCost: number;
  wasteFactorPercent: number;
  markupPercent: number;
  taxPercent: number;
  contingencyPercent: number;
  sortOrder: number;
}

interface CostLibraryItem {
  id: string;
  name: string;
  category: Category;
  defaultUnit: string;
  defaultMaterialCost: number;
  defaultLaborHours: number;
  defaultLaborRate: number;
  defaultSubcontractorCost: number;
  defaultMarkup: number;
  notes: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  lineItems: EstimateLineItem[];
  createdAt: string;
}

interface ChangeOrder {
  id: string;
  estimateId: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  lineItems: EstimateLineItem[];
  reason: string;
  createdAt: string;
}

interface AppSettings {
  companyName: string;
  defaultLaborRate: number;
  defaultMarkupPercent: number;
  defaultTaxPercent: number;
  defaultContingencyPercent: number;
  defaultTerms: string;
  defaultExclusions: string;
}
```

## Storage Layer

```javascript
const Storage = {
  initializeStorage: () => { /* seed default data */ },
  getJobs: () => Job[],
  saveJobs: (jobs: Job[]) => void,
  getEstimates: () => Estimate[],
  saveEstimates: (estimates: Estimate[]) => void,
  getTemplates: () => Template[],
  saveTemplates: (templates: Template[]) => void,
  getCostLibrary: () => CostLibraryItem[],
  saveCostLibrary: (items: CostLibraryItem[]) => void,
  getSettings: () => AppSettings,
  saveSettings: (settings: AppSettings) => void,
  getChangeOrders: () => ChangeOrder[],
  saveChangeOrders: (orders: ChangeOrder[]) => void
}
```

## Sample Data

### Jobs (3)
1. 123 Oak Street Flip - Anderson - flip - approved
2. Kitchen Remodel - Johnson - kitchen - in progress
3. Ridgeview Addition - Williams - addition - proposal sent

### Estimates (2)
1. 123 Oak Street Flip - Full Rehab
2. Johnson Kitchen - Initial Estimate

### Cost Library (5+)
- Drywall installation (14x8)
- Vinyl plank flooring
- Interior paint (eggshell)
- Cabinet install (base)
- Ceramic tile install

### Templates (2)
- Kitchen remodel
- Full flip rehab

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dashboard loads with stats cards and quick actions
- [ ] Navigation works on desktop sidebar and mobile bottom bar
- [ ] Jobs list displays with search functionality
- [ ] Estimate builder shows line items with calculations
- [ ] Totals update in real-time as items change
- [ ] Proposal view displays clean customer-facing format
- [ ] Settings persist across sessions
- [ ] Mobile layout has large touch targets
- [ ] Forms validate required fields

### Functional Checkpoints
- [ ] Data persists in localStorage
- [ ] App loads previously saved data on startup
- [ ] Create/Edit/Delete operations work for all entities
- [ ] Line item calculations are accurate
- [ ] Templates can be applied to new estimates
- [ ] Search/filter works on lists
- [ ] Confirmation shown before destructive actions
- [ ] Toast notifications appear for operations
- [ ] Empty states show helpful messages for first-time use

### Responsive Checkpoints
- [ ] Desktop layout has sidebar navigation
- [ ] Mobile layout has bottom navigation
- [ ] Forms are usable on mobile (no horizontal scroll)
- [ ] Tables scroll horizontally on mobile if needed
- [ ] Touch targets are minimum 48px
- [ ] Numbers align properly in columns

### Performance Checkpoints
- [ ] App loads in under 2 seconds
- [ ] No visible lag on form interactions
- [ ] Storage operations complete without delay