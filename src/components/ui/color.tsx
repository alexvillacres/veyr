import { useState } from "react";
import type { Color } from "@/db";

interface ColorPickerProps {
  colors: Color[];
  defaultColor: string;
  onColorChange: (color: string) => void;
}

interface ColorCircleProps {
  color: string;
  selectedColor: string;
  initialColor: string;
}

export function ColorCircle({ color, selectedColor }: ColorCircleProps) {
  return (
    <div className="flex flex-row flex-initial" aria-label={color}>
      <div
        className={
          selectedColor == color
            ? `h-5 w-5 rounded-full border outline-2 outline-gray-50 border-transparent transition bg-[var(--swatch)] ring-4 ring-[var(--swatch)]`
            : `h-5 w-5 rounded-full border outline-2 outline-gray-50 border-transparent transition ring hover:shadow-[0_0_3px_4px_var(--swatch)] bg-[var(--swatch)]`
        }
        style={
          {
            "--swatch": `var(--color-${color}-700)`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

export function ColorPicker({
  colors,
  defaultColor,
  onColorChange,
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  return (
    <div className="flex rounded-lg p-3 gap-4 shadow-lg bg-gray-50 border-[0.25px] border-gray-200">
      {colors.map((color) => {
        return (
          <button
            key={color.id}
            onClick={() => {
              setSelectedColor(color.id);
              onColorChange(color.id);
            }}
            className={`relative transition-transform`}
            aria-label={color.name || `Select ${color.id}`}
          >
            <ColorCircle
              color={color.id}
              initialColor="blue"
              selectedColor={selectedColor}
            />
          </button>
        );
      })}
    </div>
  );
}
