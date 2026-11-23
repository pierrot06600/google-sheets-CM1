import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type AppView = 'course' | 'sandbox' | 'accessibility' | 'rgpd';

interface HeaderProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onStartCourse: () => void;
}

const NAV_ITEMS: Array<{ id: AppView; label: string }> = [
  { id: 'course', label: 'Cours guidé' },
  { id: 'sandbox', label: 'Modèles libres' },
  { id: 'accessibility', label: 'Accessibilité' },
  { id: 'rgpd', label: 'RGPD Mineurs' },
];

export function Header({ activeView, onSelectView, onStartCourse }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: AppView) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  const handlePrimaryCta = () => {
    onStartCourse();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 hc-surface">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNav('course')}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded"
        >
          Atelier Tableur CM1
        </button>

        {/* Zone 2: 4 single-line text nav links */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-6 xl:gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + tablet/mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrimaryCta}
            className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Ouvrir le cours
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive tablet/mobile drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Menu tablette et mobile"
          className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1 hc-surface"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left min-h-[44px] px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handlePrimaryCta}
            className="sm:hidden mt-2 w-full min-h-[44px] px-4 py-2.5 rounded-lg text-base font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Ouvrir le cours
          </button>
        </nav>
      )}
    </header>
  );
}
