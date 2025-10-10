import { Plus } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Dialog, Field, Form } from "@base-ui-components/react";
import z from "zod";
import { GoalCombobox } from "./goalCombobox";
import { TaskDialog } from "./taskDialog";

const schema = z.object({
  name: z.string().min(1, "Task name is required"),
});

type ButtonProps = {
  className?: string;
  stageId: number;
};

export function AddTaskButton({ className, stageId }: ButtonProps) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [goalId, setGoalId] = useState<number | undefined>(undefined);
  const { addTask } = useTasks();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitForm(e);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse(Object.fromEntries(formData as any));

    if (!result.success) {
      return {
        errors: z.flattenError(result.error).fieldErrors,
      };
    }

    try {
      await addTask(result.data.name, stageId, goalId);
      setOpen(false); // Close dialog on success
      setGoalId(undefined); // Reset goal selection
      (event.target as HTMLFormElement).reset(); // Reset form
      return { errors: {} };
    } catch (error) {
      console.error("Failed to add task:", error);
      return {
        errors: { name: ["Failed to create task"] },
      };
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={clsx(
          "inline-flex flex-col w-full items-center justify-center bg-gray-100 border-gray-300 transition opacity-50 hover:opacity-100 border-[0.5px] rounded px-0.5 py-0.5",
          "opacity-0 group-hover:opacity-100 min-h-6",
          className,
        )}
      >
        <Plus size={14} />
      </button>

      <TaskDialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          // Reset goal when dialog closes
          if (!newOpen) {
            setGoalId(undefined);
          }
        }}
        title="Creating task..."
      >
        <Form
          className="flex flex-col gap-2"
          errors={errors}
          onClearErrors={setErrors}
          onSubmit={handleSubmit}
        >
          <Field.Root
            name="name"
            className="flex flex-col items-start gap-2 mt-2 px-3"
          >
            <Field.Label className="text-xs text-gray-925">
              Task Name
            </Field.Label>
            <Field.Control
              type="text"
              required
              placeholder="Enter task name..."
              className="h-10 w-full rounded-md border-[0.5px] border-gray-300 pl-3.5 text-sm font-light text-gray-950 placeholder-gray-600 focus:outline focus:-outline-offset-1 focus:outline-blue-800"
            />
            <Field.Error className="text-sm text-red-800" />
          </Field.Root>
          <GoalCombobox value={goalId} onChange={setGoalId} />
          <div className="flex justify-between gap-2 mt-2 p-3">
            <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
              Cancel
            </Dialog.Close>
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-900 px-3.5 text-sm text-gray-50 select-none hover:bg-gray-800 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200"
            >
              Create task
            </button>
          </div>
        </Form>
      </TaskDialog>
    </>
  );
}
