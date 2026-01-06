# PRD: Side-by-Side Opportunity Editing Experience

## Overview

Create a new side-by-side editing experience for job opportunities. The left panel contains the editing form (~1/3 width), and the right panel shows a live preview (~2/3 width).

### Goals
- Improve recruiter editing UX with real-time preview
- Make it obvious what's complete, what's missing, and how to launch
- Reduce clicks and confusion vs. current inline editing
- Reusable components for both `/recruiter/[oppId]/edit` and prepare page

### Non-Goals
- No new fields - use existing opportunity schema
- No changes to candidate-facing job page functionality
- No server-side draft storage (use localStorage for now)

---

## User Experience

### Layout (Desktop - laptop+)
```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [← Dashboard] "Job Title" [DRAFT badge]  [Update] [Save]│
├─────────────────────────────────────────────────────────────────┤
│ [====== Completeness: 6/8 sections complete ================]   │
├───────────────────────┬─────────────────────────────────────────┤
│                       │                                         │
│   EDIT PANEL          │         LIVE PREVIEW                    │
│   (~1/3 width)        │         (~2/3 width)                    │
│                       │                                         │
│   ┌─────────────────┐ │   ┌─────────────────────────────────┐   │
│   │ Role Info       │ │   │                                 │   │
│   │ • Title         │ │   │   [Company Logo]                │   │
│   │ • TLDR          │ │   │   Job Title                     │   │
│   │ • Keywords      │ │   │   Tags: React, Node.js...       │   │
│   │ • Location      │ │   │                                 │   │
│   └─────────────────┘ │   │   TLDR: ...                     │   │
│                       │ │   │                                 │   │
│   ┌─────────────────┐ │   │   Location | Salary | Type      │   │
│   │ Job Details     │ │   │                                 │   │
│   │ • Employment    │ │   ├─────────────────────────────────┤   │
│   │ • Seniority     │ │   │ ▼ Overview                      │   │
│   │ • Team Size     │ │   │   Content...                    │   │
│   │ • Salary        │ │   ├─────────────────────────────────┤   │
│   └─────────────────┘ │   │ ▼ Responsibilities              │   │
│                       │ │   │   Content...                    │   │
│   ┌─────────────────┐ │   ├─────────────────────────────────┤   │
│   │ Overview*       │ │   │ ▼ Requirements                  │   │
│   │ [Rich Text]     │ │   │   Content...                    │   │
│   └─────────────────┘ │   └─────────────────────────────────┘   │
│                       │                                         │
│   ┌─────────────────┐ │   ┌─────────────────────────────────┐   │
│   │ Responsibilities│ │   │ COMPANY SIDEBAR                 │   │
│   │ [Rich Text]     │ │   │ • Founded, HQ, Employees        │   │
│   └─────────────────┘ │   │ • Description                   │   │
│         ...           │   │ • Perks                         │   │
│                       │   └─────────────────────────────────┘   │
│   ┌─────────────────┐ │                                         │
│   │ Company [Edit]  │ │   ┌─────────────────────────────────┐   │
│   └─────────────────┘ │   │ RECRUITER SIDEBAR               │   │
│   ┌─────────────────┐ │   │ • Name, title, bio              │   │
│   │ Recruiter [Edit]│ │   └─────────────────────────────────┘   │
│   └─────────────────┘ │                                         │
└───────────────────────┴─────────────────────────────────────────┘
```

### Layout (Mobile - < laptop)
```
┌─────────────────────────┐
│ [Edit] [Preview]  tabs  │
├─────────────────────────┤
│                         │
│  Active tab content     │
│  (full width)           │
│                         │
└─────────────────────────┘
```

### Scroll Behavior (Hybrid)
- Both panels scroll independently by default
- Clicking/focusing a section in edit panel smoothly scrolls preview to that section
- Preview sections have anchor IDs for scroll targeting

### Header Elements
| Element | Label | Purpose |
|---------|-------|---------|
| Back button | "← Dashboard" | Returns to recruiter dashboard (explicit destination) |
| Title | Job title | Shows what you're editing |
| Status badge | "DRAFT" / "LIVE" | Shows current job state clearly |
| Update button | "Update from URL" | Re-imports job from original posting (was "Reimport") |
| Save button | "Save" → "Saving..." → "Saved ✓" | Primary CTA with clear feedback |

