import {
  Backpack,
  BookOpen,
  Calculator,
  Clock,
  Gift,
  IceCreamCone,
  Landmark,
  Languages,
  Leaf,
  Milk,
  Notebook,
  NotebookPen,
  Palette,
  Pencil,
  PenLine,
  Ruler,
  Shirt,
  Soup,
  Ticket,
  Volleyball,
  Zap,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Backpack,
  Calculator,
  Clock,
  Gift,
  IceCreamCone,
  Landmark,
  Languages,
  Leaf,
  Milk,
  Notebook,
  NotebookPen,
  Palette,
  Pencil,
  PenLine,
  Ruler,
  Shirt,
  Soup,
  Ticket,
  Volleyball,
  Zap,
};

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? BookOpen;
  return <Icon className={className} />;
}
