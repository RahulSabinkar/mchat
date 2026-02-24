# M-CHAT Follow-Up Question Logic Guide

## Overview

This document explains how follow-up questions work in the M-CHAT assessment flow using the refactored JSON schema and Dart 3 sealed classes.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Assessment Flow                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  InitialQuestion ──► Instruction ──► Checklist ──► TransientLogic   │
│        │                  │               │               │          │
│        │                  └───────────────┘               │          │
│        │                                                  │          │
│        └──────────► FollowupQuestion ◄────────────────────┘          │
│                           │                                          │
│                           ▼                                          │
│                    [Score Mutations]                                 │
│                           │                                          │
│                           ▼                                          │
│                    "completed" or next node                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Node Types and Their Roles

### UI Nodes (User-Facing)

| Type | Purpose | Waits for Input? |
|------|---------|------------------|
| `initial_question` | Entry point, presents Yes/No or multiple options | Yes |
| `instruction` | Displays text to user (interviewer guidance) | No |
| `checklist` | Multi-select behavioral examples | Yes |
| `followup_question` | Single-select clarification question | Yes |
| `multiple_choice` | Single-select from multiple options | Yes |

### Transient Nodes (Background Logic)

| Type | Purpose | Waits for Input? |
|------|---------|------------------|
| `transient_logic` | Evaluates conditions, routes flow, mutates state | No |

---

## Follow-Up Question Patterns

### Pattern 1: Binary Branching with Score

The simplest follow-up pattern where the initial answer determines score.

**Example: q06.json**

```json
{
  "start": {
    "type": "initial_question",
    "options": [
      { "label": "Yes", "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "label": "No", "next": "ask_no_followup" }
    ]
  },
  "ask_no_followup": {
    "type": "instruction",
    "text": "If there is something your child wants...",
    "next": "evaluate_behaviors"
  }
}
```

**Flow:**
```
User answers "Yes" → Score 0 → Complete
User answers "No"  → Instruction → Checklist → Logic → Potential followup
```

### Pattern 2: Conditional Follow-Up After Checklist

When checklist results are ambiguous, a follow-up clarifies.

**Example: q01.json**

```json
{
  "evaluate_behaviors": {
    "type": "checklist",
    "categories": [
      { "id": "pass_examples", "items": [...] },
      { "id": "risk_examples", "items": [...] }
    ],
    "next": "determine_score"
  },
  "determine_score": {
    "type": "transient_logic",
    "conditions": [
      { "type": "category_selection", "expression": "only_pass_selected", 
        "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "type": "category_selection", "expression": "only_risk_selected", 
        "actions": [{ "type": "set_score", "value": 1 }], "next": "completed" },
      { "type": "category_selection", "expression": "both_selected", 
        "actions": [], "next": "clarify_frequency" }
    ]
  },
  "clarify_frequency": {
    "type": "followup_question",
    "text": "Which one does he/she do most often?",
    "options": [
      { "label": "Most often is pass example", "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "label": "Most often is risk example", "actions": [{ "type": "set_score", "value": 1 }], "next": "completed" }
    ]
  }
}
```

**Flow:**
```
Checklist with pass_examples + risk_examples
         │
         ▼
  TransientLogic evaluates:
    ├── only pass selected? → Score 0 → Complete
    ├── only risk selected? → Score 1 → Complete
    └── both selected?      → FollowupQuestion → User clarifies → Score → Complete
```

### Pattern 3: Sequential Follow-Up Chain

Multiple follow-ups in sequence, each narrowing down.

**Example: q19.json**

```json
{
  "start": {
    "type": "initial_question",
    "options": [
      { "label": "Yes", "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "label": "No", "next": "ask_strange_noise" }
    ]
  },
  "ask_strange_noise": {
    "type": "followup_question",
    "text": "If your child hears a strange or scary noise, will he/she look at you **before** responding?",
    "options": [
      { "label": "Yes", "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "label": "No", "next": "ask_someone_new" }
    ]
  },
  "ask_someone_new": {
    "type": "followup_question",
    "text": "Does your child **look at you** when someone new approaches?",
    "options": [
      { "label": "Yes", "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "label": "No", "next": "ask_unfamiliar_scary" }
    ]
  },
  "ask_unfamiliar_scary": {
    "type": "followup_question",
    "text": "Does your child **look at you** when he/she is faced with something unfamiliar or a little scary?",
    "options": [
      { "label": "Yes", "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "label": "No", "actions": [{ "type": "set_score", "value": 1 }], "next": "completed" }
    ]
  }
}
```