### Save Behavior
- **Single Save button** in header - saves all changes to server
- **Auto-save locally** to browser storage (1s debounce) - prevents data loss
- **Visual feedback**: Button shows "Saving..." while saving, "Saved ✓" on success
- **Unsaved indicator**: Subtle dot on Save button when changes exist
- **Exit confirmation** prompts if navigating away with unsaved changes
- **Toast on save**: "Changes saved" confirmation

### Validation & Feedback
- **Required fields**: Show red asterisk (*) next to label
- **Missing content**: Section shows "Required" badge in red when empty
- **Character limits**: Show "1,847 / 2,000" counter, turns yellow at 90%, red at 100%
- **Character overflow**: If pasting exceeds limit, truncate and show toast "Content truncated to 2,000 characters"
- **Save validation**: If required fields missing, scroll to first error, highlight section in red
- **Completeness bar**: Shows "6 of 8 sections complete" - clicking incomplete section scrolls to it

---

## Edit Panel Sections

| # | Section | Required | What recruiter sees |
|---|---------|----------|---------------------|
| 1 | **Role Info** | Yes | Title, TLDR (short pitch), Tech stack keywords, Location |
| 2 | **Job Details** | Yes | Employment type, Seniority, Team size, Salary range |
| 3 | **Overview** | Yes | Rich text - "The elevator pitch for this role" |
| 4 | **Responsibilities** | Yes | Rich text - "What they'll own and be accountable for" |
| 5 | **Requirements** | Yes | Rich text - "Must-haves to be successful" |
| 6 | **What You'll Do** | No | Rich text - "Day-to-day activities" (optional, distinct from responsibilities) |
| 7 | **Interview Process** | No | Rich text - "What to expect" (optional, builds trust) |
| 8 | **Company** | - | Summary shown, "Edit details →" button opens modal |
| 9 | **Recruiter** | - | Your profile shown, "Edit profile →" button opens modal |

### Section UX Details
- **Collapsed by default**: Sections show title + completion status, expand on click
- **Optional sections**: Show "+ Add What You'll Do" button instead of empty section
- **Rich text toolbar**: Bold, Italic, Bullet list, Numbered list, Link
- **Character counter**: Always visible, e.g., "1,234 / 2,000"
- **Help text**: Each section has a one-liner explaining what to write

---

## Routes

| Route | Purpose | Layout |
|-------|---------|--------|
| `/recruiter/[oppId]/edit` | New edit page | Side-by-side (new) |
| `/recruiter/[opportunityId]/prepare` | Onboarding step 2 | Keep current layout with progress bar, use same edit panel component |
| `/jobs/[id]` | Candidate view only | Remove edit mode, keep as-is for viewing |

---

## Component Architecture

### New Components (in `packages/shared/src/components/opportunity/SideBySideEdit/`)

```
SideBySideEdit/
  ├── index.ts                    # Barrel export
  ├── OpportunityEditPanel.tsx    # Left panel with all sections (placeholder)
  ├── OpportunityLivePreview.tsx  # Placeholder (JobPage used directly instead)
  ├── EditPreviewTabs.tsx         # Mobile tab switcher
  ├── hooks/
  │   ├── index.ts
  │   ├── useOpportunityEditForm.ts  # Central form with unified schema
  │   └── useLocalDraft.ts           # localStorage draft persistence
  └── sections/                   # TODO: Phase 2
      ├── RoleInfoSection.tsx
      ├── JobDetailsSection.tsx
      ├── ContentSection.tsx      # Reusable for all 5 content areas
      ├── CompanySection.tsx      # Button → opens modal
      └── RecruiterSection.tsx    # Button → opens modal
```

**Notes on implementation:**
- Layout is inlined in edit.tsx (no separate SideBySideEditLayout)
- Header is inlined in edit.tsx (no separate OpportunityEditHeader)
- Preview uses existing JobPage directly (OpportunityLivePreview exists but not used)

**Header contains:**
- Back button ("← Dashboard" - explicit destination)
- Opportunity title (editable inline or just display)
- Status badge (DRAFT / LIVE)
- "Update from URL" button (opens `LazyModal.OpportunityReimport`)
- Save button with states: "Save" → "Saving..." → "Saved ✓"

**Below header:**
- `OpportunityCompletenessBar` component (existing, reused)
- Shows "6 of 8 sections complete" - clickable to jump to incomplete sections

### New Hooks (in `packages/shared/src/components/opportunity/SideBySideEdit/hooks/`)

```
hooks/
  ├── useOpportunityEditForm.ts   # Central form with unified schema
  ├── useLocalDraft.ts            # localStorage draft persistence
  └── useScrollSync.ts            # Click-to-scroll synchronization
```

