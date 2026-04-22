'use client';

import { useState } from 'react';
import { Download, Loader } from 'lucide-react';

export interface ExportCsvButtonProps {
  type: 'participants' | 'leaderboard';
  label?: string;
  params?: Record<string, string>;
}

export default function ExportCsvButton({ type, label = 'Экспорт CSV', params }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const reqUrl = new URL(`/api/admin/csv`, window.location.origin);
      reqUrl.searchParams.set('type', type);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          reqUrl.searchParams.set(key, value);
        }
      }
      const res = await fetch(reqUrl.pathname + reqUrl.search);
      if (!res.ok) {
        const err = await res.text();
        alert(`Ошибка экспорта: ${err}`);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') ?? '';
      const m = /filename="([^"]+)"/.exec(cd);
      const filename = m?.[1] ?? `${type}.csv`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
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
