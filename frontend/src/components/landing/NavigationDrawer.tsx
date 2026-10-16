import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRecovery: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onStartRecovery,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FAF5EF] text-[#2E2420] h-full shadow-2xl p-8 sm:p-10 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        <div>
          {/* Top Bar inside Drawer */}
          <div className="flex items-center justify-between pb-8 border-b border-[#E8DFC8]/60">
            <span className="font-editorial italic text-2xl tracking-normal text-[#2E2420]">
              Veil
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-6">
            <p className="text-xs font-semibold tracking-wider uppercase text-stone-600">
              Navigation
            </p>
            <ul className="space-y-4">
              {[
                { number: '01', title: 'The Approach', desc: 'Hormones & nervous system balance' },
                { number: '02', title: 'Telehealth Care', desc: 'Continuous clinical guidance' },
                { number: '03', title: 'Biomarkers & AI', desc: 'Adaptive diagnostic insights' },
                { number: '04', title: 'Clinical Care Team', desc: 'Specialized women’s health physicians' },
                { number: '05', title: 'Membership & Pricing', desc: 'Comprehensive monthly support' },
              ].map((item) => (
                <li key={item.number}>
                  <button
                    onClick={() => {
                      onClose();
                      onStartRecovery();
                    }}
                    className="group flex items-baseline justify-between w-full text-left py-1.5 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-600 group-hover:text-stone-900 transition-colors">
                          {item.number}
                        </span>
                        <span className="text-lg font-editorial font-medium text-[#2E2420] group-hover:text-stone-600 transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 ml-7 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Drawer Bottom Action */}
        <div className="pt-8 border-t border-[#E8DFC8]/60 space-y-4">
          <button
            onClick={() => {
              onClose();
              onStartRecovery();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-[#2E2420] text-white font-medium text-sm hover:bg-[#433530] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Start Your Recovery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-between text-xs text-stone-600 pt-2">
            <span>Clinical Support: 24/7</span>
            <span>board-certified care</span>
          </div>
        </div>
      </div>
    </div>
  );
};
