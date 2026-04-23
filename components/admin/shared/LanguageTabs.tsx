export type LanguageFilter = 'all' | 'uz' | 'ru';

const LABEL: Record<LanguageFilter, string> = { all: 'Все', uz: 'UZ', ru: 'RU' };
const ORDER: LanguageFilter[] = ['all', 'uz', 'ru'];

export function LanguageTabs({
  value, onChange,
}: { value: LanguageFilter; onChange: (v: LanguageFilter) => void }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--admin-bg-2)',
      border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2,
    }}>
      {ORDER.map(v => {
        const active = v === value;
        return (
          <button key={v} type="button" onClick={() => onChange(v)} style={{
            padding: '6px 12px', fontSize: 11, fontWeight: 600,
            border: 'none', borderRadius: 6, cursor: 'pointer',
            background: active ? 'var(--admin-bg)' : 'transparent',
            color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)',
          }}>{LABEL[v]}</button>
        );
      })}
    </div>
  );
}