**Flow:**
```
Initial: "Does child look at you when something new happens?"
    │
    ├── Yes → Score 0 → Complete
    │
    └── No → Followup: "Strange noise?"
                │
                ├── Yes → Score 0 → Complete
                │
                └── No → Followup: "Someone new?"
                            │
                            ├── Yes → Score 0 → Complete
                            │
                            └── No → Followup: "Unfamiliar/scary?"
                                        │
                                        ├── Yes → Score 0 → Complete
                                        └── No → Score 1 → Complete
```

### Pattern 4: Frequency Threshold Follow-Up

Checklist count determines if follow-up is needed.

**Example: q14.json**

```json
{
  "determine_score": {
    "type": "transient_logic",
    "conditions": [
      { "type": "count_threshold", "min": 2, "max": 999, 
        "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "type": "selection_count", "expression": "any_selected", 
        "actions": [], "next": "check_frequency_every_day" },
      { "type": "selection_count", "expression": "none_selected", 
        "actions": [{ "type": "set_score", "value": 1 }], "next": "completed" }
    ]
  },
  "check_frequency_every_day": {
    "type": "followup_question",
    "text": "Does your child look you in the eye every day?",
    "options": [
      { "label": "Yes", "next": "check_frequency_5_times" },
      { "label": "No", "actions": [{ "type": "set_score", "value": 1 }], "next": "completed" }
    ]
  },
  "check_frequency_5_times": {
    "type": "followup_question",
    "text": "On a day when you are together all day, does he/she look you in the eye at least 5 times?",
    "options": [
      { "label": "Yes", "actions": [{ "type": "set_score", "value": 0 }], "next": "completed" },
      { "label": "No", "actions": [{ "type": "set_score", "value": 1 }], "next": "completed" }
    ]
  }
}
```

---

## Dart Implementation

### Processing Follow-Up Questions

```dart
// In your BLoC/Cubit
Future<void> processUserResponse(dynamic response) async {
  final currentState = state;
  
  if (currentState is! AssessmentInProgress) return;
  
  final node = currentState.item.flow[currentState.currentNodeId];
  
  // Exhaustive pattern matching on node type
  final result = switch (node) {
    InitialQuestionNode(:final options) => _handleOptionSelection(
      options: options,
      selectedLabel: response as String,
      currentScore: currentState.score,
    ),
    
    FollowupQuestionNode(:final options) => _handleOptionSelection(
      options: options,
      selectedLabel: response as String,
      currentScore: currentState.score,
    ),
    
    MultipleChoiceNode(:final options) => _handleOptionSelection(
      options: options,
      selectedLabel: response as String,
      currentScore: currentState.score,
    ),
    
    ChecklistNode(:final next) => _handleChecklistSubmission(
      node: node,
      selections: response as Map<String, List<String>>,
      currentState: currentState,
    ),
    
    InstructionNode(:final next) => NavigateToNode(next),
    
    TransientLogicNode(:final conditions) => _evaluateTransientLogic(
      conditions: conditions,
      selections: currentState.selections,
      score: currentState.score,
    ),
  };
  
  // Handle navigation result
  switch (result) {
    case NavigateToNode(:final nodeId):
      emit(currentState.copyWith(currentNodeId: nodeId));
      
    case AssessmentFinished(:final score):
      emit(AssessmentCompleted(
        item: currentState.item,
        finalScore: score,
      ));
  }
}
```

### Handling Option Selection (Follow-Up Questions)

