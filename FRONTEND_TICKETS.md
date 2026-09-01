# PayLens Frontend Development Tickets

## Phase 1: Foundation Setup

### Ticket 1: Project Setup & Dependencies ✅ COMPLETED
- [x] Install shadcn/ui and configure components
- [x] Add TanStack Query (React Query) for API calls
- [x] Update package.json with required dependencies
- [x] Configure TypeScript types for API responses
- [x] Set up environment variables for API base URL

### Ticket 2: Base Layout & Navigation ✅ COMPLETED
- [x] Create sidebar navigation component
- [x] Implement responsive layout with sidebar
- [x] Set up routing for all 5 pages
- [x] Create base page layout component
- [ ] Add page transitions/animations (deferred to polish phase)

### Ticket 3: Dark Mode Theme & Styling ✅ COMPLETED
- [x] Configure Tailwind for dark mode
- [x] Create color palette (ops tool aesthetic)
- [x] Set up custom Tailwind config for Datadog/Grafana style
- [x] Create global styles for monospace fonts
- [x] Implement status color utilities (green/amber/red)

### Ticket 4: Mock Data System ✅ COMPLETED
- [x] Create mock data directory structure
- [x] Generate sample payment investigation responses
- [x] Generate sample incident data
- [x] Generate sample metrics/KPI data
- [x] Create mock API service layer
- [x] Add toggle for demo mode vs real API

## Phase 2: Core Components

### Ticket 5: Status Badges & UI Primitives ✅ COMPLETED
- [x] Create StatusBadge component (HIGH/MEDIUM/LOW)
- [x] Create ErrorCodeBadge component
- [x] Create SeverityBadge component
- [x] Add loading/skeleton components
- [x] Create error boundary components (deferred - basic error handling sufficient)

### Ticket 6: Confidence Gauge Component ✅ COMPLETED
- [x] Create ConfidenceGauge component
- [x] Implement circular gauge visualization
- [x] Add color coding (70/90 thresholds)
- [x] Add animation for confidence changes
- [x] Make it responsive

### Ticket 7: Evidence Card Component ✅ COMPLETED
- [x] Create EvidenceCard component
- [x] Add source badge (Log/Metric/Incident/Runbook)
- [x] Implement expandable "view raw" section
- [x] Add JSON syntax highlighting
- [x] Style for dark mode

### Ticket 8: Agent Trace Step Component ✅ COMPLETED
- [x] Create AgentTraceStep component
- [x] Implement stepper/timeline visualization
- [x] Add status indicators (pending/running/done/error)
- [x] Make details expandable
- [x] Add animations for state changes

### Ticket 9: Root Cause Result Card ✅ COMPLETED
- [x] Create RootCauseResultCard component
- [x] Display cause name and error code
- [x] Integrate ConfidenceGauge
- [x] Add recommendation display
- [x] Implement "Copy Internal RCA" / "Copy Customer Message" buttons
- [x] Add human review banner

### Ticket 10: API Integration Layer ✅ COMPLETED
- [x] Set up TanStack Query configuration
- [x] Create API service for payment investigation
- [x] Create API service for incident investigation
- [x] Create API service for support chat
- [x] Create API service for metrics
- [x] Add error handling and retry logic
- [x] Implement loading states

## Phase 3: Pages

### Ticket 11: Dashboard Page
- [ ] Create dashboard page structure
- [ ] Build KPI cards (Success Rate, Failure Rate, Avg Latency, Open Incidents)
- [ ] Implement live polling for metrics
- [ ] Create time-series chart with Recharts
- [ ] Build recent incidents table
- [ ] Build recent failed payments feed
- [ ] Add "Investigate" quick action buttons

### Ticket 12: Payment Investigation Page
- [ ] Create payment investigation page structure
- [ ] Add search bar for payment ID lookup
- [ ] Build transaction summary card
- [ ] Implement Agent Trace stepper
- [ ] Build Evidence Panel with cards
- [ ] Integrate Root Cause Result Card
- [ ] Add human review escalation banner
- [ ] Implement responsive layout (3-panel)

### Ticket 13: Incidents Page
- [ ] Create incidents list page
- [ ] Build incidents table with all fields
- [ ] Add filtering and sorting
- [ ] Create incident detail page
- [ ] Build affected issuer/timeframe display
- [ ] Add correlated metrics chart
- [ ] List affected payment IDs with links
- [ ] Show root cause summary and recommendation

### Ticket 14: Support Assistant Page
- [ ] Create support assistant page structure
- [ ] Build chat-style interface
- [ ] Implement customer message input
- [ ] Display AI-generated responses
- [ ] Add collapsible "Technical Details" panel
- [ ] Style for support agent console aesthetic

### Ticket 15: Runbooks Page
- [ ] Create runbooks page structure
- [ ] Build runbook list with search
- [ ] Implement markdown rendering
- [ ] Add runbook detail view
- [ ] Style for documentation readability

## Phase 4: Polish & Testing

### Ticket 16: Responsive Design
- [ ] Test and fix dashboard on tablet
- [ ] Test and fix payment investigation on tablet
- [ ] Optimize sidebar for smaller screens
- [ ] Add mobile navigation (if needed)
- [ ] Fix any responsive issues

### Ticket 17: Loading & Error States
- [ ] Add skeleton loaders for all pages
- [ ] Implement graceful error handling
- [ ] Add retry mechanisms
- [ ] Create error pages (404, 500)
- [ ] Add loading animations

### Ticket 18: E2E Testing
- [ ] Set up Playwright configuration
- [ ] Write test for payment investigation happy path
- [ ] Write test for dashboard load
- [ ] Write test for incident navigation
- [ ] Configure test runner
- [ ] Add test to CI/CD pipeline

### Ticket 19: Performance Optimization
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add image optimization
- [ ] Optimize API calls
- [ ] Add caching strategies

### Ticket 20: Final Polish
- [ ] Add hover states and transitions
- [ ] Polish animations
- [ ] Fix any visual bugs
- [ ] Add tooltips where needed
- [ ] Final accessibility check
- [ ] Documentation for deployment

## Total: 20 Tickets

**Estimated Time:** 2-3 days of focused development
**Current Status:** Ready to start
