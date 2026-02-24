import 'package:mchat/domain/models/mchat_flow.dart';

sealed class AssessmentState {
  const AssessmentState();
}

final class AssessmentInitial extends AssessmentState {
  const AssessmentInitial();
}

final class AssessmentInProgress extends AssessmentState {
  final AssessmentItem item;
  final String currentNodeId;
  final int score;
  final Map<String, dynamic> selections;
  final String? currentInput;

  const AssessmentInProgress({
    required this.item,
    required this.currentNodeId,
    this.score = 0,
    this.selections = const {},
    this.currentInput,
  });

  AssessmentInProgress copyWith({
    AssessmentItem? item,
    String? currentNodeId,
    int? score,
    Map<String, dynamic>? selections,
    String? currentInput,
  }) {
    return AssessmentInProgress(
      item: item ?? this.item,
      currentNodeId: currentNodeId ?? this.currentNodeId,
      score: score ?? this.score,
      selections: selections ?? this.selections,
      currentInput: currentInput,
    );
  }
}

final class AssessmentCompleted extends AssessmentState {
  final AssessmentItem item;
  final int finalScore;

  const AssessmentCompleted({
    required this.item,
    required this.finalScore,
  });
}

sealed class NavigationResult {
  const NavigationResult();
}

final class NavigateToNode extends NavigationResult {
  final String nodeId;
  const NavigateToNode(this.nodeId);
}

final class AssessmentFinished extends NavigationResult {
  final int score;
  const AssessmentFinished(this.score);
}

class FlowNavigator {
  NavigationResult processNode(
    AssessmentInProgress state,
    dynamic userResponse,
  ) {
    final node = state.item.flow[state.currentNodeId];
    
    if (node == null) {
      throw StateError('Node not found: ${state.currentNodeId}');
    }

    return switch (node) {
      InitialQuestionNode(:final options) => _processOptions(
          options,
          userResponse as String,
          state.score,
        ),
      InstructionNode(:final next) => NavigateToNode(next),
      ChecklistNode(:final options, :final next) => _processChecklist(
          node,
          userResponse as Map<String, List<String>>,
          state.score,
        ),
      FollowupQuestionNode(:final options) => _processOptions(
          options,
          userResponse as String,
          state.score,
        ),
      MultipleChoiceNode(:final options) => _processOptions(
          options,
          userResponse as String,
          state.score,
        ),
      TransientLogicNode(:final conditions) => _processTransientLogic(
          conditions,
          state.selections,
          state.score,
        ),
    };
  }

  NavigationResult _processOptions(
    List<NodeOption> options,
    String selectedLabel,
    int currentScore,
  ) {
    final selectedOption = options.firstWhere(
      (opt) => opt.label == selectedLabel,
      orElse: () => throw ArgumentError('Invalid option: $selectedLabel'),
    );

    var newScore = currentScore;
    for (final action in selectedOption.actions) {
      if (action.type == MutationType.setScore) {
        newScore = action.value as int;
      }
    }

    if (selectedOption.next != null) {
      return NavigateToNode(selectedOption.next!);
    }
    return AssessmentFinished(newScore);
  }

  NavigationResult _processChecklist(
    ChecklistNode node,
    Map<String, List<String>> selections,
    int currentScore,
  ) {
    return NavigateToNode(node.next);
  }

  NavigationResult _processTransientLogic(
    List<Condition> conditions,
    Map<String, dynamic> selections,
    int currentScore,
  ) {
    var newScore = currentScore;
    
    for (final condition in conditions) {
      if (_evaluateCondition(condition, selections)) {
        for (final action in condition.actions) {
          if (action.type == MutationType.setScore) {
            newScore = action.value as int;
          }
        }
        
        if (condition.next == 'completed') {
          return AssessmentFinished(newScore);
        }
        return NavigateToNode(condition.next);
      }
    }
    
    throw StateError('No condition matched in transient logic node');
  }

  bool _evaluateCondition(Condition condition, Map<String, dynamic> selections) {
    return switch (condition.type) {
      ConditionType.always => true,
      ConditionType.selectionCount => _evaluateSelectionCount(
          condition.expression!,
          selections,
        ),
      ConditionType.categorySelection => _evaluateCategorySelection(
          condition.expression!,
          selections,
        ),
      ConditionType.countThreshold => _evaluateCountThreshold(
          condition.min!,
          condition.max!,
          selections,
        ),
      ConditionType.semanticEvaluation => _evaluateSemantic(
          condition.expression?.name ?? '',
          selections,
        ),
    };
  }

  bool _evaluateSelectionCount(
    SelectionExpression expression,
    Map<String, dynamic> selections,
  ) {
    final selectedItems = selections['selected_items'] as List<String>? ?? [];
    return switch (expression) {
      SelectionExpression.anySelected => selectedItems.isNotEmpty,
      SelectionExpression.noneSelected => selectedItems.isEmpty,
      SelectionExpression.onlyPassSelected ||
      SelectionExpression.onlyRiskSelected ||
      SelectionExpression.bothSelected => false,
    };
  }

  bool _evaluateCategorySelection(
    SelectionExpression expression,
    Map<String, dynamic> selections,
  ) {
    final passSelected = selections['pass_selected'] as bool? ?? false;
    final riskSelected = selections['risk_selected'] as bool? ?? false;
    
    return switch (expression) {
      SelectionExpression.onlyPassSelected => passSelected && !riskSelected,
      SelectionExpression.onlyRiskSelected => riskSelected && !passSelected,
      SelectionExpression.bothSelected => passSelected && riskSelected,
      SelectionExpression.anySelected ||
      SelectionExpression.noneSelected => false,
    };
  }

  bool _evaluateCountThreshold(
    int min,
    int max,
    Map<String, dynamic> selections,
  ) {
    final count = selections['selection_count'] as int? ?? 0;
    return count >= min && count <= max;
  }

  bool _evaluateSemantic(String expression, Map<String, dynamic> selections) {
    final semanticResult = selections['semantic_result'] as bool?;
    return semanticResult ?? false;
  }
}

String nodeTypeDisplayName(FlowNode node) {
  return switch (node) {
    InitialQuestionNode() => 'Initial Question',
    InstructionNode() => 'Instruction',
    ChecklistNode() => 'Checklist',
    FollowupQuestionNode() => 'Follow-up Question',
    MultipleChoiceNode() => 'Multiple Choice',
    TransientLogicNode() => 'Logic (Hidden)',
  };
}

bool isUserFacingNode(FlowNode node) {
  return switch (node) {
    InitialQuestionNode() => true,
    InstructionNode() => true,
    ChecklistNode() => true,
    FollowupQuestionNode() => true,
    MultipleChoiceNode() => true,
    TransientLogicNode() => false,
  };
}
