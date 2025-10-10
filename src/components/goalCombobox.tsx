import { useState, useMemo, useRef } from "react";
import { Combobox, Field, Dialog } from "@base-ui-components/react";
import { useGoals } from "@/hooks/useGoals";
import { Plus } from "lucide-react";
import type { Goal } from "@/db";
import { ColorPicker } from "./colorPicker";
import { DEFAULT_GOAL_COLOR, type GoalColorKey } from "@/constants/colors";

interface GoalOption extends Partial<Goal> {
  isCreate?: boolean;
  createLabel?: string;
}

interface GoalComboboxProps {
  value?: number;
  onChange: (goalId: number | undefined) => void;
  label?: string;
  placeholder?: string;
}

export function GoalCombobox({
  value,
  onChange,
  label = "Goal (Optional)",
  placeholder = "Select or create a goal...",
}: GoalComboboxProps) {
  const { goals, addGoal } = useGoals();
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [selectedColor, setSelectedColor] = useState<GoalColorKey>(DEFAULT_GOAL_COLOR);
  const createInputRef = useRef<HTMLInputElement>(null);

  // Find the selected goal
  const selectedGoal = goals.find((g) => g.id === value);

  // Filter and prepare items
  const items = useMemo(() => {
    const trimmed = searchValue.trim();
    const lowered = trimmed.toLowerCase();

    // Filter existing goals
    const filtered = searchValue
      ? goals.filter((goal) => goal.name.toLowerCase().includes(lowered))
      : goals;

    // Check if we should show create option
    const exactMatch = goals.some(
      (goal) => goal.name.toLowerCase() === lowered,
    );

    const result: GoalOption[] = [{ id: 0, name: "No goal" }, ...filtered];

    // Add create option if there's search text and no exact match
    if (trimmed && !exactMatch) {
      result.push({
        isCreate: true,
        createLabel: trimmed,
        name: `Create "${trimmed}"`,
      });
    }

    return result;
  }, [goals, searchValue]);

  const handleValueChange = async (newValue: GoalOption | null) => {
    console.log("handleValueChange called with:", newValue);

    if (!newValue) {
      onChange(undefined);
      setSearchValue("");
      setOpen(false);
      return;
    }

    // Handle "No goal" selection
    if (newValue.id === 0 && newValue.name === "No goal") {
      onChange(undefined);
      setSearchValue("");
      setOpen(false);
      return;
    }

    // Handle create action - show dialog
    if (newValue.isCreate && newValue.createLabel) {
      console.log("Opening create dialog for:", newValue.createLabel);
      setNewGoalName(newValue.createLabel);
      setSelectedColor(DEFAULT_GOAL_COLOR);
      setShowCreateDialog(true);
      setOpen(false);
      return;
    }

    // Handle regular selection
    console.log("Selecting existing goal:", newValue.id);
    onChange(newValue.id);
    setSearchValue("");
    setOpen(false);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newGoalName.trim();
    if (!trimmedName) return;

    console.log(
      "Creating new goal:",
      trimmedName,
      "with color:",
      selectedColor,
    );
    try {
      const newGoalId = await addGoal(trimmedName, selectedColor);
      console.log("Created goal with ID:", newGoalId);
      onChange(Number(newGoalId));
      setShowCreateDialog(false);
      setNewGoalName("");
      setSearchValue("");
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  return (
    <>
      <Field.Root className="flex flex-col items-start gap-1 px-3">
        {label && (
          <Field.Label className="text-xs text-gray-925">{label}</Field.Label>
        )}
        <Combobox.Root
          items={items}
          open={open}
          onOpenChange={setOpen}
          value={selectedGoal || null}
          onValueChange={handleValueChange}
          inputValue={searchValue}
          onInputValueChange={setSearchValue}
          itemToStringLabel={(item: GoalOption) => item.name || ""}
        >
          <div className="relative w-full">
            <Combobox.Input
              placeholder={placeholder}
              className="h-10 w-full rounded-md border-[0.5px] border-gray-300 pl-3.5 pr-8 text-sm font-light text-gray-950 placeholder-gray-600 focus:outline focus:-outline-offset-1 focus:outline-blue-800 bg-white"
            />
          </div>

          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),300px)] overflow-y-auto rounded-md border-[0.5px] border-gray-300 bg-white shadow-lg p-1 outline-none z-50 origin-[var(--transform-origin)] transition-[transform,scale,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
                <Combobox.Empty className="px-4 py-2 text-sm text-gray-500 empty:m-0 empty:p-0">
                  No goals found
                </Combobox.Empty>
                <Combobox.List>
                  {(item: GoalOption) => (
                    <Combobox.Item
                      key={
                        item.isCreate
                          ? `create-${item.createLabel}`
                          : (item.id ?? "none")
                      }
                      value={item}
                      className={`px-3 py-2 text-sm cursor-pointer outline-none select-none flex items-center gap-2 rounded-sm placeholder-gray-600 data-[highlighted]:bg-gray-200/50 data-[selected]:bg-blue-50 data-[selected]:text-blue-900 ${
                        item.isCreate ? "text-gray-950" : ""
                      }`}
                    >
                      {item.isCreate ? (
                        <>
                          <Plus size={14} />
                          <span>{item.name}</span>
                        </>
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </Field.Root>

      {/* Create Goal Dialog */}
      <Dialog.Root open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-2rem] w-[480px] max-w-[calc(100vw-3rem)] rounded-lg bg-white p-6 text-gray-900 outline-1 outline-gray-200 transition-all data-[starting-style]:opacity-0 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:scale-90"
            initialFocus={createInputRef}
          >
            <Dialog.Title className="-mt-1.5 mb-1 text-lg leading-7 font-medium">
              Create New Goal
            </Dialog.Title>
            <Dialog.Description className="mb-4 text-sm text-gray-600">
              Choose a name and color for your goal.
            </Dialog.Description>
            <form onSubmit={handleCreateGoal} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-925">Goal Name</label>
                <input
                  ref={createInputRef}
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. Launch Feature"
                  className="h-10 w-full rounded-md border-[0.5px] border-gray-300 px-3.5 text-sm font-light text-gray-900 focus:outline focus:-outline-offset-1 focus:outline-blue-800 bg-white"
                  required
                />
              </div>

              <ColorPicker value={selectedColor} onChange={setSelectedColor} />

              <div className="flex justify-end gap-2 mt-2">
                <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-900 px-3.5 text-sm text-gray-50 select-none hover:bg-gray-800 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-800"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
