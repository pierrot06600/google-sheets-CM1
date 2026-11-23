import { useState } from 'react';
import { SANDBOX_TEMPLATES } from '../utils/courseCurriculum';
import { SheetGrid } from '../utils/spreadsheetEngine';
import { SpreadsheetSimulator } from './SpreadsheetSimulator';

export function SandboxView() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SANDBOX_TEMPLATES[0].id);
  const [gridsByTemplate, setGridsByTemplate] = useState<Record<string, SheetGrid>>(() => {
    const initial: Record<string, SheetGrid> = {};
    for (const tpl of SANDBOX_TEMPLATES) {
      initial[tpl.id] = structuredClone(tpl.grid);
    }
    return initial;
  });
  const [history, setHistory] = useState<Record<string, SheetGrid[]>>({});
  const [selectedCell, setSelectedCell] = useState<string>('D7');

  const activeTemplate =
    SANDBOX_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? SANDBOX_TEMPLATES[0];
  const currentGrid = gridsByTemplate[activeTemplate.id] ?? activeTemplate.grid;

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setSelectedCell(id === 'vierge' ? 'A1' : 'D7');
  };

  const handleUpdateGrid = (nextGrid: SheetGrid) => {
    setHistory((prev) => ({
      ...prev,
      [activeTemplate.id]: [...(prev[activeTemplate.id] ?? []).slice(-15), currentGrid],
    }));
    setGridsByTemplate((prev) => ({
      ...prev,
      [activeTemplate.id]: nextGrid,
    }));
  };

  const handleUndo = () => {
    const stack = history[activeTemplate.id] ?? [];
    if (stack.length === 0) return;
    const prevGrid = stack[stack.length - 1];
    setHistory((prev) => ({
      ...prev,
      [activeTemplate.id]: stack.slice(0, -1),
    }));
    setGridsByTemplate((prev) => ({
      ...prev,
      [activeTemplate.id]: prevGrid,
    }));
  };

  const handleReset = () => {
    setGridsByTemplate((prev) => ({
      ...prev,
      [activeTemplate.id]: structuredClone(activeTemplate.grid),
    }));
    setHistory((prev) => ({
      ...prev,
      [activeTemplate.id]: [],
    }));
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hc-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Modèles pré-remplis & Bac à sable libre
            </h2>
            <p className="text-sm text-slate-600 hc-muted mt-1">
              Choisis un modèle pour organiser tes devoirs de CM1, noter tes activités favorites ou créer ton tableau de zéro.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SANDBOX_TEMPLATES.map((tpl) => {
            const active = tpl.id === activeTemplate.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`text-left p-4 rounded-xl border transition-colors min-h-[96px] flex flex-col justify-between ${
                  active
                    ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hc-surface'
                }`}
              >
                <span className="font-display text-sm font-bold text-slate-900">{tpl.name}</span>
                <span className="text-xs text-slate-600 mt-1 hc-muted">{tpl.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <SpreadsheetSimulator
        grid={currentGrid}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
        onUpdateGrid={handleUpdateGrid}
        onUndo={handleUndo}
        canUndo={(history[activeTemplate.id]?.length ?? 0) > 0}
        onResetSheet={handleReset}
        titleLabel={`Modèle : ${activeTemplate.name}`}
      />
    </section>
  );
}