### Reused Components

| Component | From | Usage |
|-----------|------|-------|
| `RichTextEditor` | `fields/RichTextEditor` | Content sections |
| `TextField` | `fields/TextField` | Title, TLDR, team size |
| `Radio` | `fields/Radio` | Employment type |
| `Dropdown` | - | Seniority, role type, salary period |
| `KeywordSelection` | existing | Tech stack keywords |
| `ProfileLocation` | existing | Location picker |
| `OpportunityEditModal` | existing | Company/Recruiter editing |
| `JobPage` | `pages/jobs/[id]` | Preview (with modifications) |

---

## State Management

### Form State
- Single `FormProvider` wrapping entire edit experience
- Unified Zod schema combining role info + content sections
- `form.watch()` feeds real-time data to preview

### Local Draft
- Key: `opportunity_draft_{opportunityId}`
- Auto-save form values to localStorage on change (debounced 1s)
- Load draft on mount if exists
- Clear on successful server save
- Show "Draft saved" indicator

### Exit Confirmation
- Use existing `useExitConfirmation` hook
- Trigger when `form.formState.isDirty` and user navigates away

---

## Implementation Phases

### Phase 1: Layout Foundation
1. Create `SideBySideEditLayout` with desktop/mobile detection
2. Create `EditPreviewTabs` for mobile
3. Create `/recruiter/[oppId]/edit.tsx` page
4. Create `useOpportunityEditForm` hook with unified schema
5. Create `useLocalDraft` hook

### Phase 2: Edit Panel
6. Create section components (RoleInfo, JobDetails, Content, Company, Recruiter)
7. Create `OpportunityEditPanel` assembling all sections
8. Create `OpportunityEditHeader` with global Save button
9. Wire up form validation and error display

### Phase 3: Live Preview
10. Modify `JobPage` to accept `previewMode` prop and `previewData` override
11. Add section anchor IDs to JobPage for scroll targeting
12. Create `OpportunityLivePreview` wrapper using `form.watch()`
13. Implement `useScrollSync` hook

### Phase 4: Polish
14. Add exit confirmation with `useExitConfirmation`
15. Implement unified save mutation (combine info + content)
16. Add toast notifications for save success/error
17. Test responsive behavior and scroll sync

### Phase 5: Integration
18. Update prepare page to use `OpportunityEditPanel` (keep its layout)
19. Remove edit mode from `/jobs/[id]` JobPage
20. Update `OpportunityEditContext` for new flow

---

## Files to Modify

| File | Changes |
|------|---------|
| `packages/webapp/pages/jobs/[id]/index.tsx` | Remove `canEdit` logic, add `previewMode` prop, add section IDs |
| `packages/webapp/pages/recruiter/[opportunityId]/prepare.tsx` | Use new `OpportunityEditPanel` component |
| `packages/shared/src/lib/schema/opportunity.ts` | Add unified edit schema if needed |

## Files to Create

| File | Purpose |
|------|---------|
| `packages/webapp/pages/recruiter/[oppId]/edit.tsx` | New edit page |
| `packages/shared/src/components/opportunity/SideBySideEdit/*` | All new components |

---

## Design Decisions

| Decision | Choice | Recruiter Rationale |
|----------|--------|---------------------|
| Update button | "Update from URL" in header | Clear label, not dev jargon |
| Completeness bar | Yes, above edit panel | Shows progress, clickable to jump to gaps |
| Company/Recruiter editing | Modal only | Keeps form context, modals are familiar |
| Scroll behavior | Hybrid - click section to sync preview | Instant feedback without scroll jank |
| Mobile behavior | Tab-based toggle (Edit/Preview) | Full-width editing on small screens |
| Save behavior | Global save + localStorage auto-save | One button to save, can't lose work |
| Back button | "← Dashboard" | Explicit destination, no guessing |
| Status badge | DRAFT / LIVE in header | Always know job state |
| Validation | Inline errors + scroll to first | Don't make me hunt for problems |

---

## Success Criteria (Recruiter Perspective)

- [ ] I can see exactly what candidates will see as I type (real-time preview)
- [ ] I always know if my changes are saved (clear Save button states)
- [ ] I know what's missing to complete my job posting (completeness bar + required badges)
- [ ] I can't accidentally lose my work (auto-save + exit confirmation)
- [ ] I can easily update from my original job posting URL
- [ ] It's obvious where I am and how to get back (← Dashboard, status badge)
- [ ] Validation tells me exactly what's wrong and where
- [ ] Mobile experience doesn't block me from making quick edits

