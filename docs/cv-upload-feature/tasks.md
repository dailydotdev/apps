# CV Upload Feature - Development Tasks

## Phase 1: Foundation & Components

### 1.1 Core File Upload Infrastructure
- [ ] **Create FileUploadField component** (`packages/shared/src/components/fields/FileUploadField.tsx`)
  - Implement HTML5 drag-and-drop API
  - Add file type validation (PDF, DOC, DOCX)  
  - Include progress indicators and error states
  - Reference: [Figma - Default State](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32597%3A3874)

- [ ] **Create CVUploadZone component** (`packages/shared/src/components/profile/CVUploadZone.tsx`)
  - Drag & drop zone with visual feedback
  - Browse files button integration
  - Reuse existing Button component from design system
  - Reference: [Figma - Profile Empty State](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A54814)

### 1.2 GraphQL Integration  
- [ ] **Add CV upload mutations** (`packages/shared/src/graphql/mutations/cv.ts`)
  - `uploadCV` mutation with file upload support
  - `deleteCV` mutation for file removal
  - `updateCV` mutation for file replacement
  
- [ ] **Add CV queries** (`packages/shared/src/graphql/queries/cv.ts`)
  - `getUserCV` query to fetch user's CV data
  - Fragment for CV data structure

### 1.3 Upload State Management
- [ ] **Create CV upload hooks** (`packages/shared/src/hooks/useCVUpload.ts`)
  - TanStack Query integration for upload mutations
  - Progress tracking and error handling
  - Cache invalidation after successful uploads

- [ ] **Create CV data hooks** (`packages/shared/src/hooks/useUserCV.ts`)  
  - Query hook for fetching user CV data
  - Optimistic updates for better UX

## Phase 2: Homepage Feed Banner

### 2.1 Feed Banner Component
- [ ] **Create CVUploadBanner component** (`packages/shared/src/components/cards/CVUploadBanner.tsx`)
  - Implement design from [Figma - Desktop Banner](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A54477)
  - Add drag & drop functionality for desktop
  - Include LinkedIn import link
  - Reuse existing design system tokens (Typography, Button, etc.)

### 2.2 Responsive Banner Variations
- [ ] **Add tablet responsive design**
  - Reference: [Figma - Tablet Banner](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A56393)
  - Adapt layout for medium breakpoints

- [ ] **Add mobile responsive design**
  - Reference: [Figma - Mobile Banner](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A56548)
  - Touch-optimized upload button (no drag-and-drop)

### 2.3 Banner Dismissal Flow
- [ ] **Implement banner close functionality**
  - Close button (X) integration
  - Store dismissal state in user preferences
  - Reference: [Figma - Toast Message](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A55601)

- [ ] **Add dismissal toast message**
  - Reuse existing Toast component from `packages/shared/src/components/notifications/`
  - Message: "You can upload / edit your CV from the profile section"
  - Include "Go to profile" action link

### 2.4 Feed Integration
- [ ] **Integrate banner into homepage feed** (`packages/webapp/src/components/Feed/`)
  - Add conditional rendering based on CV upload status
  - Position banner according to design specifications
  - Ensure banner doesn't interfere with existing feed functionality

## Phase 3: Profile Page Integration

### 3.1 Profile CV Section
- [ ] **Create CVProfileSection component** (`packages/shared/src/components/profile/CVProfileSection.tsx`)
  - Empty state design: [Figma - Profile Empty](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A54814)
  - Uploaded state design: [Figma - Profile Uploaded](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A54878)
  - Loading state design: [Figma - Loading States](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32597%3A3874)

### 3.2 CV Management Features
- [ ] **Add file replacement functionality**
  - Upload new CV option
  - Confirmation modal for replacement
  - Delete/remove CV option

- [ ] **Add CV file information display**
  - Show filename and upload date
  - File size and type information
  - Upload timestamp with relative formatting

### 3.3 Profile Page Integration
- [ ] **Integrate CV section into profile page** (`packages/webapp/src/components/Profile/`)
  - Add to existing profile form/layout
  - Maintain consistency with other profile sections
  - Reference: [Figma - Profile Section](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A54641)

## Phase 4: LinkedIn Import Flow

### 4.1 LinkedIn Import Modal
- [ ] **Create LinkedInImportModal component** (`packages/shared/src/components/modals/LinkedInImportModal.tsx`)
  - Step-by-step guidance design: [Figma - LinkedIn Import](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A54795)
  - External link to LinkedIn profile
  - Instructions for PDF export process

### 4.2 Import Flow Integration  
- [ ] **Add "Import from LinkedIn" trigger**
  - Link in upload banners and profile sections
  - "Feeling lazy?" helper text integration
  - Modal launch functionality

