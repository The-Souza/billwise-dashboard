import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type TrendProps = {
  trend: number;
  isGood: boolean;
  label?: string;
};

export function TrendIndicator({ trend, isGood, label }: TrendProps) {
  const positive = trend >= 0;
  const isGreenCase = isGood ? positive : !positive;

  return (
    <p className="text-sm text-muted-foreground flex items-center gap-1">
      {positive ? (
        <ArrowUpRight
          className={`h-4 w-4 ${isGreenCase ? "text-emerald-500" : "text-destructive"}`}
        />
      ) : (
        <ArrowDownRight
          className={`h-4 w-4 ${isGreenCase ? "text-emerald-500" : "text-destructive"}`}
        />
      )}
      <span className={isGreenCase ? "text-emerald-500" : "text-destructive"}>
        {Math.abs(trend)}%
      </span>
      {label && <span>{label}</span>}
    </p>
  );
}
