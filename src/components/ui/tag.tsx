import {
  GOAL_COLORS,
  DEFAULT_GOAL_COLOR,
  type GoalColorKey,
} from "@/constants/colors";

interface GoalTagProps {
  children: React.ReactNode;
  color?: GoalColorKey;
  onClick?: () => void;
}

export default function GoalTag({ children, color, onClick }: GoalTagProps) {
  // Get color config, default to blue if not provided or invalid
  const colorConfig =
    color && color in GOAL_COLORS
      ? GOAL_COLORS[color]
      : GOAL_COLORS[DEFAULT_GOAL_COLOR];

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
export { GoalTag as Tag };
