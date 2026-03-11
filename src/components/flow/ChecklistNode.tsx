import { useState, useEffect } from 'react';
import type { ChecklistNode } from '@/types';
import type { FlowContext } from '@/utils/flow-engine';
import { personalizeText } from '@/utils/flow-engine';
import { formatBoldText } from '@/utils/text-helpers';

interface ChecklistNodeComponentProps {
  node: ChecklistNode;
  context: FlowContext;
  onNavigateWithItems: (nodeId: string, key: string, items: string[]) => void;
}

export function ChecklistNodeComponent({
  node,
  context,
  onNavigateWithItems,
}: ChecklistNodeComponentProps) {
  const { childName } = context;
  const currentNodeId = context.state.currentNodeId;
  const initialChecked = context.state.checkedItems[currentNodeId] || [];
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(initialChecked));

  useEffect(() => {
    setCheckedItems(new Set(context.state.checkedItems[currentNodeId] || []));
  }, [currentNodeId, context.state.checkedItems]);

  const toggleItem = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  const handleContinue = () => {
    const itemsArray = Array.from(checkedItems);
    const nextNodeId = node.next || 'completed';
    onNavigateWithItems(nextNodeId, currentNodeId, itemsArray);
  };

  const categories = node.categories;
  const hasCategories = categories && categories.length > 0;
  const simpleItems = node.items || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
          Checklist
        </span>
        {node.instruction && (
          <p className="text-lg text-slate-900 leading-relaxed">
            {personalizeText(node.instruction, childName)}
          </p>
        )}
      </div>

      {hasCategories ? (
        <div className="space-y-6">
          {categories!.map((category) => {
            const items = category.items;
            const categoryInstruction = category.instruction;
            const categoryLabel = category.id === 'pass_examples' ? 'Pass Examples' : 
                                  category.id === 'risk_examples' ? 'Risk Examples' : category.id;

            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    categoryLabel.includes('Pass') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {categoryLabel}
                  </span>
                </div>
                {categoryInstruction && (
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {personalizeText(categoryInstruction, childName)}
                  </p>
                )}
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems.has(item.text)}
                        onChange={() => toggleItem(item.text)}
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-slate-700 leading-relaxed">
                        {personalizeText(item.text, childName)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {simpleItems.map((item, idx) => (
            <label
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedItems.has(item.text)}
                onChange={() => toggleItem(item.text)}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-slate-700 leading-relaxed">
                {formatBoldText(personalizeText(item.text, childName))}
              </span>
            </label>
          ))}
        </div>
      )}

      {node.options && (
        <p className="text-sm text-slate-500 italic">
          Select all that apply, then click Continue
        </p>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={handleContinue}
          className="py-3 px-8 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
