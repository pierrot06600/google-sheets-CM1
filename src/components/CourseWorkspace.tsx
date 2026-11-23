import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { COURSE_STEPS, evaluateStepProgress } from '../utils/courseCurriculum';
import { SheetGrid } from '../utils/spreadsheetEngine';
import { SpreadsheetSimulator } from './SpreadsheetSimulator';
import { VisualTutorialDiagram } from './VisualTutorialDiagram';

interface CourseWorkspaceProps {
  currentStepIndex: number;
  onSelectStep: (idx: number) => void;
  completedStepIds: string[];
  unlockedBadges: string[];
  onStepCompleted: (stepId: string, badgeName: string) => void;
}

export function CourseWorkspace({
  currentStepIndex,
  onSelectStep,
  completedStepIds,
  unlockedBadges,
  onStepCompleted,
}: CourseWorkspaceProps) {
  const step = COURSE_STEPS[currentStepIndex] ?? COURSE_STEPS[0];

  const [gridsByStep, setGridsByStep] = useState<Record<string, SheetGrid>>(() => {
    const map: Record<string, SheetGrid> = {};
    for (const s of COURSE_STEPS) {
      map[s.id] = structuredClone(s.initialGrid);
    }
    return map;
  });

  const [historyByStep, setHistoryByStep] = useState<Record<string, SheetGrid[]>>({});
  const [selectedCell, setSelectedCell] = useState<string>(step.initialSelectedCell);
  const [stickyCompletedTasks, setStickyCompletedTasks] = useState<Record<string, string[]>>({});
  const [openHintId, setOpenHintId] = useState<string | null>(null);

  const currentGrid = gridsByStep[step.id] ?? step.initialGrid;

  useEffect(() => {
    setSelectedCell(step.initialSelectedCell);
    setOpenHintId(null);
  }, [step.id, step.initialSelectedCell]);

  const prevSet = useMemo(
    () => new Set(stickyCompletedTasks[step.id] ?? []),
    [stickyCompletedTasks, step.id]
  );

  const evaluation = useMemo(
    () => evaluateStepProgress(step, currentGrid, selectedCell, prevSet),
    [step, currentGrid, selectedCell, prevSet]
  );

  useEffect(() => {
    const newlyPassedSticky: string[] = [];
    for (const task of step.tasks) {
      if (task.sticky && evaluation.taskResults[task.id] && !prevSet.has(task.id)) {
        newlyPassedSticky.push(task.id);
      }
    }
    if (newlyPassedSticky.length > 0) {
      setStickyCompletedTasks((prev) => ({
        ...prev,
        [step.id]: [...(prev[step.id] ?? []), ...newlyPassedSticky],
      }));
    }
  }, [evaluation.taskResults, prevSet, step.id, step.tasks]);

  useEffect(() => {
    if (evaluation.allCompleted && !completedStepIds.includes(step.id)) {
      onStepCompleted(step.id, step.badgeName);
    }
  }, [evaluation.allCompleted, completedStepIds, onStepCompleted, step.id, step.badgeName]);

  const handleUpdateGrid = (nextGrid: SheetGrid) => {
    setHistoryByStep((prev) => ({
      ...prev,
      [step.id]: [...(prev[step.id] ?? []).slice(-15), currentGrid],
    }));
    setGridsByStep((prev) => ({
      ...prev,
      [step.id]: nextGrid,
    }));
  };

  const handleUndo = () => {
    const stack = historyByStep[step.id] ?? [];
    if (stack.length === 0) return;
    const previous = stack[stack.length - 1];
    setHistoryByStep((prev) => ({
      ...prev,
      [step.id]: stack.slice(0, -1),
    }));
    setGridsByStep((prev) => ({
      ...prev,
      [step.id]: previous,
    }));
  };

  const handleResetStep = () => {
    setGridsByStep((prev) => ({
      ...prev,
      [step.id]: structuredClone(step.initialGrid),
    }));
    setHistoryByStep((prev) => ({
      ...prev,
      [step.id]: [],
    }));
    setStickyCompletedTasks((prev) => ({
      ...prev,
      [step.id]: [],
    }));
    setSelectedCell(step.initialSelectedCell);
  };

  const allCourseCompleted = completedStepIds.length === COURSE_STEPS.length;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Course Step Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hc-surface">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Étapes du cours">
          {COURSE_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isDone = completedStepIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => onSelectStep(idx)}
                className={`inline-flex items-center gap-2 min-h-[42px] px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-mono-tabular">Étape {s.number}</span>
                {isDone && (
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : 'text-emerald-600'}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 font-semibold text-sm text-amber-800">
          <Award className="w-4 h-4 text-amber-600" />
          <span className="font-mono-tabular">
            Badges : {unlockedBadges.length} / {COURSE_STEPS.length}
          </span>
        </div>
      </div>

      {/* Two-Zone Educational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Zone: Guided Concept & Mission Deck */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 hc-surface">
          <div>
            <div className="text-xs font-semibold text-emerald-700 mb-1">
              Étape {step.number} sur {COURSE_STEPS.length}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {step.title}
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed hc-muted">{step.summary}</p>

          {/* Visual Tutorial */}
          <VisualTutorialDiagram type={step.visualDemoType} />

          {/* Key Concept Rules */}
          <div className="space-y-2">
            <h3 className="font-display text-sm font-bold text-slate-900">{step.tutorialTitle}</h3>
            <ul className="space-y-1.5 text-sm text-slate-700 hc-muted">
              {step.tutorialPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono-tabular text-xs font-bold text-emerald-700 mt-1">
                    0{i + 1}.
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Missions Checklist */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-slate-900">
                Tes missions pratiques
              </h3>
              <span className="font-mono-tabular text-xs font-bold text-slate-600">
                {evaluation.completedCount} / {step.tasks.length} réussies
              </span>
            </div>

            <div className="space-y-2.5">
              {step.tasks.map((task) => {
                const done = evaluation.taskResults[task.id];
                const hintOpen = openHintId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      done
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 hc-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            done ? 'text-emerald-950' : 'text-slate-800'
                          }`}
                        >
                          {task.instruction}
                        </span>
                      </div>
                      {!done && (
                        <button
                          type="button"
                          onClick={() => setOpenHintId(hintOpen ? null : task.id)}
                          aria-expanded={hintOpen}
                          aria-label="Afficher un indice"
                          className="inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 shrink-0"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Indice</span>
                        </button>
                      )}
                    </div>
                    {hintOpen && !done && (
                      <p className="mt-2 ml-7 text-xs text-sky-900 bg-sky-50 border border-sky-200 rounded-lg p-2">
                        {task.hint}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Virtual Badge Reward when Step Completed */}
          {(evaluation.allCompleted || completedStepIds.includes(step.id)) && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-amber-900">
                  Badge débloqué : {step.badgeName}
                </div>
                <p className="text-xs text-amber-800 mt-0.5">{step.badgeCaption}</p>
              </div>
            </div>
          )}

          {/* Final Course Diploma */}
          {allCourseCompleted && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-4">
              <img
                src="/src/assets/images/cm1_sheet_trophy_1795406505413.jpg"
                alt="Trophée diplôme de champion CM1"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-cover border border-emerald-200 bg-white shrink-0"
              />
              <div>
                <div className="font-display text-sm font-bold text-emerald-950">
                  Félicitations ! Parcours CM1 terminé
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  Tu as remporté les 5 badges ! Tu sais maintenant utiliser les cellules, les couleurs et les formules Google Sheets.
                </p>
              </div>
            </div>
          )}

          {/* Previous / Next Step Navigation */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSelectStep(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                currentStepIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectStep(Math.min(COURSE_STEPS.length - 1, currentStepIndex + 1))
              }
              disabled={currentStepIndex === COURSE_STEPS.length - 1}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentStepIndex === COURSE_STEPS.length - 1
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <span>Étape suivante</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Zone: Live Google Sheets Simulator */}
        <div className="lg:col-span-7">
          <SpreadsheetSimulator
            grid={currentGrid}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            onUpdateGrid={handleUpdateGrid}
            onUndo={handleUndo}
            canUndo={(historyByStep[step.id]?.length ?? 0) > 0}
            onResetSheet={handleResetStep}
            titleLabel={`Atelier Étape ${step.number} — ${step.title}`}
          />
        </div>
      </div>
    </section>
  );
}
