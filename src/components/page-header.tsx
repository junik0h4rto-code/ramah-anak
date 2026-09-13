import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="bg-gradient-navy text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/12 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide">
          <Icon className="h-4 w-4" /> {eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-80 sm:text-base">{subtitle}</p>
      </div>
    </section>
  );
}
