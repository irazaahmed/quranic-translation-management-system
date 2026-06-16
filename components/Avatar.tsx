const COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function Avatar({
  name,
  size = "sm",
}: {
  name: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";

  if (!name) {
    return (
      <span className={`${dim} flex flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-medium`}>
        —
      </span>
    );
  }

  return (
    <span
      className={`${dim} ${colorFor(name)} flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm`}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
