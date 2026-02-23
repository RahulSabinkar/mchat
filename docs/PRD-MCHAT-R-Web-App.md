# Product Requirements Document
## M-CHAT-R Web Screening Application

**Version:** 1.0  
**Date:** February 2026  
**Status:** Draft

---

## 1. Executive Summary

A web application that enables parents to complete the Modified Checklist for Autism in Toddlers, Revised with Follow-Up (M-CHAT-R/F) screening tool for their children (ages 16-48 months). The app guides parents through the screening process, administers follow-up questions when needed, and provides evaluation results with appropriate recommendations.

---

## 2. Problem Statement

Parents concerned about their child's development need access to validated screening tools to assess autism likelihood. The M-CHAT-R/F is a well-established, free screening instrument, but it requires proper administration and scoring. A digital web application can:
- Make the screening accessible from any device
- Ensure proper question flow and scoring logic
- Provide immediate, accurate results
- Guide parents on appropriate next steps

---

## 3. Target Users

| User Type | Description |
|-----------|-------------|
| **Primary** | Parents/guardians of children aged 16-48 months who want to screen for autism likelihood |
| **Secondary** | Healthcare providers who may use the tool during well-child visits |

---

## 4. User Stories

### 4.1 Core User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a parent, I want to enter my child's basic information so the screening can be personalized | High |
| US-02 | As a parent, I want to answer the 20 M-CHAT-R questions at my own pace | High |
| US-03 | As a parent, I want to receive clear instructions on how to answer each question | High |
| US-04 | As a parent, I want the app to automatically calculate my screening score | High |
| US-05 | As a parent, I want to receive an immediate evaluation with clear next-step recommendations | High |
| US-06 | As a parent with a moderate score, I want to complete follow-up questions for more accurate results | High |
| US-07 | As a parent, I want to save/export my results to share with my healthcare provider | Medium |
| US-08 | As a parent, I want to save my progress and return later to complete the screening | Medium |
| US-09 | As a returning user, I want to view my previous screening results | Low |

---

## 5. Functional Requirements

### 5.1 Screening Flow

#### Phase 1: Introduction & Child Information
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Display welcome screen explaining the M-CHAT-R purpose and disclaimers | High |
| FR-1.2 | Collect child's name (for personalization in questions) | High |
| FR-1.3 | Collect child's date of birth (to validate age range 16-48 months) | High |
| FR-1.4 | Display warning if child is outside recommended age range but allow continuation | High |
| FR-1.5 | Show copyright notice: © 2009 Robins, Fein, & Barton | High |

#### Phase 2: Initial M-CHAT-R Screening (20 Questions)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Display all 20 M-CHAT-R questions in order (no modification) | High |
| FR-2.2 | Present questions one at a time or all on one page (configurable preference) | Medium |
| FR-2.3 | Require Yes/No answer for each question (no skipped questions) | High |
| FR-2.4 | Personalize questions with child's name (replace "your child" with child's name) | Medium |
| FR-2.5 | Allow user to go back and change previous answers | Medium |
| FR-2.6 | Display progress indicator | Medium |

#### Phase 3: Initial Scoring
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Score items 2, 5, 12: YES = 1 point (elevated risk) | High |
| FR-3.2 | Score all other items (1, 3, 4, 6-11, 13-20): NO = 1 point (elevated risk) | High |
| FR-3.3 | Calculate total score (0-20 range) | High |
| FR-3.4 | Categorize score: LOW (0-2), MODERATE (3-7), HIGH (8-20) | High |

#### Phase 4: Follow-Up Questions (M-CHAT-R/F)
*Only administered for MODERATE scores (3-7)*

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Administer follow-up ONLY for items that scored 1 (elevated risk) in initial screening | High |
| FR-4.2 | Follow flowchart format defined in question data structure | High |
| FR-4.3 | Handle different node types: initial_question, instruction, checklist, decision_logic, followup_question | High |
| FR-4.4 | Support "maybe" responses by asking for clarification (most often yes or no) | High |
| FR-4.5 | Score each follow-up item as 0 or 1 based on parent responses | High |
| FR-4.6 | Allow interviewer judgment for "other" responses (text input with guidance) | Medium |

#### Phase 5: Final Evaluation & Results
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Display final score with risk category | High |
| FR-5.2 | **LOW (0-2):** Show result - no further action unless surveillance indicates risk; rescreen after 2nd birthday if child < 24 months | High |
| FR-5.3 | **MODERATE with Follow-Up score 0-1:** Show result - screen negative; no further action unless surveillance indicates risk | High |
| FR-5.4 | **MODERATE with Follow-Up score ≥2:** Show result - screen positive; refer for diagnostic evaluation and early intervention | High |
| FR-5.5 | **HIGH (8-20):** Show result - screen positive; refer immediately for diagnostic evaluation and early intervention | High |
| FR-5.6 | Display disclaimer that screening does not equal diagnosis | High |
| FR-5.7 | Provide resources: link to www.mchatscreen.com, recommendation to consult healthcare provider | High |

### 5.2 Question Flow Logic

Each question's follow-up uses a flowchart structure:

