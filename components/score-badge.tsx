import { cn } from "@/lib/utils";
import { getScoreTier } from "@/lib/utils";

function scoreStyles(score: number) {
  if (score >= 75)
    return {
      text: "text-ctp-green",
      bg: "bg-ctp-green/15",
    };
  if (score >= 50)
    return {
      text: "text-ctp-blue",
      bg: "bg-ctp-blue/15",
    };
  if (score >= 25)
    return {
      text: "text-ctp-yellow",
      bg: "bg-ctp-yellow/15",
    };
  return {
    text: "text-ctp-red",
    bg: "bg-ctp-red/15",
  };
}

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const { label } = getScoreTier(score);
  const { text, bg } = scoreStyles(score);

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <span
        className={cn(
          "font-extrabold tabular-nums leading-none",
          text,
          size === "sm" ? "text-lg" : "text-2xl"
        )}
      >
        {score}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          text,
          bg
        )}
      >
        {label}
      </span>
    </div>
  );
}