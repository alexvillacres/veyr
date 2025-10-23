import { useState, FormEvent } from "react";
import { Form } from "@base-ui-components/react/form";
import { Field } from "@base-ui-components/react/field";
import { ColorPicker } from "./ColorPicker";

interface QuestFormProps {
  onSubmit: (name: string, color: string) => void | Promise<void>;
  onCancel?: () => void;
  initialName?: string;
  initialColor?: string;
  submitLabel?: string;
}

export function QuestForm({
  onSubmit,
  onCancel,
  initialName = "",
  initialColor = "blue",
  submitLabel = "Create Quest",
}: QuestFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<string>(initialColor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), color);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field.Root className="flex flex-col gap-2">
        <Field.Label className="text-xs text-gray-925">Quest Name</Field.Label>
        <Field.Control
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter quest name"
          className="h-8 rounded-sm border-[0.5px] bg-gray-50 border-gray-200 px-2 py-1.5 text-sm text-gray-950 placeholder:text-gray-500 focus:outline-1 focus:border-gray-300"
          autoFocus
        />
      </Field.Root>
        <label className="text-xs text-gray-925">Color</label>
      <ColorPicker value={color} onChange={setColor} />

      <div className="flex gap-2 justify-end mt-2">=
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm font-light text-gray-700 bg-white border-[0.5px] border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="px-3 py-1.5 text-sm font-light text-white bg-gray-900 border-[0.5px] border-gray-900 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : submitLabel}
        </button>
      </div>
    </Form>
  );
}

