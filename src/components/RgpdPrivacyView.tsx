import { useState } from 'react';
import { Database, Lock, ShieldCheck, Trash2 } from 'lucide-react';

interface RgpdPrivacyViewProps {
  onWipeLocalData: () => void;
}

export function RgpdPrivacyView({ onWipeLocalData }: RgpdPrivacyViewProps) {
  const [wipedNotice, setWipedNotice] = useState(false);

  const handleWipe = () => {
    onWipeLocalData();
    setWipedNotice(true);
  };

  return (
    <section className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hc-surface">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Protection des Mineurs & Conformité RGPD
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-600 hc-muted">
          Cet atelier pédagogique est conçu selon le principe de minimisation absolue des données (Article 8 du RGPD et recommandations de la CNIL pour les élèves du primaire).
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hc-surface">
            <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 mb-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Zéro identification</span>
            </div>
            <p className="text-sm text-slate-600 hc-muted">
              Aucun nom, prénom, adresse e-mail, photo ou identifiant scolaire n’est demandé ni enregistré. L’élève accède immédiatement au cours.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hc-surface">
            <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 mb-2">
              <Database className="w-4 h-4 text-sky-700" />
              <span>Stockage 100 % local</span>
            </div>
            <p className="text-sm text-slate-600 hc-muted">
              La progression des 5 étapes et les préférences d’accessibilité restent uniquement dans la mémoire locale de cet appareil. Aucun serveur tiers ne reçoit d’information.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hc-surface">
            <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Zéro cookie traceur</span>
            </div>
            <p className="text-sm text-slate-600 hc-muted">
              Aucune publicité, aucun pixel de suivi, aucune télémétrie comportementale. Tout fonctionne localement sur la tablette ou l’ordinateur.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Droit à l’effacement immédiat
            </h3>
            <p className="text-xs text-slate-600 mt-1 hc-muted">
              Supprime en un clic toute la progression locale et remet les exercices à zéro.
            </p>
          </div>

          <button
            type="button"
            onClick={handleWipe}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tout effacer (RGPD)</span>
          </button>
        </div>

        {wipedNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-sm font-semibold text-emerald-900">
            Toutes les données locales ont été effacées de cet appareil.
          </div>
        )}
      </div>
    </section>
  );
}
