import { Select } from "@base-ui-components/react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import type { Goal } from "@/db";
import type { GoalColorKey } from "@/constants/colors";
import { Check } from "lucide-react";
import GoalTag from "./ui/tag";

interface GoalSelectProps {
  onSelect: (goalId: number | undefined) => void;
  selectedGoalId?: number;
  placeholder?: string;
}

export function GoalSelect({
  onSelect,
  selectedGoalId,
  placeholder = "Select a goal...",
}: GoalSelectProps) {
  const goals = useLiveQuery(() =>
    db.goals.where("status").equals("active").sortBy("order"),
  );

  // Create a map of goal id to goal object for easy lookup
  const goalMap = new Map<number, Goal & { id: number }>();
  goals?.forEach((goal) => {
    if (goal.id !== undefined) {
      goalMap.set(goal.id, goal as Goal & { id: number });
    }
  });

  // Create items mapping for Select.Root (still needs to be Record<number, string>)
  const items = goals?.reduce(
    (acc, goal) => {
      if (goal.id !== undefined) {
        acc[goal.id] = goal.name;
      }
      return acc;
    },
    { 0: "No goal" } as Record<number, string>,
  ) || { 0: "No goal" };

  const handleValueChange = (newValue: number | null) => {
    if (newValue === null || newValue === 0) {
      onSelect(undefined);
    } else {
      onSelect(newValue);
    }
  };

  const selectedValue = selectedGoalId ?? 0;
  const selectedGoal = selectedGoalId ? goalMap.get(selectedGoalId) : null;

  return (
    <Select.Root
      items={items}
      value={selectedValue}
      onValueChange={handleValueChange}
    >
      <Select.Trigger className="w-auto">
        <Select.Value>
          {(value: number | null) => {
            if (value !== null && value !== 0 && selectedGoal) {
              return (
                <GoalTag color={selectedGoal.color as GoalColorKey}>
                  {selectedGoal.name}
                </GoalTag>
              );
            }
            if (value === 0) {
              return (
                <span className="flex flex-row justify-center items-center gap-1 rounded-sm text-xs px-1.5 py-0.5 font-light bg-gray-200 text-gray-600">
                  No goal
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
              const goalId = Number(value);
              const goal = goalMap.get(goalId);

              return (
                <Select.Item
                  key={value}
                  value={goalId}
                  className="px-2 py-1.5 cursor-pointer outline-none select-none flex items-center justify-between rounded-sm data-[highlighted]:bg-gray-100"
                >
                  <Select.ItemText>
                    {goalId === 0 ? (
                      <span className="flex flex-row justify-center items-center gap-1 rounded-sm text-xs px-1.5 py-0.5 font-light bg-gray-200 text-gray-600">
                        {label}
                      </span>
                    ) : goal ? (
                      <GoalTag color={goal.color as GoalColorKey}>
                        {label}
                      </GoalTag>
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
