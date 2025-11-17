import clsx from 'clsx';
import type { ToolTab } from '../types/pdf';

interface ToolTabsProps {
  active: ToolTab;
  onChange: (tab: ToolTab) => void;
}

const tabs: { id: ToolTab; label: string }[] = [
  { id: 'merge', label: 'Merge' },
  { id: 'split', label: 'Split' },
  { id: 'organize', label: 'Organize' },
];

export function ToolTabs({ active, onChange }: ToolTabsProps) {
  return (
    <div className="inline-flex rounded-full border border-surface-border bg-surface p-1 text-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={clsx(
            'rounded-full px-4 py-2 font-semibold transition',
            active === tab.id ? 'bg-brand-blue text-black shadow-glow' : 'text-text-muted hover:text-white',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
