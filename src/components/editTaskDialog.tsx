import { useState } from "react";
import { Dialog, Field, Form } from "@base-ui-components/react";
import { Trash2 } from "lucide-react";
import z from "zod";
import { useTasks } from "@/hooks/useTasks";
import { type Task } from "@/db";
import { GoalCombobox } from "./goalCombobox";
import { TaskDialog } from "./taskDialog";

const schema = z.object({
  name: z.string().min(1, "Task name is required"),
});

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const [errors, setErrors] = useState({});
  const [goalId, setGoalId] = useState<number | undefined>(task.goalId);
  const { updateTask, deleteTask } = useTasks();

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
      await updateTask(task.id!, {
        name: result.data.name,
        goalId: goalId,
      });
      onOpenChange(false);
      return { errors: {} };
    } catch (error) {
      console.error("Failed to update task:", error);
      return {
        errors: { name: ["Failed to update task"] },
      };
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task.id!);
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  return (
    <TaskDialog open={open} onOpenChange={onOpenChange} title="Editing task...">
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
          <Field.Label className="text-xs text-gray-925">Task Name</Field.Label>
          <Field.Control
            type="text"
            required
            defaultValue={task.name}
            placeholder="Enter task name..."
            className="h-10 w-full rounded-md border-[0.5px] border-gray-300 pl-3.5 text-sm font-light text-gray-950 placeholder-gray-600 focus:outline focus:-outline-offset-1 focus:outline-blue-800"
          />
          <Field.Error className="text-sm text-red-800" />
        </Field.Root>

        <GoalCombobox value={goalId} onChange={setGoalId} />

        <div className="flex justify-between gap-2 mt-2 p-2">
          <button
            type="button"
            onClick={() => {
              void handleDelete();
            }}
            className="flex h-10 items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-3.5 text-sm text-red-700 select-none hover:bg-red-100 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-red-600 active:bg-red-100"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <div className="flex gap-2">
            <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
              Cancel
            </Dialog.Close>
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-900 px-3.5 text-sm text-gray-50 select-none hover:bg-gray-800 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200"
            >
              Save changes
            </button>
          </div>
        </div>
      </Form>
    </TaskDialog>
  );
}
