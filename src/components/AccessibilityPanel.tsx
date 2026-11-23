import { Accessibility, Eye, Keyboard, Type } from 'lucide-react';
import { AccessibilitySettings } from '../utils/storageAndParental';

interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onChange: (next: AccessibilitySettings) => void;
}

export function AccessibilityPanel({ settings, onChange }: AccessibilityPanelProps) {
  const toggle = (key: keyof Pick<AccessibilitySettings, 'dyslexiaMode' | 'highContrast' | 'reducedMotion'>) => {
    onChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <section className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hc-surface">
        <div className="flex items-center gap-3 mb-2">
          <Accessibility className="w-6 h-6 text-emerald-700" />
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Accessibilité & Confort de lecture
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-600 hc-muted">
          Adapte l’interface pour les élèves dyslexiques, malvoyants, sensibles aux mouvements ou utilisant le clavier uniquement. Ces réglages restent enregistrés uniquement sur cet appareil.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dyslexia spacing */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 hc-surface">
            <div>
              <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <Type className="w-4 h-4 text-sky-700" />
                <span>Aide à la lecture (Dyslexie)</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 hc-muted">
                Augmente l’espacement entre les lettres, les mots et les lignes pour éviter la confusion.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Aide à la lecture (Dyslexie)"
              aria-checked={settings.dyslexiaMode}
              onClick={() => toggle('dyslexiaMode')}
              className={`min-h-[44px] min-w-[96px] px-4 rounded-xl font-semibold text-sm transition-colors shrink-0 ${
                settings.dyslexiaMode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {settings.dyslexiaMode ? 'Activé' : 'Désactivé'}
            </button>
          </div>

          {/* High contrast */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 hc-surface">
            <div>
              <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <Eye className="w-4 h-4 text-sky-700" />
                <span>Contraste élevé (AAA)</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 hc-muted">
                Renforce les bordures noires et le contraste du texte pour une lisibilité maximale.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Contraste élevé (AAA)"
              aria-checked={settings.highContrast}
              onClick={() => toggle('highContrast')}
              className={`min-h-[44px] min-w-[96px] px-4 rounded-xl font-semibold text-sm transition-colors shrink-0 ${
                settings.highContrast
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {settings.highContrast ? 'Activé' : 'Désactivé'}
            </button>
          </div>

          {/* Reduced motion */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 md:col-span-2 hc-surface">
            <div>
              <div className="font-display text-base font-bold text-slate-900">
                Réduire les animations
              </div>
              <p className="text-xs text-slate-600 mt-1 hc-muted">
                Supprime les transitions visuelles pour un affichage calme et instantané.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Réduire les animations"
              aria-checked={settings.reducedMotion}
              onClick={() => toggle('reducedMotion')}
              className={`min-h-[44px] min-w-[96px] px-4 rounded-xl font-semibold text-sm transition-colors shrink-0 ${
                settings.reducedMotion
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {settings.reducedMotion ? 'Activé' : 'Désactivé'}
            </button>
          </div>
        </div>

        {/* Font Scale Selector */}
        <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hc-surface">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Taille du texte dans toute l’application
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 hc-muted">
              Agrandit les consignes et les boutons pour les tablettes ou les besoins visuels.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Taille du texte">
            {(
              [
                { id: 'normal', label: 'Normal (100%)' },
                { id: 'lg', label: 'Grand (112%)' },
                { id: 'xl', label: 'Très grand (125%)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ...settings, textScale: opt.id })}
                aria-pressed={settings.textScale === opt.id}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                  settings.textScale === opt.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Guide */}
        <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-white hc-surface">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-900 mb-2">
            <Keyboard className="w-4 h-4 text-emerald-700" />
            <span>Navigation au clavier dans le tableur</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 hc-muted">
            <div>
              <strong className="font-mono-tabular">Flèches</strong> : Changer de cellule
            </div>
            <div>
              <strong className="font-mono-tabular">Entrée</strong> : Modifier ou valider la cellule
            </div>
            <div>
              <strong className="font-mono-tabular">Échap</strong> : Annuler la saisie en cours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