```dart
NavigationResult _handleOptionSelection({
  required List<NodeOption> options,
  required String selectedLabel,
  required int currentScore,
}) {
  // Find selected option using pattern matching
  final selectedOption = options.firstWhere(
    (opt) => opt.label == selectedLabel,
    orElse: () => throw ArgumentError('Invalid option: $selectedLabel'),
  );
  
  // Apply mutations (score changes)
  var newScore = currentScore;
  for (final action in selectedOption.actions) {
    newScore = switch (action.type) {
      MutationType.setScore => action.value as int,
    };
  }
  
  // Determine next step
  return switch (selectedOption.next) {
    null => AssessmentFinished(newScore),
    'completed' => AssessmentFinished(newScore),
    final nodeId => NavigateToNode(nodeId),
  };
}
```

### Evaluating Transient Logic After Checklist

```dart
NavigationResult _evaluateTransientLogic({
  required List<Condition> conditions,
  required Map<String, dynamic> selections,
  required int score,
}) {
  var newScore = score;
  
  // Conditions are evaluated top-to-bottom, first match wins
  for (final condition in conditions) {
    if (_evaluateCondition(condition, selections)) {
      // Apply mutations
      for (final action in condition.actions) {
        newScore = switch (action.type) {
          MutationType.setScore => action.value as int,
        };
      }
      
      // Navigate
      return switch (condition.next) {
        'completed' => AssessmentFinished(newScore),
        final nodeId => NavigateToNode(nodeId),
      };
    }
  }
  
  throw StateError('No condition matched in transient logic');
}

bool _evaluateCondition(Condition condition, Map<String, dynamic> selections) {
  return switch (condition.type) {
    ConditionType.always => true,
    
    ConditionType.selectionCount => switch (condition.expression!) {
      SelectionExpression.anySelected => 
        (selections['selected_count'] as int? ?? 0) > 0,
      SelectionExpression.noneSelected => 
        (selections['selected_count'] as int? ?? 0) == 0,
      SelectionExpression.onlyPassSelected => false,
      SelectionExpression.onlyRiskSelected => false,
      SelectionExpression.bothSelected => false,
    },
    
    ConditionType.categorySelection => switch (condition.expression!) {
      SelectionExpression.onlyPassSelected => 
        (selections['pass_selected'] as bool? ?? false) &&
        !(selections['risk_selected'] as bool? ?? false),
      SelectionExpression.onlyRiskSelected => 
        (selections['risk_selected'] as bool? ?? false) &&
        !(selections['pass_selected'] as bool? ?? false),
      SelectionExpression.bothSelected => 
        (selections['pass_selected'] as bool? ?? false) &&
        (selections['risk_selected'] as bool? ?? false),
      SelectionExpression.anySelected => false,
      SelectionExpression.noneSelected => false,
    },
    
    ConditionType.countThreshold => () {
      final count = selections['selected_count'] as int? ?? 0;
      return count >= condition.min! && count <= condition.max!;
    }(),
    
    ConditionType.semanticEvaluation => 
      selections['semantic_result'] as bool? ?? false,
  };
}
```

### Checklist Submission with Category Tracking

```dart
NavigationResult _handleChecklistSubmission({
  required ChecklistNode node,
  required Map<String, List<String>> selections,
  required AssessmentInProgress currentState,
}) {
  // Calculate selections metadata for transient logic
  final metadata = <String, dynamic>{};
  
  if (node.categories != null) {
    // Categorized checklist (pass/risk examples)
    bool passSelected = false;
    bool riskSelected = false;
    
    for (final category in node.categories!) {
      final selectedInCategory = selections[category.id] ?? [];
      if (selectedInCategory.isNotEmpty) {
        if (category.id == 'pass_examples') passSelected = true;
        if (category.id == 'risk_examples') riskSelected = true;
      }
    }
    
    metadata['pass_selected'] = passSelected;
    metadata['risk_selected'] = riskSelected;
    metadata['both_selected'] = passSelected && riskSelected;
  } else {
    // Flat checklist
    final allSelections = selections['items'] ?? [];
    metadata['selected_count'] = allSelections.length;
    metadata['selected_items'] = allSelections;
  }
  
  // Update state with selections and navigate to next node
  final newState = currentState.copyWith(
    selections: {...currentState.selections, ...metadata},
    currentNodeId: node.next,
  );
  
  emit(newState);
  
  // If next is transient logic, evaluate immediately
  if (currentState.item.flow[node.next] is TransientLogicNode) {
    return _evaluateTransientLogic(
      conditions: (currentState.item.flow[node.next] as TransientLogicNode).conditions,
      selections: metadata,
      score: currentState.score,
    );
  }
  
  return NavigateToNode(node.next);
}
```

