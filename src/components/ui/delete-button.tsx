import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
}

export default function DeleteButton({ onDelete }: DeleteButtonProps) {
  const [confirm, setConfirm] = useState(false);

  // Optional auto-collapse for UX
  useEffect(() => {
    if (confirm) {
      const t = setTimeout(() => setConfirm(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirm]);

  return (
    <button
      onClick={() => { 
        if (confirm) {
            onDelete();
            setConfirm(false);
        } else {
            setConfirm((prev) => !prev);
        }
      }}
      onBlur={() => setConfirm(false)}
      className={`
        flex items-center justify-center rounded-md
        overflow-hidden transition-colors duration-300 text-sm px-2
        ${confirm
          ? "bg-red-600 text-white min-h-8 min-w-8"
          : "bg-red-50 hover:bg-red-100 text-red-500 min-h-8 min-w-8 text-sm"}
      `}
    >
      <Trash2
        size={14}
        className={`shrink-0 transition-colors duration-300 ${
          confirm ? "text-white" : "text-red-500"
        }`}
      />

      {/* Expanding text region */}
      <motion.div
        className="overflow-hidden whitespace-nowrap"
        // we use `marginLeft` when expanded instead of `padding`
        initial={false}
        animate={{
          width: confirm ? "auto" : 0,
          opacity: confirm ? 1 : 0,
          marginLeft: confirm ? 8 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.2,
        }}
      >
        <span>Really delete?</span>
      </motion.div>
    </button>
  );
}