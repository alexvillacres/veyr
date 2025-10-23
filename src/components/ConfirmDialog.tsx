import { AlertTriangle } from "lucide-react";
import { Dialog } from "@base-ui-components/react/dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/20 z-40 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 transition-[transform,opacity] origin-center">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 pb-3">
              {variant === "danger" && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-gray-600">
                  {message}
                </Dialog.Description>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 p-4 pt-3 border-t border-gray-100">
              <Dialog.Close className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                {cancelLabel}
              </Dialog.Close>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

