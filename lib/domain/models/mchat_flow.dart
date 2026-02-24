import 'package:freezed_annotation/freezed_annotation.dart';

part 'mchat_flow.freezed.dart';
part 'mchat_flow.g.dart';

sealed class FlowNode {
  String get id;
  const FlowNode({required this.id});
  
  static FlowNode fromJson(Map<String, dynamic> json) {
    json = Map<String, dynamic>.from(json);
    final type = json['type'] as String;
    return switch (type) {
      'initial_question' => InitialQuestionNode.fromJson(json),
      'instruction' => InstructionNode.fromJson(json),
      'checklist' => ChecklistNode.fromJson(json),
      'followup_question' => FollowupQuestionNode.fromJson(json),
      'multiple_choice' => MultipleChoiceNode.fromJson(json),
      'transient_logic' => TransientLogicNode.fromJson(json),
      _ => throw ArgumentError('Unknown node type: $type'),
    };
  }
}

final class InitialQuestionNode extends FlowNode {
  final List<NodeOption> options;
  
  const InitialQuestionNode({
    required super.id,
    required this.options,
  });
  
  factory InitialQuestionNode.fromJson(Map<String, dynamic> json) =>
      InitialQuestionNode(
        id: json['id'] as String,
        options: (json['options'] as List)
            .map((e) => NodeOption.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

final class InstructionNode extends FlowNode {
  final String text;
  final String next;
  
  const InstructionNode({
    required super.id,
    required this.text,
    required this.next,
  });
  
  factory InstructionNode.fromJson(Map<String, dynamic> json) =>
      InstructionNode(
        id: json['id'] as String,
        text: json['text'] as String,
        next: json['next'] as String,
      );
}

final class ChecklistNode extends FlowNode {
  final String instruction;
  final List<ChecklistItem>? items;
  final List<ChecklistCategory>? categories;
  final List<ChecklistOption> options;
  final String next;
  
  const ChecklistNode({
    required super.id,
    required this.instruction,
    this.items,
    this.categories,
    required this.options,
    required this.next,
  });
  
  factory ChecklistNode.fromJson(Map<String, dynamic> json) => ChecklistNode(
        id: json['id'] as String,
        instruction: json['instruction'] as String,
        items: (json['items'] as List<dynamic>?)
            ?.map((e) => ChecklistItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        categories: (json['categories'] as List<dynamic>?)
            ?.map((e) => ChecklistCategory.fromJson(e as Map<String, dynamic>))
            .toList(),
        options: (json['options'] as List)
            .map((e) => ChecklistOption.fromJson(e as Map<String, dynamic>))
            .toList(),
        next: json['next'] as String,
      );
}

final class FollowupQuestionNode extends FlowNode {
  final String text;
  final List<NodeOption> options;
  
  const FollowupQuestionNode({
    required super.id,
    required this.text,
    required this.options,
  });
  
  factory FollowupQuestionNode.fromJson(Map<String, dynamic> json) =>
      FollowupQuestionNode(
        id: json['id'] as String,
        text: json['text'] as String,
        options: (json['options'] as List)
            .map((e) => NodeOption.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

final class MultipleChoiceNode extends FlowNode {
  final String text;
  final List<NodeOption> options;
  
  const MultipleChoiceNode({
    required super.id,
    required this.text,
    required this.options,
  });
  
  factory MultipleChoiceNode.fromJson(Map<String, dynamic> json) =>
      MultipleChoiceNode(
        id: json['id'] as String,
        text: json['text'] as String,
        options: (json['options'] as List)
            .map((e) => NodeOption.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

final class TransientLogicNode extends FlowNode {
  final List<Condition> conditions;
  
  const TransientLogicNode({
    required super.id,
    required this.conditions,
  });
  
  factory TransientLogicNode.fromJson(Map<String, dynamic> json) =>
      TransientLogicNode(
        id: json['id'] as String,
        conditions: (json['conditions'] as List)
            .map((e) => Condition.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

@freezed
sealed class NodeOption with _$NodeOption {
  const factory NodeOption({
    required String label,
    String? next,
    @Default([]) List<Mutation> actions,
  }) = _NodeOption;
  
  factory NodeOption.fromJson(Map<String, dynamic> json) =>
      _$NodeOptionFromJson(json);
}

@freezed
sealed class ChecklistOption with _$ChecklistOption {
  const factory ChecklistOption({required String label}) = _ChecklistOption;
  
  factory ChecklistOption.fromJson(Map<String, dynamic> json) =>
      _$ChecklistOptionFromJson(json);
}

@freezed
sealed class ChecklistItem with _$ChecklistItem {
  const factory ChecklistItem({required String text}) = _ChecklistItem;
  
  factory ChecklistItem.fromJson(Map<String, dynamic> json) =>
      _$ChecklistItemFromJson(json);
}

@freezed
sealed class ChecklistCategory with _$ChecklistCategory {
  const factory ChecklistCategory({
    required String id,
    String? instruction,
    required List<ChecklistItem> items,
  }) = _ChecklistCategory;
  
  factory ChecklistCategory.fromJson(Map<String, dynamic> json) =>
      _$ChecklistCategoryFromJson(json);
}

enum ConditionType {
  always,
  selectionCount,
  categorySelection,
  countThreshold,
  semanticEvaluation,
}

enum SelectionExpression {
  anySelected,
  noneSelected,
  onlyPassSelected,
  onlyRiskSelected,
  bothSelected,
}

@freezed
sealed class Condition with _$Condition {
  const factory Condition({
    required ConditionType type,
    SelectionExpression? expression,
    String? description,
    int? min,
    int? max,
    @Default([]) List<Mutation> actions,
    required String next,
  }) = _Condition;
  
  factory Condition.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type'] as String;
    final conditionType = ConditionType.values.firstWhere(
      (e) => e.name == _toCamelCase(typeStr),
      orElse: () => ConditionType.always,
    );

    SelectionExpression? expr;
    if (json['expression'] != null) {
      final exprStr = json['expression'] as String;
      expr = SelectionExpression.values.firstWhere(
        (e) => e.name == _toCamelCase(exprStr),
        orElse: () => SelectionExpression.anySelected,
      );
    }

    return Condition(
      type: conditionType,
      expression: expr,
      description: json['description'] as String?,
      min: json['min'] as int?,
      max: json['max'] as int?,
      actions: (json['actions'] as List<dynamic>?)
              ?.map((e) => Mutation.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      next: json['next'] as String,
    );
  }
  
  static String _toCamelCase(String input) {
    final parts = input.split('_');
    return parts.first + parts.skip(1).map((e) => e.capitalize()).join();
  }
}

enum MutationType {
  setScore,
}

@freezed
sealed class Mutation with _$Mutation {
  const factory Mutation({
    required MutationType type,
    dynamic value,
  }) = _Mutation;
  
  factory Mutation.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type'] as String;
    final mutationType = MutationType.values.firstWhere(
      (e) => e.name == _toCamelCase(typeStr),
      orElse: () => MutationType.setScore,
    );
    return Mutation(type: mutationType, value: json['value']);
  }
  
  static String _toCamelCase(String input) {
    final parts = input.split('_');
    return parts.first + parts.skip(1).map((e) => e.capitalize()).join();
  }
}

@freezed
sealed class AssessmentItem with _$AssessmentItem {
  const factory AssessmentItem({
    required int itemNumber,
    required String question,
    required Map<String, FlowNode> flow,
    required Metadata metadata,
  }) = _AssessmentItem;
  
  factory AssessmentItem.fromJson(Map<String, dynamic> json) {
    final flowMap = <String, FlowNode>{};
    final flowJson = json['flow'] as Map<String, dynamic>;

    for (final entry in flowJson.entries) {
      final nodeJson = Map<String, dynamic>.from(entry.value as Map);
      nodeJson['id'] = entry.key;
      flowMap[entry.key] = FlowNode.fromJson(nodeJson);
    }

    return AssessmentItem(
      itemNumber: json['item_number'] as int,
      question: json['question'] as String,
      flow: flowMap,
      metadata: Metadata.fromJson(json['metadata'] as Map<String, dynamic>),
    );
  }
}

@freezed
sealed class Metadata with _$Metadata {
  const factory Metadata({
    required String copyright,
    required String version,
  }) = _Metadata;
  
  factory Metadata.fromJson(Map<String, dynamic> json) => _$MetadataFromJson(json);
}

extension StringCapitalization on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
