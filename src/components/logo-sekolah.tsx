import { GraduationCap } from "lucide-react";
import { usePengaturanSekolah } from "@/lib/pengaturan-store";

/** Logo sekolah dari pengaturan; jatuh ke ikon topi wisuda bila belum diunggah. */
export function LogoSekolah({ className = "h-10 w-10" }: { className?: string }) {
  const s = usePengaturanSekolah();
  if (s.logo_url) {
    return (
      <span className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-card ${className}`}>
        <img src={s.logo_url} alt={`Logo ${s.nama_sekolah}`} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground ${className}`}>
      <GraduationCap className="h-[60%] w-[60%]" />
    </span>
  );
}
