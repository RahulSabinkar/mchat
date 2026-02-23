import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getCopyright } from '@/data/questions';

interface LayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Layout({ children, showBackButton, onBack }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Link to="/" className="text-xl font-semibold text-slate-900 hover:text-primary-600 transition-colors">
              M-CHAT-R
            </Link>
          </div>
          <span className="text-sm text-slate-500 hidden sm:block">
            Autism Screening Tool
          </span>
        </div>
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto no-print">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>{getCopyright()}</p>
          <p className="mt-1">
            <a 
              href="https://mchatscreen.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              mchatscreen.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