```
start (initial_question)
    ├── Yes → ask_yes_followup (instruction)
    └── No → ask_no_followup (instruction)
              ↓
        evaluate_behaviors (checklist with 0_examples and 1_examples)
              ↓
        determine_score (decision_logic)
              ├── 0 examples only → score: 0
              ├── 1 examples only → score: 1
              └── both → clarify_frequency (followup_question)
                            ├── Most often 0 → score: 0
                            └── Most often 1 → score: 1
```

### 5.3 Data Persistence
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | Save screening progress locally (localStorage) | Medium |
| FR-6.2 | Generate shareable results (PDF or print-friendly page) | Medium |
| FR-6.3 | Option to email results to self | Low |
| FR-6.4 | Store screening history locally for returning users | Low |

---

## 6. Non-Functional Requirements

### 6.1 Performance
| ID | Requirement |
|----|-------------|
| NFR-1.1 | Page load time < 3 seconds |
| NFR-1.2 | Question transitions < 500ms |
| NFR-1.3 | Score calculation instant (< 100ms) |

### 6.2 Accessibility
| ID | Requirement |
|----|-------------|
| NFR-2.1 | WCAG 2.1 AA compliance |
| NFR-2.2 | Screen reader compatible |
| NFR-2.3 | Keyboard navigation support |
| NFR-2.4 | High contrast mode support |
| NFR-2.5 | Mobile-friendly responsive design |

### 6.3 Privacy & Security
| ID | Requirement |
|----|-------------|
| NFR-3.1 | No server-side storage of personal health information (PHI) by default |
| NFR-3.2 | All data stored locally on user's device |
| NFR-3.3 | Clear privacy policy explaining data handling |
| NFR-3.4 | Option to delete all stored data |

### 6.4 Compatibility
| ID | Requirement |
|----|-------------|
| NFR-4.1 | Support modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions) |
| NFR-4.2 | Responsive design for mobile (iOS Safari, Chrome Android) |
| NFR-4.3 | Graceful degradation for JavaScript disabled (show message) |

---

## 7. Data Models

### 7.1 Screening Session
```typescript
interface ScreeningSession {
  id: string;
  createdAt: Date;
  childInfo: {
    name: string;
    dateOfBirth: Date;
  };
  status: 'in_progress' | 'completed';
  phase: 'intro' | 'initial_questions' | 'follow_up' | 'results';
  initialAnswers: Record<number, boolean>; // question_number -> yes/no
  initialScore: number;
  followUpRequired: boolean;
  followUpAnswers: Record<number, FollowUpResult>;
  followUpScore: number;
  finalResult: 'low' | 'moderate_negative' | 'moderate_positive' | 'high' | null;
}
```

### 7.2 Follow-Up Result
```typescript
interface FollowUpResult {
  questionNumber: number;
  initialAnswer: boolean;
  behaviors: {
    category: '0_examples' | '1_examples';
    items: string[];
    selected: boolean;
  }[];
  frequencyClarification?: '0_examples' | '1_examples';
  finalScore: 0 | 1;
}
```

### 7.3 Question Data Structure
Based on `data/q01.json`:
```typescript
interface QuestionData {
  item_number: number;
  question: string;
  flow: {
    [nodeId: string]: FlowNode;
  };
  metadata: {
    copyright: string;
    version: string;
  };
}

type FlowNode = 
  | { type: 'initial_question'; options: { Yes: string; No: string } }
  | { type: 'instruction'; text: string; next: string }
  | { type: 'checklist'; instruction: string; categories: CategoryMap; next: string }
  | { type: 'decision_logic'; conditions: ConditionMap }
  | { type: 'followup_question'; text: string; options: Record<string, { result_score: 0 | 1 }> };
```

---

## 8. UI/UX Requirements

### 8.1 Design Principles
- **Calm & Supportive:** Use soothing colors; parents may be anxious
- **Clear & Simple:** Easy-to-read text with appropriate font sizes
- **Progressive Disclosure:** Show information as needed, avoid overwhelming
- **Trust-Building:** Display professional design and clear attribution

### 8.2 Screen Flows

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Welcome   │ ──► │ Child Info  │ ──► │  Questions  │
│   Screen    │     │   Form      │     │  (1-20)     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    │
              ┌─────▼─────┐
              │  Initial  │
              │   Score   │
              └─────┬─────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │   LOW   │ │MODERATE │ │  HIGH   │
   │ Result  │ │Follow-Up│ │ Result  │
   └─────────┘ └────┬────┘ └─────────┘
                    │
              ┌─────▼─────┐
              │  Final    │
              │  Result   │
              └───────────┘
