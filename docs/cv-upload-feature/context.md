# CV Upload Feature - Technical Context

## Overview
This feature enables users to upload their CVs as part of Profile 4.0 foundation, helping daily.dev gather structured professional data for future job matching capabilities. The implementation includes drag-and-drop functionality, LinkedIn import guidance, and various UI states across desktop, tablet, and mobile platforms.

## Feature Scope (Final Specs)

### Core Functionality
1. **Homepage Feed Banner** - Prominent CV upload prompt with drag & drop
2. **Profile Page Integration** - CV upload section in profile settings  
3. **LinkedIn Import Flow** - Guided process for exporting CV from LinkedIn
4. **File Upload States** - Loading, success, and error states
5. **Dismissal Flow** - Banner dismissal with toast feedback
6. **Cross-platform Support** - Responsive design for desktop, tablet, mobile

### User Experience Flow
- Users see banner on homepage feed (if no CV uploaded yet)
- Users can upload via drag-and-drop or browse files
- LinkedIn import option available with step-by-step guidance
- Success celebration modal after upload
- Profile page shows uploaded CV with edit/reupload options
- Dismissible banners show toast with profile section reference

## Technical Architecture

### Monorepo Structure
- **packages/webapp** - Next.js app where CV upload will be implemented
- **packages/shared** - Shared components, hooks, and utilities
- **packages/extension** - Browser extension (may need CV data integration)

### Technology Stack
- **React 18.3.1** with Next.js 15.4.1
- **TypeScript** for type safety
- **TanStack Query v5** for server state management
- **GraphQL** with graphql-request for API communication
- **Tailwind CSS** with custom design system
- **Jotai** for local state management

### File Upload Implementation Requirements

#### File Handling
- **Supported formats**: PDF (primary), DOC/DOCX likely
- **File size limits**: TBD (typical CV size constraints)
- **Validation**: File type, size, and basic structure validation
- **Storage**: Backend integration for secure file storage
- **Processing**: CV parsing/analysis capabilities (future)

#### Drag & Drop Implementation
- Native HTML5 drag-and-drop API
- Visual feedback during drag operations
- Error handling for unsupported files
- Progress indicators during upload

### API Integration

#### GraphQL Operations Needed
```typescript
// Upload CV mutation
mutation UploadCV($file: Upload!, $userId: ID!) {
  uploadCV(file: $file, userId: $userId) {
    id
    filename
    uploadedAt
    status
  }
}

// Get user CV query  
query GetUserCV($userId: ID!) {
  user(id: $userId) {
    cv {
      id
      filename
      uploadedAt
      status
    }
  }
}

// Delete/replace CV mutation
mutation DeleteCV($cvId: ID!) {
  deleteCV(id: $cvId) {
    success
  }
}
```

#### Analytics Integration
- New event: `upload cv` (as specified in PRD)
- Track upload attempts, successes, failures
- Measure banner dismissal rates
- Monitor LinkedIn import usage

### Component Architecture

#### Shared Components to Create/Extend
Based on existing design system patterns:

1. **CVUploadBanner** (new) - Homepage feed banner
   - Location: `packages/shared/src/components/cards/`
   - Drag & drop zone with visual feedback
   - LinkedIn import link integration

2. **CVUploadSection** (new) - Profile page upload area
   - Location: `packages/shared/src/components/profile/`
   - File management interface
   - Upload status display

3. **CVUploadModal** (new) - Success/error modals
   - Location: `packages/shared/src/components/modals/`
   - Celebration modal for successful uploads
   - Error handling modal for failed uploads

4. **FileUploadField** (new) - Reusable drag-and-drop field
   - Location: `packages/shared/src/components/fields/`
   - Generic file upload with customizable validation

#### Existing Components to Leverage
- **Button** - For browse files, LinkedIn link buttons
- **Toast** - For dismissal feedback messages
- **ContentModal** - Base for upload success/error modals
- **Typography** - Consistent text styling throughout

### State Management Strategy

#### Local State (Jotai)
- Upload progress tracking
- Drag-and-drop state
- Modal visibility states
- Form validation states

#### Server State (TanStack Query)
- CV upload mutations
- User CV data queries  
- File deletion operations
- Cache invalidation after uploads

#### Context Integration
- User authentication context
- Profile completion tracking
- Feature flag context (for gradual rollout)

### Design System Integration

#### Colors & Theming
- Use semantic tokens: `text-primary`, `bg-surface-primary`
- Success states: `text-accent-avocado-default`
- Error states: `text-status-error`
- Theme-aware components with `bg-theme-*` classes

#### Typography
- Banner headlines: `Typography` component with `Display` or `Title` sizes
- Body text: `Body` typography variants
- File names: `Code` or `Caption` variants

#### Interactive Elements
- File upload zones with hover states
- Progress indicators using design system animations
- Button variants for primary (upload) and secondary (browse) actions

### Responsive Design

#### Breakpoints (from design system)
- **Desktop** (laptopL+): Full drag-and-drop experience
- **Tablet** (tablet to laptop): Adapted drag zones
- **Mobile** (mobileL to mobileXL): Touch-optimized upload buttons

#### Layout Adaptations
- Homepage banner: Full-width on desktop, stacked content on mobile
- Profile upload: Inline on desktop, modal on mobile
- LinkedIn import: Overlay modal across all breakpoints

### Testing Strategy

#### Component Testing
- File upload interactions (drag-and-drop, browse)
- Error state handling
- Success flow validation
- Modal behavior testing

#### Integration Testing  
- GraphQL mutation testing with mocked responses
- File upload API integration
- Analytics event firing
- Cache invalidation after operations

#### Visual Testing
- Storybook stories for all upload states
- Cross-device responsive testing
- Dark/light theme compatibility

### Accessibility Requirements

#### File Upload
- Keyboard navigation support
- Screen reader announcements for upload progress
- Focus management in modals
- ARIA labels for drag-and-drop zones

#### Error Handling
- Clear error messaging
- Accessible form validation
- High contrast error states

### Security Considerations

#### File Upload Security
- Server-side file type validation
- Virus scanning integration
- File size restrictions
- Secure file storage with access controls

#### Data Privacy
- CV content handling according to privacy policies
- User consent for data processing
- Secure deletion capabilities

### Performance Considerations

#### File Handling
- Lazy loading of upload components
- Chunked uploads for large files
- Progress tracking without blocking UI
- Efficient file preview generation

#### Bundle Optimization
- Code splitting for upload functionality
- Dynamic imports for drag-and-drop libraries
- Optimized asset loading

### Integration Points

#### Backend Services
- File upload service endpoint
- CV parsing/analysis service (future)
- User profile service integration
- Analytics service integration

#### Third-party Services
- LinkedIn API integration (future enhancement)
- File storage service (AWS S3/similar)
- Virus scanning service

## Development Environment

### Local Development
- Use Docker Compose setup for full stack testing
- Mock file upload service for frontend development
- Storybook for component isolation testing

### Testing Data
- Sample CV files for testing different formats
- Mock user profiles at various completion states
- Error scenario simulation

This technical context provides the foundation for implementing the CV upload feature within daily.dev's existing architecture while maintaining consistency with established patterns and technologies.