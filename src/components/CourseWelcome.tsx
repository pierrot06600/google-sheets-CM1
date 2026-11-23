import { ArrowRight, Award, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { COURSE_STEPS } from '../utils/courseCurriculum';

interface CourseWelcomeProps {
  completedCount: number;
  onStartCourse: () => void;
  onOpenSandbox: () => void;
  onOpenRgpd: () => void;
}

export function CourseWelcome({
  completedCount,
  onStartCourse,
  onOpenSandbox,
  onOpenRgpd,
}: CourseWelcomeProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch hc-surface">
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-3 hc-muted">
              <span>Programme CM1 (France)</span>
              <span aria-hidden="true">·</span>
              <span>5 étapes ludiques</span>
              <span aria-hidden="true">·</span>
              <span>Zéro compte requis</span>
            </div>

            <h1
              className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Découvre Google Sheets et deviens un champion des tableaux !
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed hc-muted">
              Apprends à te repérer dans les cellules comme à la bataille navale, crée ton planning
              de devoirs et d’activités favorites, et teste tes premières formules magiques dans un
              vrai simulateur interactif adapté aux tablettes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hc-surface">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1">
                <Award className="w-4 h-4 shrink-0" />
                <span>5 étapes guidées</span>
              </div>
              <p className="text-xs text-slate-600 hc-muted">
                Des missions simples avec des badges virtuels à débloquer.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hc-surface">
              <div className="flex items-center gap-2 text-sky-700 font-semibold text-sm mb-1">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Modèles prêts</span>
              </div>
              <p className="text-xs text-slate-600 hc-muted">
                Devoirs CM1, loisirs favoris et formules =SOMME pré-remplis.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hc-surface">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-1">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>100 % RGPD</span>
              </div>
              <p className="text-xs text-slate-600 hc-muted">
                Aucune donnée personnelle ni identification demandée.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onStartCourse}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <span>
                {completedCount > 0 ? `Reprendre le cours (${completedCount}/5)` : 'Commencer le cours'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onOpenSandbox}
              className="inline-flex items-center justify-center min-h-[48px] px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold text-base hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              Ouvrir les modèles libres
            </button>

            <button
              type="button"
              onClick={onOpenRgpd}
              className="text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900 py-2"
            >
              Charte RGPD Mineurs
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5 hc-surface">
          <div className="relative aspect-square max-h-[260px] w-full mx-auto rounded-xl overflow-hidden bg-[#F8FAFC] border border-slate-200 flex items-center justify-center">
            <img
              src="/src/assets/images/cm1_grid_mascot_1795406505579.jpg"
              alt="Chouette mascotte de l'atelier tableur CM1 devant un tableau coloré"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h2 className="font-display text-base font-bold text-slate-900 mb-2.5">
              Programme du parcours CM1
            </h2>
            <ol className="space-y-2">
              {COURSE_STEPS.map((step) => (
                <li key={step.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {step.number}. {step.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