---

## State Management with BLoC

### Complete BLoC Implementation

```dart
class AssessmentBloc extends Bloc<AssessmentEvent, AssessmentState> {
  final FlowNavigator _navigator = FlowNavigator();
  
  AssessmentBloc() : super(const AssessmentInitial()) {
    on<StartAssessment>(_onStartAssessment);
    on<SubmitResponse>(_onSubmitResponse);
    on<ProceedFromInstruction>(_onProceedFromInstruction);
  }
  
  void _onStartAssessment(StartAssessment event, Emitter<AssessmentState> emit) {
    emit(AssessmentInProgress(
      item: event.item,
      currentNodeId: 'start',
      score: 0,
      selections: {},
    ));
    
    // Auto-proceed if first node is instruction
    _autoProceedIfNeeded(event.item, emit);
  }
  
  void _onSubmitResponse(SubmitResponse event, Emitter<AssessmentState> emit) {
    final currentState = state;
    if (currentState is! AssessmentInProgress) return;
    
    final result = _navigator.processNode(currentState, event.response);
    
    switch (result) {
      case NavigateToNode(:final nodeId):
        final newState = currentState.copyWith(currentNodeId: nodeId);
        emit(newState);
        _autoProceedIfNeeded(currentState.item, emit);
        
      case AssessmentFinished(:final score):
        emit(AssessmentCompleted(
          item: currentState.item,
          finalScore: score,
        ));
    }
  }
  
  void _onProceedFromInstruction(
    ProceedFromInstruction event, 
    Emitter<AssessmentState> emit,
  ) {
    final currentState = state;
    if (currentState is! AssessmentInProgress) return;
    
    final node = currentState.item.flow[currentState.currentNodeId];
    if (node is! InstructionNode) return;
    
    emit(currentState.copyWith(currentNodeId: node.next));
    _autoProceedIfNeeded(currentState.item, emit);
  }
  
  void _autoProceedIfNeeded(AssessmentItem item, Emitter<AssessmentState> emit) {
    final currentState = state;
    if (currentState is! AssessmentInProgress) return;
    
    final node = item.flow[currentState.currentNodeId];
    
    // Auto-proceed for transient logic nodes
    if (node is TransientLogicNode) {
      final result = _navigator.processNode(currentState, null);
      switch (result) {
        case NavigateToNode(:final nodeId):
          emit(currentState.copyWith(currentNodeId: nodeId));
          _autoProceedIfNeeded(item, emit);
        case AssessmentFinished(:final score):
          emit(AssessmentCompleted(item: item, finalScore: score));
      }
    }
  }
}

// Events
sealed class AssessmentEvent {
  const AssessmentEvent();
}

class StartAssessment extends AssessmentEvent {
  final AssessmentItem item;
  const StartAssessment(this.item);
}

class SubmitResponse extends AssessmentEvent {
  final dynamic response;
  const SubmitResponse(this.response);
}

class ProceedFromInstruction extends AssessmentEvent {
  const ProceedFromInstruction();
}
```

---

## UI Integration

### Widget for Follow-Up Question

```dart
class FollowupQuestionWidget extends StatelessWidget {
  final FollowupQuestionNode node;
  final void Function(String) onResponse;
  
  const FollowupQuestionWidget({
    super.key,
    required this.node,
    required this.onResponse,
  });
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          node.text,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 16),
        ...node.options.map((option) => 
          RadioListTile<String>(
            title: Text(option.label),
            value: option.label,
            groupValue: null,
            onChanged: (value) => onResponse(value!),
          ),
        ),
      ],
    );
  }
}
```

### Routing Widget Based on Node Type

