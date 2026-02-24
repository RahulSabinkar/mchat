---
Implementation Plan: M-CHAT-R Web Application
Tech Stack Decision
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React 18 + Vite | Fast dev server, excellent TypeScript, large ecosystem |
| Styling | Tailwind CSS | Rapid prototyping, built-in accessibility utilities, small bundle |
| State | React Context + useReducer | Zero deps, sufficient complexity, built-in React patterns |
| Routing | React Router v6 | Standard, well-documented, supports nested routes |
| PDF Export | jsPDF + html2canvas | Works offline, full control, no external services |
| Type Checking | TypeScript strict mode | Catch errors early, better DX, self-documenting code |
| Testing | Vitest + React Testing Library | Vite-native, fast, component testing |
---

Phase 1: Foundation (Week 1)
Goal: Project scaffold, types, data loading, routing
| Task | Deliverable |
|------|-------------|
| 1.1 Project init | Vite + React + TypeScript config |
| 1.2 Tailwind setup | tailwind.config.js, base styles, CSS variables for theming |
| 1.3 Type definitions | src/types/index.ts - all interfaces from PRD |
| 1.4 Data layer | src/data/questions.ts - loader for JSON question files |
| 1.5 Routing | React Router with /welcome, /info, /screen, /results |
| 1.6 Layout component | Responsive shell with header/footer |

---

Phase 2: Core Screening Flow (Week 2-3)
Goal: Questions screens, initial scoring, progress persistence
| Task | Deliverable |
|------|-------------|
| 2.1 WelcomeScreen | Intro text, disclaimers, "Begin" CTA |
| 2.2 ChildInfoScreen | Name input, DOB picker, age validation (16-48mo) |
| 2.3 ScreeningContext | Session state, localStorage persistence |
| 2.4 QuestionCard | Single question display, Yes/No buttons |
| 2.5 QuestionsScreen | Progress bar, navigation (back/next), question cycling |
| 2.6 Scoring utilities | calculateInitialScore(), getRiskCategory() |
| 2.7 Progress save/resume | localStorage check on app load |

---

Phase 3: Follow-Up Flow (Week 3-4)
Goal: Dynamic follow-up question administration
| Task | Deliverable |
|------|-------------|
| 3.1 FlowNode engine | Universal renderer for all node types |
| 3.2 ChecklistInput | Multi-select with 0_examples / 1_examples categories |
| 3.3 FollowUpScreen | Orchestrates follow-up for elevated-risk items only |
| 3.4 Decision logic | Handles both/clarify_frequency flows |
| 3.5 Follow-up scoring | Per-item scoring, total follow-up score |
Key complexity: The JSON flowcharts have varying structures. Need a generic FlowNodeRenderer:
// Node types to handle:
type FlowNode =
| 'initial_question' // Yes/No branching
| 'instruction' // Text display, auto-continue
| 'checklist' // Multi-select with categories
| 'decision_logic' // Conditional routing
| 'followup_question' // Final scoring question
| 'mandatory_followup' // Like q02 hearing test
| 'multiple_choice' // Like q02 hearing results

---

Phase 4: Results & Export (Week 5)
Goal: Results display, PDF generation, sharing
| Task | Deliverable |
|------|-------------|
| 4.1 ResultsScreen | Score display, risk category, recommendations |
| 4.2 PDF generation | jsPDF template with results, child info, date |
| 4.3 Print-friendly view | CSS @media print rules |
| 4.4 Resource links | mchatscreen.com, healthcare provider guidance |

---

Phase 5: Polish & Accessibility (Week 6-7)
Goal: WCAG 2.1 AA, responsive, edge cases
| Task | Deliverable |
|------|-------------|
| 5.1 Keyboard navigation | Tab order, focus management, skip links |
| 5.2 Screen reader support | ARIA labels, live regions for score announcements |
| 5.3 Color contrast | Tailwind contrast utilities, dark mode support |
| 5.4 Mobile responsive | Touch-friendly buttons, viewport tests |
| 5.5 Error boundaries | Graceful failure handling |
| 5.6 Unit tests | Core scoring functions, flow navigation |

---

Project Structure
src/
├── components/
│ ├── layout/
│ │ ├── Layout.tsx
│ │ ├── Header.tsx
│ │ └── Footer.tsx
│ ├── screens/
│ │ ├── WelcomeScreen.tsx
│ │ ├── ChildInfoScreen.tsx
│ │ ├── QuestionsScreen.tsx
│ │ ├── FollowUpScreen.tsx
│ │ └── ResultsScreen.tsx
│ ├── questions/
│ │ ├── QuestionCard.tsx
│ │ ├── ProgressBar.tsx
│ │ └── NavigationButtons.tsx
│ ├── followup/
│ │ ├── FlowNodeRenderer.tsx
│ │ ├── ChecklistInput.tsx
│ │ ├── InstructionNode.tsx
│ │ └── DecisionHandler.tsx
│ └── results/
│ ├── ScoreDisplay.tsx
│ ├── RecommendationCard.tsx
│ └── ExportButton.tsx
├── context/
│ └── ScreeningContext.tsx
├── hooks/
│ ├── useScreening.ts
│ ├── useScoring.ts
│ └── useLocalStorage.ts
├── data/
│ └── questions.ts # JSON loader
├── utils/
│ ├── scoring.ts
│ ├── storage.ts
│ ├── pdf-generator.ts
│ └── date-helpers.ts
├── types/
│ └── index.ts
├── App.tsx
└── main.tsx

---

Key Technical Decisions

1. Single-page vs multi-page: One question at a time (lower cognitive load, better mobile UX)
2. State persistence: localStorage with session ID, auto-resume on return
3. No backend: All data stays client-side for PHI compliance
4. Question personalization: Replace ****\_\_\_**** placeholder with child's name

---

Risk Areas
| Risk | Mitigation |
|------|------------|
| Complex flowchart logic | Build generic FlowNodeRenderer early, unit test each node type |
| Accessibility compliance | Test with axe-core, keyboard-only navigation from day 1 |
| PDF styling | Start PDF template in Phase 4, allow extra time |
| Mobile responsiveness | Test on actual devices, not just browser devtools |

---

Next Steps

1. Initialize Vite project with chosen stack
2. Define TypeScript interfaces
3. Build WelcomeScreen as proof-of-concept
4. Implement QuestionCard with scoring
   Ready to proceed with Phase 1 implementation?