```

### 8.3 Key UI Components
| Component | Description |
|-----------|-------------|
| Welcome Screen | Introduction, purpose, disclaimers, "Begin Screening" CTA |
| Child Info Form | Name input, DOB picker with age validation |
| Question Card | Question text, Yes/No buttons, progress bar, back/next navigation |
| Checklist Component | Multi-select checklist with categories (0_examples, 1_examples) |
| Results Page | Score display, risk category, recommendations, resources, share options |

---

## 9. Technical Architecture

### 9.1 Recommended Stack
| Layer | Technology Options |
|-------|-------------------|
| Frontend Framework | React, Vue, or Svelte |
| Styling | Tailwind CSS or styled-components |
| State Management | React Context + useReducer, Zustand, or Vuex |
| Routing | React Router, Vue Router |
| Build Tool | Vite, Next.js, or Nuxt |
| PDF Generation | jsPDF or react-pdf |

### 9.2 Project Structure
```
src/
├── components/
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── ChildInfoScreen.tsx
│   │   ├── QuestionsScreen.tsx
│   │   ├── FollowUpScreen.tsx
│   │   └── ResultsScreen.tsx
│   ├── QuestionCard.tsx
│   ├── ChecklistInput.tsx
│   ├── ProgressBar.tsx
│   └── ScoreDisplay.tsx
├── data/
│   ├── questions/
│   │   ├── q01.json
│   │   ├── q02.json
│   │   └── ...
│   └── scoring-rules.json
├── hooks/
│   ├── useScreening.ts
│   └── useScoring.ts
├── utils/
│   ├── scoring.ts
│   ├── storage.ts
│   └── pdf-generator.ts
├── types/
│   └── index.ts
└── App.tsx
```

---

## 10. Scoring Algorithm

### 10.1 Initial Screening Score

```typescript
function calculateInitialScore(answers: Record<number, boolean>): number {
  // Items where YES indicates elevated risk
  const yesRiskItems = [2, 5, 12];
  // Items where NO indicates elevated risk (all others)
  const noRiskItems = [1, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];
  
  let score = 0;
  
  for (const item of yesRiskItems) {
    if (answers[item] === true) score++;
  }
  
  for (const item of noRiskItems) {
    if (answers[item] === false) score++;
  }
  
  return score;
}

function getRiskCategory(score: number): 'low' | 'moderate' | 'high' {
  if (score <= 2) return 'low';
  if (score <= 7) return 'moderate';
  return 'high';
}
```

### 10.2 Final Result Determination

```typescript
function determineFinalResult(
  initialScore: number,
  followUpScore: number | null
): ScreeningResult {
  if (initialScore <= 2) {
    return {
      category: 'low',
      recommendation: 'No further action required unless surveillance indicates elevated likelihood.',
      rescreen: childAge < 24 // rescreen after 2nd birthday
    };
  }
  
  if (initialScore >= 8) {
    return {
      category: 'high',
      recommendation: 'Refer immediately for diagnostic evaluation and early intervention eligibility.',
      followUpNeeded: false
    };
  }
  
  // Moderate score (3-7)
  if (followUpScore === null) {
    return { category: 'moderate', needsFollowUp: true };
  }
  
  if (followUpScore >= 2) {
    return {
      category: 'moderate_positive',
      recommendation: 'Refer for diagnostic evaluation and early intervention eligibility.'
    };
  }
  
  return {
    category: 'moderate_negative',
    recommendation: 'No further action unless surveillance indicates elevated likelihood. Rescreen at future visits.'
  };
}
```

---

## 11. Content Requirements

### 11.1 Required Disclaimers
1. Screening tool, not diagnostic
2. False positives are common
3. Consult healthcare provider for concerns regardless of score
4. Copyright attribution: © 2009 Diana Robins, Deborah Fein, & Marianne Barton

### 11.2 Resources to Include
- www.mchatscreen.com
- Recommendation to contact pediatrician
- Early intervention program information (configurable by region)

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Completion rate | > 85% of started screenings completed |
| Mobile usage | > 60% of users on mobile devices |
| Results shared/exported | > 40% of completed screenings |
| Page load time | < 3 seconds |
| Accessibility score | WCAG 2.1 AA |

---

## 13. Out of Scope (v1.0)

- User accounts/authentication
- Server-side data storage
- Multi-language support (future consideration)
- Integration with EHR systems
- Provider dashboard
- Reminder notifications

---

## 14. Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Setup | 1 week | Project scaffold, data models, routing |
| Phase 2: Core Flow | 2 weeks | Question screens, basic scoring |
| Phase 3: Follow-Up | 2 weeks | Follow-up question flow, checklist components |
| Phase 4: Results | 1 week | Results page, PDF export |
| Phase 5: Polish | 1 week | Accessibility, responsive design, testing |

**Total Estimated Duration: 7 weeks**

---

## 15. Open Questions

| Question | Status | Decision Needed By |
|----------|--------|-------------------|
| Single-page vs multi-page question display? | Open | Phase 1 |
| Include progress-saving with email? | Open | Phase 2 |
| PDF export or print-optimized page? | Open | Phase 4 |
| Add region-specific resource links? | Open | Phase 4 |

---

## 16. Appendix

### A. Complete Question List
See `docs/M-CHAT-R Document.md` for all 20 questions.

### B. Follow-Up Question Data Format
See `data/q01.json` for example flowchart structure.

### C. References
- Robins, D.L., Fein, D., & Barton, M. (2009). M-CHAT-R/F
- www.mchatscreen.com
- Wieckowski et al. (2023). JAMA Pediatrics systematic review

---

*Document prepared for M-CHAT-R Web Application project*