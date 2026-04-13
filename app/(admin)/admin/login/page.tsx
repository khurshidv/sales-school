'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const next = searchParams.get('next') || '/admin/overview';
      router.push(next);
      router.refresh();
    } else {
      setError('Неверный пароль');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '40px 36px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        width: 360,
      }}
    >
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Sales Up
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 28 }}>
        Admin Panel
      </h1>

      <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
        Пароль
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        required
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 14,
          border: '1px solid #d1d5db',
          borderRadius: 8,
          outline: 'none',
          marginBottom: 8,
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 0',
          background: loading ? '#9ca3af' : '#111827',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
          marginTop: 8,
        }}
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f5f7',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
