import { useState } from "react";
import { Dialog, Field, Form } from "@base-ui-components/react";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import z from "zod";
import { useTasks } from "@/hooks/useTasks";
import { db, type Task } from "@/db";

const schema = z.object({
  name: z.string().min(1, "Task name is required"),
  goalId: z.string().optional(),
});

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [errors, setErrors] = useState({});
  const { updateTask, deleteTask } = useTasks();
  const goals = useLiveQuery(() => db.goals.where("status").equals("active").toArray());

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
        goalId: result.data.goalId ? Number(result.data.goalId) : undefined,
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-5 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-[480px] max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 text-gray-950 outline-[0.5px] outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
          <Dialog.Title className="-mt-1 mb-1 text-lg">Edit Task</Dialog.Title>
          <Form
            className="flex flex-col gap-2"
            errors={errors}
            onClearErrors={setErrors}
            onSubmit={async (event) => {
              const response = await submitForm(event);
              setErrors(response.errors);
            }}
          >
            <Field.Root
              name="name"
              className="flex flex-col items-start gap-1.5 mt-2"
            >
              <Field.Label className="text-sm font-light text-gray-925">
                Task Name
              </Field.Label>
              <Field.Control
                type="text"
                required
                defaultValue={task.name}
                placeholder="Enter task name..."
                className="h-10 w-full rounded-md border-[0.5px] border-gray-300 pl-3.5 text-base font-light text-gray-900 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
              />
              <Field.Error className="text-sm text-red-800" />
            </Field.Root>

            <Field.Root
              name="goalId"
              className="flex flex-col items-start gap-1.5 mt-2"
            >
              <Field.Label className="text-sm font-light text-gray-925">
                Goal (Optional)
              </Field.Label>
              <Field.Control
                render={(props) => (
                  <select
                    {...props}
                    defaultValue={task.goalId?.toString() || ""}
                    className="h-10 w-full rounded-md border-[0.5px] border-gray-300 px-3.5 text-base font-light text-gray-900 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
                  >
                    <option value="">No goal</option>
                    {goals?.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Field.Error className="text-sm text-red-800" />
            </Field.Root>

            <div className="flex justify-between gap-4 mt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-3.5 text-sm text-red-700 select-none hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-red-600 active:bg-red-100"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <div className="flex gap-2">
                <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-900 px-3.5 text-sm text-gray-50 select-none hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200"
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

