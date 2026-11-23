import { useState } from 'react';
import { CourseStep } from '../utils/courseCurriculum';

interface VisualTutorialDiagramProps {
  type: CourseStep['visualDemoType'];
}

export function VisualTutorialDiagram({ type }: VisualTutorialDiagramProps) {
  const [demoCell, setDemoCell] = useState<'B2' | 'C3'>('C3');

  if (type === 'coordinates') {
    const activeCol = demoCell[0];
    const activeRow = Number(demoCell[1]);
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 hc-surface">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-semibold text-slate-700">
            Schéma interactif : clique sur B2 ou C3
          </span>
          <span className="font-mono-tabular text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            Cellule {demoCell}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-center text-xs font-mono-tabular">
          <div className="py-1.5 rounded bg-slate-200/70 text-slate-500 font-semibold"></div>
          {(['A', 'B', 'C'] as const).map((col) => (
            <div
              key={col}
              className={`py-1.5 rounded font-bold transition-colors ${
                col === activeCol ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-900'
              }`}
            >
              Col. {col}
            </div>
          ))}
          {[1, 2, 3].map((row) => (
            <div key={row} className="contents">
              <div
                className={`py-2 rounded font-bold transition-colors ${
                  row === activeRow ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                Ligne {row}
              </div>
              {(['A', 'B', 'C'] as const).map((col) => {
                const ref = `${col}${row}`;
                const isTarget = ref === demoCell;
                const isInteractive = ref === 'B2' || ref === 'C3';
                const inCol = col === activeCol;
                const inRow = row === activeRow;
                return (
                  <button
                    key={ref}
                    type="button"
                    onClick={() => {
                      if (ref === 'B2' || ref === 'C3') setDemoCell(ref);
                    }}
                    aria-label={`Exemple cellule ${ref}`}
                    className={`py-2 rounded border text-xs font-semibold transition-colors ${
                      isTarget
                        ? 'bg-amber-300 border-amber-600 text-slate-900 font-bold'
                        : inCol || inRow
                        ? 'bg-sky-50 border-sky-200 text-slate-700'
                        : 'bg-white border-slate-200 text-slate-400'
                    } ${isInteractive ? 'cursor-pointer hover:border-sky-500' : 'cursor-default'}`}
                  >
                    {ref}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table-headers') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 hc-surface">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Modèle visuel : en-têtes en haut, données en dessous
        </p>
        <div className="grid grid-cols-3 gap-1 text-xs text-center">
          <div className="py-1.5 px-2 rounded bg-emerald-100 border border-emerald-300 font-bold text-emerald-950">
            1. Titre (Gras)
          </div>
          <div className="py-1.5 px-2 rounded bg-emerald-100 border border-emerald-300 font-bold text-emerald-950">
            2. Nombre
          </div>
          <div className="py-1.5 px-2 rounded bg-emerald-100 border border-emerald-300 font-bold text-emerald-950">
            3. Couleur
          </div>
          <div className="py-1.5 px-2 rounded bg-white border border-slate-200 text-slate-700">
            Cahier
          </div>
          <div className="py-1.5 px-2 rounded bg-white border border-slate-200 font-mono-tabular text-slate-700">
            2
          </div>
          <div className="py-1.5 px-2 rounded bg-white border border-slate-200 text-slate-700">
            Bleu
          </div>
        </div>
      </div>
    );
  }

  if (type === 'planner') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 hc-surface">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Code couleur ludique du planning :
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-center">
          <div className="py-2 px-2 rounded-lg bg-sky-100 border border-sky-300 text-sky-950">
            Bleu = Devoirs
          </div>
          <div className="py-2 px-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-950">
            Jaune = Loisirs
          </div>
          <div className="py-2 px-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950">
            Vert = Fait
          </div>
        </div>
      </div>
    );
  }

  if (type === 'formulas') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 hc-surface">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Anatomie d’une formule magique :
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono-tabular text-sm bg-white p-2.5 rounded-lg border border-slate-200">
          <span className="px-2 py-1 rounded bg-purple-100 text-purple-900 font-bold" title="Toujours commencer par =">
            =
          </span>
          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-bold" title="Nom de l'opération">
            SOMME
          </span>
          <span className="text-slate-400 font-bold">(</span>
          <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 font-bold" title="De la case D2 jusqu'à D6">
            D2:D6
          </span>
          <span className="text-slate-400 font-bold">)</span>
        </div>
        <p className="mt-2 text-xs text-slate-600 text-center">
          « = » réveille le calculateur · « SOMME » additionne · « D2:D6 » montre les cases.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 hc-surface">
      <p className="text-xs font-semibold text-slate-700 mb-2">
        Les 3 super-pouvoirs du tableur CM1 :
      </p>
      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div className="p-2 rounded bg-sky-50 border border-sky-200 text-sky-950 font-semibold">
          1. Coordonnées (C3)
        </div>
        <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-950 font-semibold">
          2. Couleurs & Titres
        </div>
        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold">
          3. Formules (=SOMME)
        </div>
      </div>
    </div>
  );
}