## Technical Success Criteria

- [ ] Prepare page reuses `OpportunityEditPanel` component
- [ ] Job page (`/jobs/[id]`) no longer has edit mode
- [ ] Local draft persists across page refresh (same browser)
- [ ] Form validation matches existing `opportunityEditStep1Schema`

## Edge Cases to Handle

| Scenario | Expected Behavior |
|----------|-------------------|
| Paste content > 2000 chars | Truncate + toast "Content truncated to 2,000 characters" |
| Navigate away with unsaved changes | Show "You have unsaved changes. Leave anyway?" modal |
| Local draft exists from previous session | Show "Resume draft?" prompt on page load |
| Save fails (network error) | Toast "Failed to save. Your changes are saved locally." + retry button |
| Company/Recruiter modal opened with unsaved form | Keep form state, modal is separate context |
| Required field empty on save | Scroll to first error, highlight section, toast "Please complete required fields" |

---

## Task List

### Phase 1: Layout Foundation ✅ COMPLETE
- [x] 1.1 Create responsive layout (inlined in edit.tsx using `useViewSize`)
- [x] 1.2 Create `EditPreviewTabs.tsx` for mobile tab switching
- [x] 1.3 Create `/recruiter/[opportunityId]/edit.tsx` page with basic routing
- [x] 1.4 Create `useOpportunityEditForm.ts` hook with unified Zod schema
- [x] 1.5 Create `useLocalDraft.ts` hook for localStorage persistence

**Implementation Notes:**
- Route uses `[opportunityId]` to match existing recruiter page patterns
- Layout is inlined in edit.tsx for simplicity (no separate SideBySideEditLayout component)
- Preview uses existing `JobPage` component directly (no custom preview wrapper needed)
- Header is inlined with: Dashboard link, title, status badge, Update from URL, Save buttons
- OpportunityCompletenessBar shows only when required fields are missing (expected behavior)

### Phase 2: Edit Panel Sections ✅ COMPLETE
- [x] 2.1 Create `RoleInfoSection.tsx` (title, TLDR, keywords, location)
- [x] 2.2 Create `JobDetailsSection.tsx` (employment, seniority, team size, salary)
- [x] 2.3 Create `ContentSection.tsx` (reusable rich text for all 5 content areas)
- [x] 2.4 Create `CompanySection.tsx` (summary + modal trigger)
- [x] 2.5 Create `RecruiterSection.tsx` (summary + modal trigger)
- [x] 2.6 Create `OpportunityEditPanel.tsx` assembling all sections with CollapsibleSection
- [x] 2.7 Header with Save, Re-import, back, status badge (inlined in edit.tsx)
- [x] 2.8 Wire up form validation with inline error display

**Implementation Notes:**
- All sections use typed `useFormContext<OpportunitySideBySideEditFormData>()` for type-safe errors
- Sections are collapsible with ArrowIcon indicator
- CompanySection and RecruiterSection trigger `LazyModal.OpportunityEdit` with appropriate type
- Inline validation errors display below each field

### Phase 3: Live Preview
- [x] 3.1 Use existing `JobPage` directly as preview (no modification needed)
- [ ] 3.2 Add `previewData` override to JobPage for real-time updates (if needed)
- [ ] 3.3 Add section anchor IDs to JobPage for scroll targeting
- [x] 3.4 Live preview working using existing JobPage component
- [ ] 3.5 Create `useScrollSync.ts` hook for click-to-scroll synchronization

### Phase 4: Polish & UX
- [ ] 4.1 Add exit confirmation using `useExitConfirmation` hook
- [ ] 4.2 Implement unified save mutation (combine info + content mutations)
- [ ] 4.3 Add toast notifications for save success/error
- [ ] 4.4 Add "Resume draft?" prompt when draft exists
- [ ] 4.5 Add character overflow handling (truncate + toast)
- [ ] 4.6 Test responsive behavior on tablet/mobile
- [ ] 4.7 Test scroll sync between panels

### Phase 5: Integration & Cleanup
- [ ] 5.1 Update prepare page to use `OpportunityEditPanel` component
- [ ] 5.2 Remove edit mode (`canEdit` logic) from `/jobs/[id]` JobPage
- [ ] 5.3 Update `OpportunityEditContext` for new flow
- [ ] 5.4 Update any navigation links that pointed to old edit mode
- [ ] 5.5 Final QA pass with recruiter persona checklist
