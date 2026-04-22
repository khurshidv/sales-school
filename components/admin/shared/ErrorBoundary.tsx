'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (err: Error, retry: () => void) => ReactNode;
}

interface State {
  err: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error) {
    console.error('[admin] error boundary', err);
  }

  retry = () => this.setState({ err: null });

  render() {
    if (this.state.err) {
      if (this.props.fallback) return this.props.fallback(this.state.err, this.retry);
      return (
        <div className="admin-card" style={{ padding: 24 }}>
          <h3>Ошибка загрузки</h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>
            {this.state.err.message}
          </p>
          <button className="admin-btn" onClick={this.retry}>
            Повторить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
