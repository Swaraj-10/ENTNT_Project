TalentFlow – Hiring Platform
TalentFlow is a modern React-based hiring management platform designed to streamline HR processes around Jobs, Candidates, and Assessments.

It delivers a production-like experience by simulating real-world APIs and persistence using MirageJS and IndexedDB, ensuring that all data flows, error handling, and interactions behave like a fully functional system.

This platform demonstrates clean architecture, scalable UI components, realistic data seeding, and robust state management — making it a solid foundation for hiring and talent workflows.
##Features
###Jobs Management
- Create & Edit Jobs
  • Title is required
  • Slug must be unique (auto-generated)
- Archive & Unarchive
  • Toggle job status dynamically
- Drag-and-Drop Reordering
  • Optimistic updates with rollback
- Search & Filtering
  • Filter by title, tags, or status
  • Paginated list with server-like queries
- Deep Linking
  • Each job accessible directly by identifier
###Candidates Management
- Large-Scale Candidate Dataset 
- Virtualized Candidate List (smooth scrolling)
- Stage Filters & Search (applied, screening, tech, interview, offer, hired, rejected)
- Candidate Profile View (timeline of stage transitions)
- Kanban Board for Stages (drag-and-drop)
- Notes & Mentions with @mentions
###Assessments
- Assessment Builder per Job
  • Multiple question types
- Live Preview
- Validation Rules (required fields, max length, numeric ranges)
- Persistence (IndexedDB + LocalStorage)
- Submission Workflow (recorded locally & re-fetchable)
##Technical Implementation
Frontend Framework: React 18 with Hooks, React Router
State & Data Management: React Query (@tanstack/react-query)
Drag & Drop: @dnd-kit/core, @dnd-kit/sortable
Mock API Layer: MirageJS with latency + errors
Persistence: IndexedDB (Dexie) & LocalStorage
UI/UX: TailwindCSS, responsive layouts, toast notifications
###Data Seeding
- Jobs: 25 realistic seeded jobs
- Candidates: Randomised names, emails, job assignments, timelines
- Assessments: 3 seeded assessments (React, SQL, JS concepts)
###Tech Stack
Frontend: React 18, React Router
UI: TailwindCSS
State Management: React Query
Drag-and-Drop: @dnd-kit
API Simulation: MirageJS
Persistence: IndexedDB (Dexie), LocalStorage
Deployment: Netlify
##Setup
Prerequisites: Node.js >= 16, npm or yarn

Installation:
git clone https://github.com/<your-username>/talentflow.git
cd talentflow
npm install
npm run dev

Build for Production:
npm run build

Preview Production Build:
npm run preview
##Technical Decisions & Trade-offs
- MirageJS vs. Real Backend: chose MirageJS for API simulation
- IndexedDB vs. LocalStorage: Dexie for structured data, LocalStorage for simplicity
- React Query vs. Local State: simplified caching and mutation handling
- Optimistic Updates with Rollback for UX consistency
- @dnd-kit chosen over React Beautiful DnD for flexibility
- Artificial Latency & Error Simulation for real-world testing
##Deliverables
- Deployed App: Hosted on Netlify
- GitHub Repository: Complete codebase & docs
- README: Architecture, setup, decisions, and resolved issues
