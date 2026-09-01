import {
  Blocks,
  Brain,
  Briefcase,
  Code,
  Cpu,
  Feather,
  FileText,
  GraduationCap,
  Images,
  Languages,
  Lightbulb,
  MessageCircle,
  Music,
  Palette,
  ShieldCheck,
  Video,
  type LucideIcon,
} from "lucide-react";

/** data/categories.json 的 icon 字段 -> lucide 组件（集中映射，避免动态 import 字符串） */
const ICONS: Record<string, LucideIcon> = {
  feather: Feather,
  "file-text": FileText,
  images: Images,
  briefcase: Briefcase,
  code: Code,
  palette: Palette,
  "message-circle": MessageCircle,
  video: Video,
  music: Music,
  languages: Languages,
  "graduation-cap": GraduationCap,
  brain: Brain,
  "shield-check": ShieldCheck,
  lightbulb: Lightbulb,
  cpu: Cpu,
  blocks: Blocks,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Images;
  return <Cmp className={className} aria-hidden />;
}

export function categoryIconNode(name: string, className?: string) {
  const Cmp = ICONS[name] ?? Images;
  return <Cmp className={className} aria-hidden />;
}
