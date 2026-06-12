import { getApp } from "@/lib/config";
import {
  CATEGORY_META,
  CHANGELOG_LABEL_META,
  STATUS_META,
  isCategory,
  isStatus,
  type ChangelogLabel,
} from "@/lib/types";

const CHIP_BASE = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export function StatusBadge({ status }: { status: string }) {
  if (!isStatus(status)) return null;
  const meta = STATUS_META[status];
  return (
    <span className={`${CHIP_BASE} ${meta.chipClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  if (!isCategory(category)) return null;
  return <span className={`${CHIP_BASE} ${CATEGORY_META[category].chipClass}`}>{CATEGORY_META[category].label}</span>;
}

export function AppChip({ appId }: { appId: string | null }) {
  const app = getApp(appId);
  if (!app) return null;
  return <span className={`${CHIP_BASE} ${app.chipClass}`}>{app.name}</span>;
}

export function ChangelogLabelBadge({ label }: { label: ChangelogLabel }) {
  const meta = CHANGELOG_LABEL_META[label];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.chipClass}`}>
      {meta.label}
    </span>
  );
}
