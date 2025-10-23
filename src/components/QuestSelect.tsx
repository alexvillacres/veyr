import { Select } from "@base-ui-components/react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import type { Quest } from "@/db";
import { Check } from "lucide-react";
import QuestTag from "./ui/tag";

interface QuestSelectProps {
  onSelect: (questId: number | undefined) => void;
  selectedQuestId?: number;
  placeholder?: string;
}

export function QuestSelect({
  onSelect,
  selectedQuestId,
  placeholder = "Select a quest...",
}: QuestSelectProps) {
  const quests = useLiveQuery(() =>
    db.quests.where("status").equals("active").sortBy("order"),
  );

  // Create a map of quest id to quest object for easy lookup
  const questMap = new Map<number, Quest & { id: number }>();
  quests?.forEach((quest) => {
    if (quest.id !== undefined) {
      questMap.set(quest.id, quest as Quest & { id: number });
    }
  });

  // Create items mapping for Select.Root (still needs to be Record<number, string>)
  const items = quests?.reduce(
    (acc, quest) => {
      if (quest.id !== undefined) {
        acc[quest.id] = quest.name;
      }
      return acc;
    },
    { 0: "No quest" } as Record<number, string>,
  ) || { 0: "No quest" };

  const handleValueChange = (newValue: number | null) => {
    if (newValue === null || newValue === 0) {
      onSelect(undefined);
    } else {
      onSelect(newValue);
    }
  };

  const selectedValue = selectedQuestId ?? 0;
  const selectedQuest = selectedQuestId ? questMap.get(selectedQuestId) : null;

  return (
    <Select.Root
      items={items}
      value={selectedValue}
      onValueChange={handleValueChange}
    >
      <Select.Trigger className="w-auto">
        <Select.Value>
          {(value: number | null) => {
            if (value !== null && value !== 0 && selectedQuest) {
              return (
                <QuestTag color={selectedQuest.color}>
                  {selectedQuest.name}
                </QuestTag>
              );
            }
            if (value === 0) {
              return (
                <span className="flex flex-row justify-center items-center gap-1 rounded-sm text-xs px-1.5 py-0.5 font-light bg-gray-200 text-gray-600">
                  No quest
                </span>
              );
            }
            return <span className="text-gray-600">{placeholder}</span>;
          }}
        </Select.Value>
      </Select.Trigger>

        <Select.Portal>
          <Select.Positioner 
            alignItemWithTrigger={false} 
            side="right" 
            align="start"
            sideOffset={4}
          >
            <Select.Popup className="w-[280px] max-h-[min(var(--available-height),300px)] overflow-y-auto rounded-md border-[0.5px] border-gray-300 bg-white shadow-lg p-1.5 outline-none z-50 origin-[var(--transform-origin)] transition-[transform,scale,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
            {Object.entries(items).map(([value, label]) => {
              const questId = Number(value);
              const quest = questMap.get(questId);

              return (
                <Select.Item
                  key={value}
                  value={questId}
                  className="px-2 py-1.5 cursor-pointer outline-none select-none flex items-center justify-between rounded-sm data-[highlighted]:bg-gray-100"
                >
                  <Select.ItemText>
                    {questId === 0 ? (
                      <span className="flex flex-row justify-center items-center gap-1 rounded-sm text-xs px-1.5 py-0.5 font-light bg-gray-200 text-gray-600">
                        {label}
                      </span>
                    ) : quest ? (
                      <QuestTag color={quest.color}>
                        {label}
                      </QuestTag>
                    ) : (
                      label
                    )}
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={14} className="ml-2" />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

