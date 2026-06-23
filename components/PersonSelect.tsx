"use client";

/**
 * A dropdown that restricts holder selection to the workforce, so every name
 * in the pipeline comes from a single source. If the current value is a legacy
 * name not (yet) in the workforce, it's still shown so nothing is lost.
 */
interface Props {
  value: string;
  onChange: (value: string) => void;
  people: string[];
  className?: string;
  placeholder?: string;
}

export default function PersonSelect({
  value,
  onChange,
  people,
  className,
  placeholder = "— Unassigned —",
}: Props) {
  const options = value && !people.includes(value) ? [value, ...people] : people;
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">{placeholder}</option>
      {options.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
}
