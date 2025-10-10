import { GOAL_COLORS, type GoalColorKey } from "@/constants/colors";

interface ColorPickerProps {
  value?: GoalColorKey;
  onChange: (color: GoalColorKey) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const colorKeys = Object.keys(GOAL_COLORS) as Array<GoalColorKey>;
  
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-925">Goal Color</label>
      <div className="flex flex-row gap-3">
        {colorKeys.map((key) => {
          const config = GOAL_COLORS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`h-5 w-5 rounded-full transition-all ${config.solidBg} ${
                value === key ? `ring-2 ring-offset-2 ${config.ring}` : ``
              }`}
              title={config.name}
              aria-label={`Select ${config.name} color`}
            />
          );
        })}
      </div>
    </div>
  );
}
