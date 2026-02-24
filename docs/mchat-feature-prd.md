# M-CHAT Assessment Feature - Product Requirements Document

## Document Information

| Field | Value |
|-------|-------|
| Feature Name | M-CHAT Assessment Flow |
| Version | 1.0 |
| Status | Draft |
| Last Updated | February 2026 |

---

## Executive Summary

The M-CHAT (Modified Checklist for Autism in Toddlers) is a validated screening tool used to identify children who may be at risk for autism spectrum disorder. This feature integrates the M-CHAT assessment into the Mimi app, enabling parents to complete the assessment through a guided, conversational interview-style flow.

The assessment consists of 20 items, each with branching follow-up questions. The interviewer (parent) is guided through behavioral observations about their child, with the app handling all scoring logic automatically.

---

## Goals

### Primary Goals
1. Guide parents through all 20 M-CHAT questions with appropriate follow-ups
2. Accurately calculate risk score based on standardized M-CHAT scoring rules
3. Present results with appropriate context and next steps

### Secondary Goals
1. Reduce assessment abandonment through clear, simple UI
2. Ensure all required follow-up questions are asked when needed
3. Maintain clinical accuracy per M-CHAT standards

---

## Assumptions & Prerequisites

| Prerequisite | Details |
|--------------|---------|
| Child Profile | Already created; child's name and DOB are available |
| User Context | Parent/guardian is logged in and has selected a child |
| Data Storage | Assessment results will be stored linked to child profile |
| Time Estimate | Full assessment takes approximately 10-15 minutes |

---

## User Journey Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           M-CHAT FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│   │  Intro   │───►│ Question │───►│Question  │───►│ Results  │         │
│   │  Screen  │    │   1-20   │    │ Complete │    │  Screen  │         │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘         │
│                         │                                                │
│                         ▼                                                │
│                  ┌─────────────┐                                        │
│                  │  Follow-up  │                                        │
│                  │  Questions  │                                        │
│                  └─────────────┘                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Screen-by-Screen Breakdown

### Screen 1: Assessment Introduction

**Purpose:** Prepare the parent for the assessment and set expectations.

**UI Elements:**
- Title: "M-CHAT Assessment"
- Subtitle: "A screening tool for autism risk in toddlers"
- Time estimate badge: "10-15 minutes"
- Brief description of what to expect
- Child's name displayed (personalization)
- "Start Assessment" button (primary action)

**Content:**
```
This assessment asks about your child's behavior and development. 
There are 20 main questions with possible follow-up questions.

Answer based on your child's typical behavior, not rare occasions.
If you're unsure, we'll help you think through specific examples.

You're assessing: [Child's Name]
```

**Behavior:**
- Tapping "Start Assessment" navigates to Question 1
- Store start timestamp for analytics

---

### Screen 2: Question Flow (Items 1-20)

**Purpose:** Present each M-CHAT question and collect responses.

**Question Types:**

| Type | Description | User Action |
|------|-------------|-------------|
| Yes/No Question | Initial binary question | Tap Yes or No |
| Instruction | Interviewer guidance text | Tap "Continue" |
| Behavioral Checklist | Select applicable behaviors | Select all that apply, tap "Continue" |
| Follow-up Question | Clarification based on previous answer | Select one option |
| Multiple Choice | Select from multiple options | Select one option |

**Layout Elements:**
- Progress indicator (Question X of 20)
- Question text
- Response area (varies by question type)
- "Back" button (allows reviewing previous questions)
- Optional: "Save & Exit" to pause assessment

**Question Flow Logic:**

1. **Initial Question (Yes/No)**
   - If answer resolves score → Next main question
   - If answer needs clarification → Show instruction or follow-up

2. **Instruction Screen**
   - Display guidance text for interviewer
   - Auto-advance or "Continue" button

3. **Checklist Screen**
   - Show behavioral examples grouped by category (if applicable)
   - Allow multiple selections
   - On submit → Evaluate internally → Show follow-up if needed OR proceed

4. **Follow-up Question**
   - Single-select options
   - Always resolves to score → Next main question

**Special Cases:**

| Question | Special Handling |
|----------|-----------------|
| Q2 | Ends with hearing test follow-up (not scored) |
| Q7 | Note about connection to Q6 |
| Q18 | Includes semantic evaluation (interviewer judgment) |

---

### Screen 3: Progress & Pause Handling

**Purpose:** Allow users to exit and resume assessment.

**Resume Behavior:**
- Assessment state is saved after each response
- When returning, show "Resume Assessment" option on intro screen
- Progress is preserved: current question, score, selections

**Save Confirmation:**
```
Your progress has been saved.
Resume anytime from the Assessments tab.
```

---

### Screen 4: Results Screen

**Purpose:** Display assessment outcome with score and interpretation.

**Score Calculation:**
- Total score is sum of all 20 item scores (0 or 1 each)
- Maximum possible score: 20
- Lower score = lower risk; Higher score = higher risk

**Risk Thresholds:**

| Total Score | Risk Level | Recommendation |
|-------------|------------|----------------|
| 0-2 | Low Risk | Continue monitoring at regular checkups |
| 3-7 | Moderate Risk | Follow-up screening recommended |
| 8-20 | High Risk | Evaluation by specialist recommended |

**UI Elements:**
- Score display: "X out of 20"
- Risk level indicator (color-coded)
- Plain-language explanation
- Recommendation text
- "View Detailed Results" expandable section
- "Share with Healthcare Provider" option
- "Done" button

**Results Content:**

