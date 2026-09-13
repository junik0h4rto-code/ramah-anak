import { Coins } from "lucide-react";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { cn } from "@/lib/utils";

export function CoinBadge({ className }: { className?: string }) {
  const { koin } = useGamifikasi();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-coin px-3 py-1.5 text-coin-foreground shadow-card",
        className,
      )}
    >
      <Coins className="h-4 w-4" />
      <span className="text-sm font-bold tabular-nums">{koin.toLocaleString("id-ID")}</span>
      <span className="text-xs font-semibold opacity-80">Poin</span>
    </div>
  );
}
