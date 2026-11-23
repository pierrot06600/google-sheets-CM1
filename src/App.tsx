/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { CourseWelcome } from './components/CourseWelcome';
import { CourseWorkspace } from './components/CourseWorkspace';
import { AppView, Header } from './components/Header';
import { RgpdPrivacyView } from './components/RgpdPrivacyView';
import { SandboxView } from './components/SandboxView';
import {
  AccessibilitySettings,
  loadLocalState,
  LocalProgressState,
  saveLocalState,
  wipeAllLocalData,
} from './utils/storageAndParental';

export default function App() {
  const [state, setState] = useState<LocalProgressState>(() => loadLocalState());
  const [activeView, setActiveView] = useState<AppView>('course');
  const [courseStarted, setCourseStarted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    saveLocalState(state);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('a11y-dyslexia', state.accessibility.dyslexiaMode);
    root.classList.toggle('a11y-high-contrast', state.accessibility.highContrast);
    root.classList.toggle('a11y-reduced-motion', state.accessibility.reducedMotion);
    root.classList.toggle('a11y-text-lg', state.accessibility.textScale === 'lg');
    root.classList.toggle('a11y-text-xl', state.accessibility.textScale === 'xl');
  }, [state.accessibility]);

  const handleStepCompleted = useCallback((stepId: string, badgeName: string) => {
    setState((prev) => {
      const nextSteps = prev.completedStepIds.includes(stepId)
        ? prev.completedStepIds
        : [...prev.completedStepIds, stepId];
      const nextBadges = prev.unlockedBadges.includes(badgeName)
        ? prev.unlockedBadges
        : [...prev.unlockedBadges, badgeName];
      return {
        ...prev,
        completedStepIds: nextSteps,
        unlockedBadges: nextBadges,
      };
    });
  }, []);

  const handleUpdateAccessibility = (next: AccessibilitySettings) => {
    setState((prev) => ({ ...prev, accessibility: next }));
  };

  const handleWipeAllData = () => {
    const fresh = wipeAllLocalData();
    setState(fresh);
    setCurrentStepIndex(0);
  };

  const handleSelectView = (view: AppView) => {
    setActiveView(view);
    if (view === 'course' && state.completedStepIds.length > 0) {
      setCourseStarted(true);
    }
  };

  const handleStartCourse = () => {
    setActiveView('course');
    setCourseStarted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeView={activeView}
        onSelectView={handleSelectView}
        onStartCourse={handleStartCourse}
      />

      <main className="flex-1">
        {activeView === 'course' ? (
          !courseStarted ? (
            <CourseWelcome
              completedCount={state.completedStepIds.length}
              onStartCourse={() => setCourseStarted(true)}
              onOpenSandbox={() => setActiveView('sandbox')}
              onOpenRgpd={() => setActiveView('rgpd')}
            />
          ) : (
            <CourseWorkspace
              currentStepIndex={currentStepIndex}
              onSelectStep={setCurrentStepIndex}
              completedStepIds={state.completedStepIds}
              unlockedBadges={state.unlockedBadges}
              onStepCompleted={handleStepCompleted}
            />
          )
        ) : activeView === 'sandbox' ? (
          <SandboxView />
        ) : activeView === 'accessibility' ? (
          <AccessibilityPanel
            settings={state.accessibility}
            onChange={handleUpdateAccessibility}
          />
        ) : (
          <RgpdPrivacyView onWipeLocalData={handleWipeAllData} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 hc-surface">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 hc-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Atelier Tableur CM1 · Zéro donnée personnelle · Conforme RGPD Mineurs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveView('accessibility')}
              className="hover:text-slate-900 underline underline-offset-2"
            >
              Accessibilité
            </button>
            <button
              type="button"
              onClick={() => setActiveView('rgpd')}
              className="hover:text-slate-900 underline underline-offset-2"
            >
              Confidentialité RGPD
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
