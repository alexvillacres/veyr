import { useColors } from "@/hooks/useColors";

interface QuestTagProps {
  children: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export default function QuestTag({ children, color, onClick }: QuestTagProps) {
  const { getColorByIdOrDefault } = useColors();
  const colorConfig = getColorByIdOrDefault(color);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-row justify-center items-center gap-1 rounded-sm text-xs px-1.5 py-0.5 font-light cursor-pointer hover:opacity-80 transition-opacity ${colorConfig.subtleBg} ${colorConfig.strongText}`}
    >
      {children}
    </button>
  );
}

// Keep the old Tag export for backwards compatibility
export { QuestTag as Tag };
