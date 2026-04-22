'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type Tone = 'info' | 'success' | 'warning' | 'danger';
interface Toast { id: string; tone: Tone; title: string; description?: string; }
interface Ctx { push: (t: Omit<Toast, 'id'>) => void; }

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const c = useContext(ToastCtx);
  if (!c) throw new Error('useToast outside ToastProvider');
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setList(prev => [...prev, { ...t, id }]);
    setTimeout(() => setList(prev => prev.filter(x => x.id !== id)), 5000);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="admin-toast-stack">
        {list.map(t => (
          <div key={t.id} className={`admin-toast admin-toast--${t.tone}`}>
            <div className="admin-toast-title">{t.title}</div>
            {t.description && <div className="admin-toast-desc">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