- [ ] **Add mobile-specific import flow**
  - Reference: [Figma - Mobile Import](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A56365)
  - Touch-optimized interaction

## Phase 5: Success & Error States

### 5.1 Success Celebrations
- [ ] **Create CVUploadSuccessModal component** (`packages/shared/src/components/modals/CVUploadSuccessModal.tsx`)
  - Celebratory design: [Figma - Success States](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A56242)
  - "All set! We'll take it from here" messaging
  - Profile completion guidance
  - Confetti or celebration animation

### 5.2 Error Handling
- [ ] **Implement upload error states** 
  - File format error handling
  - File size limit errors
  - Network/server error recovery
  - Reference: [Figma - Error States](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A56242) (error variations)

### 5.3 Loading States
- [ ] **Add comprehensive loading indicators**
  - Upload progress bars
  - Loading state designs: [Figma - Loading](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32597%3A3874)
  - Skeleton loaders for CV data fetching

## Phase 6: Mobile Experience

### 6.1 Mobile-Specific Components
- [ ] **Optimize upload experience for mobile**
  - Touch-friendly file selection
  - Mobile-specific error messages
  - Reference: [Figma - Mobile Success](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A54807)

### 6.2 Mobile Success Flow
- [ ] **Create mobile success modal**
  - Design: [Figma - Mobile Celebration](https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/?node-id=32596%3A56335)
  - Optimized for smaller screens
  - Profile navigation integration

## Phase 7: Analytics & Tracking

### 7.1 Event Tracking
- [ ] **Implement upload analytics**
  - `upload cv` event (as specified in PRD)
  - Track upload attempts vs. successes
  - File type and size analytics

### 7.2 User Behavior Analytics
- [ ] **Add interaction tracking**
  - Banner dismissal rates
  - LinkedIn import usage
  - Success modal interactions
  - Profile completion correlation

## Phase 8: Testing & Quality Assurance

### 8.1 Component Testing
- [ ] **Write unit tests for upload components**
  - FileUploadField drag-and-drop testing
  - Upload hook testing with mocked mutations
  - Error state testing

### 8.2 Integration Testing  
- [ ] **Add end-to-end upload flow tests**
  - Complete upload journey testing
  - Cross-device compatibility
  - Error scenario testing

### 8.3 Visual Testing
- [ ] **Create Storybook stories**
  - All upload component states
  - Success and error modal stories
  - Mobile/desktop responsive stories

### 8.4 Accessibility Testing
- [ ] **Ensure upload accessibility**
  - Keyboard navigation for drag-and-drop
  - Screen reader compatibility
  - Focus management in modals

## Phase 9: Performance & Security

### 9.1 File Upload Optimization
- [ ] **Implement upload performance features**
  - Chunked file uploads for large CVs
  - Upload progress with cancellation
  - Retry mechanism for failed uploads

### 9.2 Security Implementation
- [ ] **Add file upload security**
  - Client-side file type validation
  - File size restrictions
  - Coordinate with backend for server-side validation

## Phase 10: Deployment & Monitoring

### 10.1 Feature Flag Integration
- [ ] **Add feature flags for gradual rollout**
  - CV upload banner toggle
  - Profile section toggle
  - User segment targeting

### 10.2 Monitoring & Analytics
- [ ] **Set up upload monitoring**
  - Success/failure rate tracking
  - Performance monitoring
  - Error reporting integration

### 10.3 Documentation
- [ ] **Add component documentation**
  - Storybook documentation
  - Usage examples
  - API integration guidelines

---

## Reusable Components Identified

### Existing Components to Leverage
- **Button** (`packages/shared/src/components/buttons/Button.tsx`) - Upload buttons, LinkedIn links
- **Typography** (`packages/shared/src/components/Typography.tsx`) - All text content
- **Toast** (`packages/shared/src/components/notifications/`) - Dismissal messages  
- **ContentModal** (`packages/shared/src/components/modals/ContentModal.tsx`) - Base for success/error modals
- **Icon** components - File icons, success checkmarks, close buttons

### New Reusable Components Created
- **FileUploadField** - Generic drag-and-drop file upload (reusable beyond CVs)
- **CVUploadZone** - CV-specific upload area
- **UploadProgressIndicator** - Progress bars for file uploads
- **FileInfoDisplay** - File name, size, date formatting

## Implementation Notes

- Follow existing code patterns in the monorepo
- Use semantic design tokens from Tailwind config  
- Ensure TypeScript strict mode compliance
- Implement proper error boundaries around upload components
- Consider offline support for upload retry functionality
- Plan for future CV parsing/analysis integration hooks