```dart
class AssessmentNodeWidget extends StatelessWidget {
  final FlowNode node;
  final void Function(dynamic) onResponse;
  
  const AssessmentNodeWidget({
    super.key,
    required this.node,
    required this.onResponse,
  });
  
  @override
  Widget build(BuildContext context) {
    return switch (node) {
      InitialQuestionNode(:final options) => InitialQuestionWidget(
        options: options,
        onResponse: onResponse,
      ),
      
      InstructionNode(:final text) => InstructionWidget(text: text),
      
      ChecklistNode(:final instruction, :final items, :final categories, :final options) => 
        ChecklistWidget(
          instruction: instruction,
          items: items,
          categories: categories,
          options: options,
          onSubmit: onResponse,
        ),
      
      FollowupQuestionNode(:final text, :final options) => FollowupQuestionWidget(
        node: node,
        onResponse: onResponse,
      ),
      
      MultipleChoiceNode(:final text, :final options) => MultipleChoiceWidget(
        text: text,
        options: options,
        onResponse: onResponse,
      ),
      
      TransientLogicNode() => const SizedBox.shrink(),
    };
  }
}
```

---

## Best Practices

### 1. Always Handle All Cases

```dart
// ❌ Bad - may miss cases
if (node is FollowupQuestionNode) {
  // handle
}

// ✅ Good - exhaustive
return switch (node) {
  InitialQuestionNode() => ...,
  InstructionNode() => ...,
  ChecklistNode() => ...,
  FollowupQuestionNode() => ...,
  MultipleChoiceNode() => ...,
  TransientLogicNode() => ...,
};
```

### 2. Validate JSON at Load Time

```dart
AssessmentItem loadAssessment(String json) {
  final map = jsonDecode(json) as Map<String, dynamic>;
  final item = AssessmentItem.fromJson(map);
  
  // Validate all routes point to valid nodes or 'completed'
  for (final entry in item.flow.entries) {
    _validateNodeRoutes(entry.key, entry.value, item.flow);
  }
  
  return item;
}

void _validateNodeRoutes(String nodeId, FlowNode node, Map<String, FlowNode> flow) {
  switch (node) {
    case InitialQuestionNode(:final options):
      for (final opt in options) {
        if (opt.next != null && opt.next != 'completed') {
          assert(flow.containsKey(opt.next), 
            'Node $nodeId references missing node: ${opt.next}');
        }
      }
    // ... validate other node types similarly
  }
}
```

### 3. Log Flow Transitions for Debugging

```dart
void _logTransition(String from, String to, int score) {
  debugPrint('AssessmentFlow: $from → $to (score: $score)');
}
```

### 4. Handle Semantic Evaluation Gracefully

```dart
// q18.json has semantic conditions that require interviewer judgment
ConditionType.semanticEvaluation => _promptInterviewerForJudgment(
  condition.description ?? '',
),
```

---

## Summary Table

| Scenario | Trigger | Next Node | Score Action |
|----------|---------|-----------|--------------|
| Direct answer sets score | Option selected | `completed` | Set immediately |
| Answer routes to follow-up | Option selected | Follow-up node ID | None yet |
| Checklist unambiguous | Checklist submit | `completed` | Set by logic |
| Checklist ambiguous | Checklist submit | Follow-up node ID | None yet |
| Follow-up clarifies | Option selected | `completed` | Set immediately |
| Frequency threshold met | Checklist count | `completed` | Set immediately |
| Frequency below threshold | Checklist count | Follow-up chain | Determined by chain |

---

## Appendix: Condition Types Reference

| Type | Expression | Evaluates When |
|------|------------|----------------|
| `always` | - | Always matches (default/catch-all) |
| `selection_count` | `any_selected` | At least one item selected |
| `selection_count` | `none_selected` | No items selected |
| `category_selection` | `only_pass_selected` | Only pass examples checked |
| `category_selection` | `only_risk_selected` | Only risk examples checked |
| `category_selection` | `both_selected` | Both categories have selections |
| `count_threshold` | - | Selection count in [min, max] range |
| `semantic_evaluation` | - | Requires manual interviewer judgment |
