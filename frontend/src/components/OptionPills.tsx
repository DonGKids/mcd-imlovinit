interface OptionPillsProps<T extends string> {
  label: string;
  options: { value: T; label: string; emoji: string }[];
  selected: T | T[];
  onChange: (value: T | T[]) => void;
  multi?: boolean;
}

export function OptionPills<T extends string>({
  label,
  options,
  selected,
  onChange,
  multi = false,
}: OptionPillsProps<T>) {
  const isMulti = multi;
  const selectedArr = isMulti ? (selected as T[]) : null;
  const selectedSingle = !isMulti ? (selected as T) : null;

  function handleClick(value: T) {
    if (isMulti) {
      const arr = (selectedArr as T[]) || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      onChange(next);
    } else {
      onChange(value);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = isMulti
            ? (selectedArr as T[])?.includes(opt.value)
            : selectedSingle === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleClick(opt.value)}
              className={`mcd-pill ${active ? 'mcd-pill-active' : 'mcd-pill-idle'}`}
            >
              <span className="text-base">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TextMoodInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function TextMoodInput({ value, onChange, placeholder }: TextMoodInputProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
        ✍️ 心情自由输入（可选）
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '比如：今天被甲方折磨了，想要吃点治愈的...'}
        className="w-full rounded-2xl border-2 border-gray-200 focus:border-mcd-red focus:outline-none p-4 text-base resize-none transition-colors"
        rows={3}
        maxLength={120}
      />
      <p className="text-xs text-gray-500 text-right">{value.length} / 120</p>
    </div>
  );
}
