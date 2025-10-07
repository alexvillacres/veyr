import { Plus } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Dialog, Field, Form } from "@base-ui-components/react";
import z from "zod";

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
      await addTask(result.data.name, stageId);
      setOpen(false); // Close dialog on success
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
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          className={clsx(
            "inline-flex flex-col w-full items-center justify-center bg-gray-100 border-gray-300 transition opacity-50 hover:opacity-100 border-[0.5px] rounded px-0.5 py-0.5",
            "opacity-0 group-hover:opacity-100 min-h-6",
            className,
          )}
        >
          <Plus size={14} />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-5 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-[480px] max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 text-gray-950 outline-[0.5px] outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
            <Dialog.Title className="-mt-1 mb-1 text-lg">
              Create New Task
            </Dialog.Title>
            <Form
              className="flex flex-col gap-2"
              errors={errors}
              onClearErrors={setErrors}
              onSubmit={handleSubmit}
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
                  placeholder="Enter task name..."
                  className="h-10 w-full rounded-md border-[0.5px] border-gray-300 pl-3.5 text-base font-light text-gray-900 focus:outline focus:-outline-offset-1 focus:outline-blue-800"
                />
                <Field.Error className="text-sm text-red-800" />
              </Field.Root>
              <div className="flex justify-between gap-4 mt-4">
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
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
