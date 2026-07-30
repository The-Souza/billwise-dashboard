import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type TrendProps = {
  trend: number | null;
  isGood: boolean;
  label?: string;
};

export function TrendIndicator({ trend, isGood, label }: TrendProps) {
  if (trend === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem dados do {label ?? "período anterior"} para comparar
      </p>
    );
  }

  const positive = trend >= 0;
  const isGreenCase = isGood ? positive : !positive;

  return (
    <p className="text-sm text-muted-foreground flex items-center gap-1">
      {positive ? (
        <ArrowUpRight
          className={`h-4 w-4 ${isGreenCase ? "text-foreground" : "text-destructive"}`}
        />
      ) : (
        <ArrowDownRight
          className={`h-4 w-4 ${isGreenCase ? "text-foreground" : "text-destructive"}`}
        />
      )}
      <span className={isGreenCase ? "text-foreground" : "text-destructive"}>
        {Math.abs(trend)}%
      </span>
      {label && <span>{label}</span>}
    </p>
  );
}