**Low Risk (0-2):**
```
Your child's screening result: LOW RISK

Score: X/20

Your child's responses suggest a low risk for autism spectrum 
disorder. Continue monitoring your child's development at 
regular pediatric checkups.

If you have concerns about your child's development, discuss 
them with your healthcare provider regardless of this result.
```

**Moderate Risk (3-7):**
```
Your child's screening result: MODERATE RISK

Score: X/20

Some responses indicate behaviors that may warrant further 
evaluation. We recommend scheduling a follow-up screening 
with your child's healthcare provider.

Early intervention can make a significant difference. Don't 
wait—if you have concerns, reach out to your pediatrician.
```

**High Risk (8-20):**
```
Your child's screening result: HIGH RISK

Score: X/20

Several responses indicate behaviors associated with autism 
spectrum disorder. We strongly recommend scheduling a 
comprehensive evaluation with a developmental specialist.

Early intervention is important. Your pediatrician can 
provide referrals to specialists in your area.
```

---

### Screen 5: Detailed Results (Optional Expansion)

**Purpose:** Show breakdown of responses for healthcare provider.

**Content:**
- Each question with final score indicator
- Summary of key behavioral markers
- Date and time of assessment
- Export/Print option (PDF generation)

---

## Business Rules

### Scoring Rules

1. **Each item scores 0 or 1**
   - 0 = Pass (behavior indicates typical development)
   - 1 = Fail (behavior indicates possible concern)

2. **Score is final when:**
   - User completes all 20 items
   - User answers a follow-up question

3. **Score is NOT calculated until completion**
   - Do not show running total to user
   - Internal tracking only

### Navigation Rules

1. **Forward Navigation**
   - Always proceed based on current response
   - System determines if follow-up is needed

2. **Backward Navigation**
   - User can go back to review previous questions
   - Changing an answer may reset subsequent questions
   - Warn user: "Going back will clear your responses for this question and any follow-ups. Continue?"

3. **Exit & Resume**
   - User can exit at any time
   - Progress is saved automatically
   - Resume from last completed question

### Data Rules

1. **Assessment Completion**
   - Mark as "Complete" only when all 20 items are scored
   - Store: start time, end time, all responses, final score

2. **Historical Assessments**
   - Allow multiple assessments per child over time
   - Show history in child's profile

3. **Privacy**
   - Assessment data is stored securely
   - Parent controls sharing with healthcare providers

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| App crashes mid-assessment | Resume from last saved state on relaunch |
| Network lost | Continue offline; sync when reconnected |
| User force-closes app | Save state on each response; resume available |
| User changes answer after follow-up | Reset to main question, clear follow-up response |
| Assessment started but never completed | Show as "In Progress" with option to resume or restart |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Assessment completion rate | > 80% |
| Average completion time | 10-15 minutes |
| User satisfaction (post-assessment survey) | > 4.0/5.0 |
| Results shared with provider | > 30% |
| Follow-up action taken (survey) | > 60% |

---

## Non-Goals (Out of Scope)

| Item | Reason |
|------|--------|
| Automated specialist referral | Requires integration with external systems |
| Video-based observation | Beyond scope of text-based M-CHAT |
| Multi-language support | Future phase |
| Custom questionnaires | M-CHAT is standardized |
| Real-time pediatrician chat | Separate feature |

---

## Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| JSON question files | Data Team | Available |
| Score threshold guidelines | Clinical Team | Defined |
| Export/PDF format | Design Team | TBD |
| Backend storage API | Backend Team | In Progress |

---

## Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Development | 2 weeks | Core flow implemented |
| QA Testing | 1 week | Edge cases validated |
| Beta Release | 1 week | Internal testing |
| Production Release | - | Rollout to users |

---

## Appendix A: Question Flow Diagram

```
START
  │
  ▼
┌─────────────────┐
│ Initial Question│
│   (Yes/No)      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
  Yes        No
    │         │
    ▼         ▼
┌───────┐ ┌───────────┐
│ Score │ │Instruction│
│ or    │ │ or        │
│Follow │ │Follow-up  │
│Next   │ └─────┬─────┘
└───┬───┘       │
    │           ▼
    │    ┌─────────────┐
    │    │  Checklist  │
    │    └──────┬──────┘
    │           │
    │           ▼
    │    ┌─────────────┐
    │    │ Transient   │
    │    │ Logic       │
    │    └──────┬──────┘
    │           │
    │      ┌────┴────┐
    │      ▼         ▼
    │   Score    Follow-up
    │      │         │
    │      │         ▼
    │      │      Score
    │      │         │
    └──────┴─────────┘
           │
           ▼
      NEXT QUESTION
      (Repeat 20x)
           │
           ▼
      RESULTS SCREEN
```

---

## Appendix B: UI Component Summary

| Screen | Component | Type |
|--------|-----------|------|
| Intro | Title | Text |
| Intro | Description | Text |
| Intro | Start Button | Primary Button |
| Question | Progress Bar | Progress Indicator |
| Question | Question Text | Text |
| Question | Yes/No Buttons | Toggle Buttons |
| Question | Checklist Items | Multi-select List |
| Question | Follow-up Options | Radio List |
| Question | Continue Button | Primary Button |
| Question | Back Button | Text Button |
| Results | Score Display | Text |
| Results | Risk Badge | Badge |
| Results | Recommendation | Card |
| Results | Share Button | Secondary Button |
| Results | Done Button | Primary Button |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| M-CHAT | Modified Checklist for Autism in Toddlers, a standardized screening tool |
| Follow-up Question | Additional question triggered by initial response to clarify behavior |
| Risk Score | Sum of failed items (0-20), indicating potential autism risk |
| Transient Logic | Internal evaluation that determines next step without user input |
| Behavioral Checklist | List of specific behaviors for parent to confirm or deny |
