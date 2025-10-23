import { QUEST_COLORS, type QuestColorKey } from "@/constants/colors";

interface ColorPickerProps {
  value?: QuestColorKey;
  onChange: (color: QuestColorKey) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const colorKeys = Object.keys(QUEST_COLORS) as Array<QuestColorKey>;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-925">Pick a color</label>
      <div className="flex flex-row space-y-1">
        {colorKeys.map((key) => {
          const config = QUEST_COLORS[key];
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