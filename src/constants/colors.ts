export const GOAL_COLORS = {
  green: {
    name: "Green",
    subtleBg: "bg-green-subtle",
    solidBg: "bg-green-strong",
    strongText: "text-green-strong",
    subtleText: "text-green-subtle",
    ring: "ring-green-strong",
  },
  blue: {
    name: "Blue",
    subtleBg: "bg-blue-subtle",
    solidBg: "bg-blue-strong",
    strongText: "text-blue-strong",
    subtleText: "text-blue-subtle",
    ring: "ring-blue-strong",
  },
  purple: {
    name: "Purple",
    subtleBg: "bg-purple-subtle",
    solidBg: "bg-purple-strong",
    strongText: "text-purple-strong",
    subtleText: "text-purple-subtle",
    ring: "ring-purple-strong",
  },
  orange: {
    name: "Orange",
    subtleBg: "bg-orange-subtle",
    solidBg: "bg-orange-strong",
    strongText: "text-orange-strong",
    subtleText: "text-orange-subtle",
    ring: "ring-orange-strong",
  },
  yellow: {
    name: "Yellow",
    subtleBg: "bg-yellow-subtle",
    solidBg: "bg-yellow-strong",
    strongText: "text-yellow-strong",
    subtleText: "text-yellow-subtle",
    ring: "ring-yellow-strong",
  },
};

export type GoalColorKey = keyof typeof GOAL_COLORS;

export const DEFAULT_GOAL_COLOR: GoalColorKey = "blue";
