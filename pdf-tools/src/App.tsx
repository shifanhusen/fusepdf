import { useState } from 'react';
import type { HistoryEntry, ToolTab } from './types/pdf';
import { ToolTabs } from './components/ToolTabs';
import { MergeTool } from './views/MergeTool';
import { SplitTool } from './views/SplitTool';
import { OrganizeTool } from './views/OrganizeTool';
import { HistoryPanel } from './components/HistoryPanel';
import { appendHistory, loadHistory, saveHistory } from './utils/history';
import { externalSourceConfig } from './config/externalSources';

function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>('merge');
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  const handleHistory = (entry: HistoryEntry) => {
    setHistory((prev) => appendHistory(prev, entry));
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-background pb-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-brand-green">FusePDF</p>
          <h1 className="mt-3 text-4xl font-black text-white">PDF Tools – Merge, Split & Organize</h1>
          <p className="mt-3 text-base text-text-muted">
            All-in-one, privacy-first PDF workspace. Everything runs in your browser—no uploads, no accounts, just instant results.
          </p>
          <div className="mt-6">
            <ToolTabs active={activeTab} onChange={setActiveTab} />
          </div>
        </header>

        <main className="mt-10 grid gap-6 lg:grid-cols-[3fr_1fr]">
          <section>
            {activeTab === 'merge' && (
              <MergeTool onHistory={handleHistory} sourceConfig={externalSourceConfig} />
            )}
            {activeTab === 'split' && (
              <SplitTool onHistory={handleHistory} sourceConfig={externalSourceConfig} />
            )}
            {activeTab === 'organize' && (
              <OrganizeTool onHistory={handleHistory} sourceConfig={externalSourceConfig} />
            )}
          </section>

          <HistoryPanel entries={history} onClear={clearHistory} />
        </main>
      </div>
    </div>
  );
}

export default App;
