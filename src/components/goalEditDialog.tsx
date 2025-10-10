import { useState } from "react";
import { Dialog, Field, Form } from "@base-ui-components/react";
import { Trash2 } from "lucide-react";
import z from "zod";
import { useGoals } from "@/hooks/useGoals";
import { type Goal } from "@/db";
import { ColorPicker } from "./colorPicker";
import { DEFAULT_GOAL_COLOR, type GoalColorKey } from "@/constants/colors";

const schema = z.object({
  name: z.string().min(1, "Goal name is required"),
});

interface GoalEditDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalEditDialog({
  goal,
  open,
  onOpenChange,
}: GoalEditDialogProps) {
  const [errors, setErrors] = useState({});
  const [selectedColor, setSelectedColor] = useState<GoalColorKey>(
    (goal.color as GoalColorKey) || DEFAULT_GOAL_COLOR
  );
  const { updateGoal, deleteGoal } = useGoals();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitForm(e);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawData = Object.fromEntries(formData as any);
    const result = schema.safeParse(rawData);

    if (!result.success) {
      return {
        errors: z.flattenError(result.error).fieldErrors,
      };
    }

    try {
      await updateGoal(goal.id!, {
        name: result.data.name,
        color: selectedColor,
      });
      onOpenChange(false);
      return { errors: {} };
    } catch (error) {
      console.error("Failed to update goal:", error);
      return {
        errors: { name: ["Failed to update goal"] },
      };
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        `Delete "${goal.name}" goal? Tasks with this goal will no longer show it.`,
      )
    ) {
      try {
        await deleteGoal(goal.id!);
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to delete goal:", error);
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-5 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-[360px] max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-1 text-gray-950 outline-[0.5px] outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
          <Dialog.Title className="mb-1 py-1.5 px-3 rounded-t-sm rounded-b-xs bg-gray-100 text-gray-600 text-[11px] font-light border-gray-200 border-[0.5px]">
            Editing goal...
          </Dialog.Title>
          <Form
            className="flex flex-col gap-2"
            errors={errors}
            onClearErrors={setErrors}
            onSubmit={handleSubmit}
          >
            <Field.Root
              name="name"
              className="flex flex-col items-start gap-1.5 px-3 mt-2"
            >
              <Field.Label className="text-xs text-gray-925">
                Goal Name
              </Field.Label>
              <Field.Control
                type="text"
                required
                defaultValue={goal.name}
                placeholder="Enter goal name..."
                className="h-10 w-full rounded-md border-[0.5px] border-gray-300 pl-3.5 text-sm font-light text-gray-950 placeholder-gray-600 focus:outline focus:-outline-offset-1 focus:outline-blue-800"
              />
              <Field.Error className="text-sm text-red-800" />
            </Field.Root>

            <div className="px-3">
              <ColorPicker value={selectedColor} onChange={setSelectedColor} />
            </div>

            <div className="flex justify-between gap-2 mt-2 p-2">
              <button
                type="button"
                onClick={() => {
                  void handleDelete();
                }}
                className="flex h-7 items-center justify-center gap-2 rounded-md bg-red-50 px-2.5 text-sm text-red-700 select-none hover:bg-red-100 focus-visible:outline focus-visible:-outline-offset-1 active:bg-red-100"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <div className="flex gap-2">
                <Dialog.Close className="flex h-7 items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="flex h-7 items-center justify-center rounded-md border border-gray-900 bg-gray-800 p-2.5 text-sm text-gray-50 select-none hover:bg-gray-900 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200"
                >
                  Save changes
                </button>
              </div>
            </div>
          </Form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
