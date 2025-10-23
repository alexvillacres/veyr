import { useLiveQuery } from "dexie-react-hooks";
import { db, type Color } from "../db";

export function useColors() {
  const colors = useLiveQuery(() => db.colors.toArray());

  const getColorById = (colorId: string): Color | undefined => {
    return colors?.find((c) => c.id === colorId);
  };

  const getColorByIdOrDefault = (colorId?: string): Color => {
    const defaultColor: Color = {
      id: "blue",
      name: "Blue",
      subtleBg: "bg-blue-subtle",
      solidBg: "bg-blue-strong",
      strongText: "text-blue-strong",
      subtleText: "text-blue-subtle",
      hoverShadow: "hover:shadow-[0px_0px_8px_2px_#6491C9]",
      ring: "ring-blue-strong",
      hoverRing: "hover:ring-blue-strong",
    };

    if (!colorId) return defaultColor;
    
    const color = colors?.find((c) => c.id === colorId);
    return color || defaultColor;
  };

  return {
    colors: colors || [],
    getColorById,
    getColorByIdOrDefault,
  };
}

