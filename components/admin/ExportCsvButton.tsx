'use client';

import { useState } from 'react';
import { Download, Loader } from 'lucide-react';

export interface ExportCsvButtonProps {
  type: 'participants' | 'leaderboard';
  label?: string;
}

export default function ExportCsvButton({ type, label = 'Экспорт CSV' }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/csv?type=${type}`);
      if (!res.ok) {
        const err = await res.text();
        alert(`Ошибка экспорта: ${err}`);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') ?? '';
      const m = /filename="([^"]+)"/.exec(cd);
      const filename = m?.[1] ?? `${type}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={onClick} disabled={loading} className="admin-btn">
      {loading ? <Loader size={14} /> : <Download size={14} />}
      {label}
    </button>
  );
}
